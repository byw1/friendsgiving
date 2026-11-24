<div align="center">

# 🦃 Friendsgiving

**A cheerful little "who's bringing what" site for your potluck.**

No accounts. No spreadsheets. No group-chat chaos where four people bring mac & cheese.
Guests tap **+**, type their name, done. Gobbles the turkey handles the rest.

<img src="docs/images/hero.png" alt="The Friendsgiving homepage with Gobbles the turkey, the party date chips and a countdown" width="760">

</div>

---

## What it does

- **A bring list with goals.** Each item says how many you need ("Turkey ×2"), so the site nudges people with "need 1 more" until it's covered. A progress bar fills up as the list does.
- **Zero sign-up.** Guests pick or type their name. Their browser remembers them for next time.
- **Anyone can edit anything.** It's a party among friends, not a bank. Someone forgot to add their pie? Tap their name and fix it.
- **"Which one?" pickers.** For drinks (or anything with options), guests choose *what* they're bringing, and options someone already grabbed are marked so you don't end up with eleven bottles of wine.
- **"Add another" in every category,** plus a "Bringing something else?" box for the speaker, the board games, grandma's lumpia.
- **Hosts get a gold crown.** Any guest whose name is made of host names ("Sam", "Sam & Alex") gets a shiny HOST badge and sits at the top of the list.
- **A countdown, confetti, and a turkey that talks.** Obviously.
- **Built for phones.** That's where everyone's going to open the link.

RSVPs aren't handled here on purpose. Keep using Partiful, Luma, Evite, or a group chat for that, and drop the link in so the site points people to it.

<table>
  <tr>
    <td width="58%"><img src="docs/images/bring-list.png" alt="The bring list with categories, a progress bar and plus buttons"></td>
    <td width="42%"><img src="docs/images/mobile.png" alt="The bring list on an iPhone"></td>
  </tr>
  <tr>
    <td><img src="docs/images/drinks-picker.png" alt="The 'What alcohol are you bringing?' picker"></td>
    <td><img src="docs/images/whos-bringing.png" alt="Who's bringing what, with the hosts on top in gold"></td>
  </tr>
</table>

---

## 🚀 Throw your own in ~10 minutes

You need a free [GitHub](https://github.com) account and a [Railway](https://railway.com) account. Railway runs the site and its database for a few cents a month (the trial credit easily covers a party).

### 1. Fork it

Hit **Fork** at the top of this page. You now have your own copy to customize.

### 2. Make it your party

Open **`src/lib/event.ts`** in your fork (you can edit right on GitHub with the ✏️ button). Everything about the party lives in this one file:

```ts
export const EVENT = {
  title: "Friendsgiving",                 // the big headline
  startsAt: "2026-11-22T02:00:00.000Z",   // party start in UTC, drives the countdown
  timeZone: "America/Los_Angeles",
  dateLabel: "Saturday, November 21",
  shortDateLabel: "Sat, Nov 21",          // the date chip + link previews
  timeLabel: "6:00 PM",
  place: "The Penthouse",                 // shown as "Friendsgiving at The Penthouse"
  rsvpName: "Partiful",                   // what the RSVP buttons say
  rsvpUrl: process.env.RSVP_URL || ...,   // set with an env var, see below
};

export const HOSTS = [
  { name: "William", role: "Host", plan: "" },   // 👈 swap in your names
  { name: "Marko",   role: "Host", plan: "" },
];
```

> 💡 **Getting `startsAt` right:** it's in UTC. 6 PM Pacific on Nov 21 is `2026-11-22T02:00:00.000Z`. Not sure? Ask any search engine "6pm PST in UTC".

> 🔒 **Privacy tip:** `place` is shown to anyone with the link, so a fun nickname ("The Penthouse", "Casa Jordan") is nicer than a street address. Put the real address in your RSVP invite.

### 3. Pick what people should bring

Further down in the same file is `SEED_ITEMS`. Add, remove, or rename anything:

```ts
{ slug: "pie", category: "dessert", label: "Pie", hint: "pumpkin, apple, pecan", need: 2 },

// Add `options` to get a "which one?" picker:
{ slug: "chasers", category: "drinks", label: "Chasers & mixers", need: 2,
  options: ["Coke", "Sprite", "Ginger beer", "Tonic"] },
```

| Field | What it does |
| --- | --- |
| `slug` | A unique id. **Don't change it after guests start signing up**, or their pick moves to "something else". |
| `category` | One of the keys in `CATEGORIES` (`mains`, `sides`, `dessert`, `drinks`, `supplies`). Add your own there too. |
| `label` | What guests see. |
| `hint` | Optional little grey helper text. |
| `need` | How many of this you want. The list shows "need N more" until it's full. |
| `options` | Optional list of choices for the "which one?" picker. |

The list syncs to the database every time the site starts, so editing it later is safe: change the file, push, and Railway redeploys. Removing an item doesn't lose anyone's sign-up; it moves to their "something else".

### 4. Deploy on Railway

1. In Railway, click **New Project → Deploy from GitHub repo** and pick your fork.
2. In the same project, click **+ Create → Database → PostgreSQL**.
3. Open your web service → **Variables** and add:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Railway fills this in for you) |
   | `RSVP_URL` | *Optional.* Your Partiful / Luma / Evite link. Leave it out to hide the RSVP buttons. |
   | `APP_URL` | *Optional.* Only if you add a custom domain, e.g. `https://turkey.example.com`. Used for link previews. |

