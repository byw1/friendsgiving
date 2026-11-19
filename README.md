# Friendsgiving

RSVP + potluck sign-up site for Friendsgiving (Sat Nov 21, 6 PM).

- Guests RSVP with name + email (going / maybe / can't go). Their browser stays signed in.
- To edit from another device they get a magic sign-in link by email (Resend). No passwords.
- The bring list is claimable; anyone can add "something else".

## Editing the party details
Everything lives in `src/lib/event.ts`: date, place, the hosts' plans, and the list of items.
Items sync to the database on boot (by `slug`), so edit the file and redeploy.

## Env vars
See `.env.example`. `DATABASE_URL`, `SESSION_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL`, `PARTIFUL_URL`.

## Dev
```
npm i
npm run dev
```
