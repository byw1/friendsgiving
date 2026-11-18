import { Pool, type PoolClient } from "pg";
import { SEED_ITEMS } from "./event";

declare global {
  // eslint-disable-next-line no-var
  var __fgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __fgReady: Promise<void> | undefined;
}

function makePool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const isInternal = url.includes(".railway.internal") || url.includes("localhost") || url.includes("127.0.0.1");
  return new Pool({
    connectionString: url,
    max: 5,
    ssl: isInternal ? false : { rejectUnauthorized: false },
  });
}

const SCHEMA = `
create table if not exists guests (
  id serial primary key,
  email text not null unique,
  name text not null,
  status text not null default 'going' check (status in ('going','maybe','cant')),
  plus_ones int not null default 0 check (plus_ones between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists items (
  id serial primary key,
  slug text unique,
  category text not null,
  label text not null,
  hint text,
  need int not null default 1,
  sort int not null default 0
);

create table if not exists claims (
  id serial primary key,
  guest_id int not null references guests(id) on delete cascade,
  item_id int references items(id) on delete cascade,
  label text,
  note text,
  created_at timestamptz not null default now(),
  check (item_id is not null or label is not null)
);
create index if not exists claims_guest_idx on claims(guest_id);
create index if not exists claims_item_idx on claims(item_id);

alter table guests alter column email drop not null;

create table if not exists login_tokens (
  token_hash text primary key,
  guest_id int not null references guests(id) on delete cascade,
  expires_at timestamptz not null
);
`;

async function init(pool: Pool) {
  const client = await pool.connect();
  try {
    await client.query("select pg_advisory_lock(424242)");
    await client.query(SCHEMA);
    await seed(client);
  } finally {
    await client.query("select pg_advisory_unlock(424242)").catch(() => {});
    client.release();
  }
}

async function seed(client: PoolClient) {
  const slugs = SEED_ITEMS.map((i) => i.slug);
  for (const [sort, item] of SEED_ITEMS.entries()) {
    await client.query(
      `insert into items (slug, category, label, hint, need, sort)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (slug) do update set category = excluded.category, label = excluded.label,
         hint = excluded.hint, need = excluded.need, sort = excluded.sort`,
      [item.slug, item.category, item.label, item.hint ?? null, item.need, sort]
    );
  }
  // Items removed from the config disappear. Anyone who already claimed one keeps it as a free-text extra.
  await client.query(
    `update claims c set label = i.label, item_id = null from items i
      where c.item_id = i.id and i.slug is not null and not (i.slug = any($1))`,
    [slugs]
  );
  await client.query(`delete from items i where i.slug is not null and not (i.slug = any($1))`, [slugs]);
  // Free-text extras that match a list item by name ("pizza" -> Pizza) move onto that item.
  await client.query(
    `update claims c set item_id = i.id, label = null from items i
      where c.item_id is null and lower(trim(c.label)) = lower(i.label)
        and not exists (select 1 from claims d where d.guest_id = c.guest_id and d.item_id = i.id)`
  );
}

export async function db(): Promise<Pool> {
  if (!globalThis.__fgPool) globalThis.__fgPool = makePool();
  const pool = globalThis.__fgPool;
  if (!globalThis.__fgReady) {
    globalThis.__fgReady = init(pool).catch((err) => {
      globalThis.__fgReady = undefined;
      throw err;
    });
  }
  await globalThis.__fgReady;
  return pool;
}