4. Go to **Settings → Networking → Generate Domain**. That's your link. 🎉

No database setup needed: the tables create themselves on first boot.

### 5. Share the link

Paste it in the group chat. Watch the list fill up. Gobble responsibly.

---

## 🎨 Make it extra yours

- **Link preview image.** When you text the link, iMessage/Slack/WhatsApp show `public/og.jpg` (and `public/og.mp4` as an animated preview where supported). Swap in your own 1080×1350 image. Previews are cached hard, so add `?v=2` to the link to force a refresh.
- **Flyer.** `flyer/flyer-fun.html` and `flyer/flyer.html` are animated poster pages. Open one in a browser, edit the text, and screen-record it for your Instagram story.

  <img src="docs/images/flyer.jpg" alt="The animated party flyer with a neon sign and a 3D turkey" width="260">

- **Colors and fonts** live in `src/app/globals.css`. The look is chunky buttons, Nunito, and lots of bright color.
- **Gobbles's lines** (the speech bubble) are in `src/components/Hero.tsx`.
- **Not a Friendsgiving?** Change `title`, swap the categories, and it's a birthday picnic, a game night, or a camping trip packing list. The turkey can stay. We insist.

---

## 💻 Run it on your computer

You'll need [Node.js 20+](https://nodejs.org) and a Postgres database (local, Docker, or a free one from Railway/Neon/Supabase).

```bash
git clone https://github.com/<you>/friendsgiving.git
cd friendsgiving
npm install
cp .env.example .env.local     # then set DATABASE_URL
npm run dev
```

Open http://localhost:3000.

Quickest Postgres with Docker:

```bash
docker run -d --name fg-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fg -p 5432:5432 postgres:16
# DATABASE_URL=postgres://postgres:postgres@localhost:5432/fg
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the build (uses `$PORT`, defaults to 3000) |
| `npm run lint` | Type-check |

### How it's built

[Next.js](https://nextjs.org) + React, [Tailwind CSS](https://tailwindcss.com), [Motion](https://motion.dev) for the bounces, [Lucide](https://lucide.dev) icons, and plain Postgres via `pg`.

```
src/lib/event.ts      ← 👈 the only file most people need to touch
src/lib/db.ts         tables + syncing the bring list on boot
src/app/api/          tiny JSON API for guests and claims
src/components/       the UI (Hero, BringList, People, Turkey, ...)
public/og.*           link preview image + video
flyer/                animated party flyers
```

---

## FAQ

**Can people mess with the list?** Yes, anyone with the link can edit anything. That's the point: it's for friends. Don't post the link publicly.

**Can I reuse it next year?** Update the date in `event.ts`. To start with a fresh list, wipe the guests in Railway's Postgres **Data** tab (or just create a new database).

**Does it do RSVPs?** Nope, on purpose. Your invite tool already does that well. This site only answers "who's bringing what?"

<div align="center">
<br>
Made with 🥧 for Friendsgiving. Go throw a good party.
</div>
