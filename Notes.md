# Bookimbiber — start here

**Read this first:** first job is the 1.3.0 production build (job 1). Everything is ready on branch **`sdk-upgrade`** (SDK 57, tested on the phone, version already bumped to 1.3.0; not merged, not pushed). The phone currently has **no** Bookimbiber installed (dev build removed 2026-10-07). EAS free-tier builds can queue for hours.

## Position (2026-10-07)

- **SDK 57 upgrade passed testing** on a dev build (2026-10-07): drawer, icons, confetti, auth screens, splash, scanner and ISBN lookups all fine. Some ISBNs genuinely aren't in Google Books or the DNB; that's a data gap, not a bug (Open Library could be a third fallback).
- **1.2.0 is live** on Play's internal testing track (versionCode 18), installed on the user's phone and working. Distribution is internal testing only (testers added by email); no closed/production releases planned. The old closed-testing release (1.1.0, versionCode 16) is still on that track.
- Backend: Firebase Auth + Firestore (Appwrite deleted). Merged into `master` as `e64eb4e` (2026-10-07) and pushed; the `firebase-migration` branch has been deleted.
- Book search uses the user's own Google Books API key (key "Bookimbiber Books" in Google Cloud project `react-http-7b17c`, restricted to Books API). ISBN lookups fall back to the German National Library (`lib/dnb.js`) when Google has no record, which is common for German editions.
- `.env` holds six `EXPO_PUBLIC_FIREBASE_*` values plus `EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY`; all seven are also in EAS (development, preview, production). Re-push after any `.env` change: see `EASCheatsheet.md` → *Firebase config*.
- EAS keeps the Android versionCode remotely (`appVersionSource: "remote"`, currently 18; the 1.3.0 build will be 19). `--auto-submit` uses the Rooster Recipes Play service account key, stored in Bookimbiber's EAS credentials.
- Git history was rewritten on 2026-10-06 to remove `login-data.txt` and the `.jks`; hashes from before then changed.

## Next jobs

1. **Release 1.3.0:** run `eas build -p android --profile production --auto-submit` (version is already 1.3.0 in `app.json`/`package.json`; EAS assigns versionCode 19 and submits to internal testing with the stored Play key). Then install from the tester link on the phone, check Settings → Apps shows 1.3.0, log in, search, scan.
2. **Merge** `sdk-upgrade` into `master` (merge commit), delete the branch, and push (ask first).
3. SDK 58: was in beta (`next` tag) on 2026-10-07. Upgrade once it's stable, on its own branch, using the `expo:expo-upgrade` skill.

## Parked (unpark when the user asks)

- `eas.json`: `appVersionSource: "remote"` is set (2026-10-07). Still parked: raise `cli.version`, fill in `submit.production`.
- `app.json`: add `adaptiveIcon.monochromeImage`, add a notification `icon`/`color` to the `expo-notifications` plugin.
- Unused code: `lib/imageOptimization.js`, `lib/android14Features.js`, `lib/avatar.js`, `lib/cache-util.js`, `hooks/useEdgeToEdge.js` (nothing imports them); series view in `app/(dashboard)/books.jsx` was never implemented (`viewMode` unused). Delete or build out.
- About 40 `console.log` calls.

## Facts worth not recomputing

- Firebase project: `react-http-7b17c`, shared with other hobby apps (their data is in the Realtime DB). Bookimbiber uses the `(default)` Firestore database only.
- Data paths: `bookimbiber_users/{uid}/books/{id}` and `.../authors/{id}`; rules in `firestore.rules` (repo copy of what's published).
- Code entry points: `lib/firebase.js` (init, `userCollection`, `userDoc`, `fromSnapshot`), `contexts/UserContext.jsx` (user = `{ id, name, email }`, `deleteAccount(password)`), `contexts/BooksContext.jsx`, `contexts/AuthorContext.jsx`.
- Realtime DB rules: `recipe` write and `expenses` read/write locked to the owner's UID; `orders`/`meals`/`goals` writes are open until 1 Jan 2027 (`now < 1798718400000`).
- Expo/EAS project ID `857bd7f6-dcc6-4786-9aed-5e8e74ef8e50`; Android package `com.petereasterbro1.bookimbiber2025`; scheme `bookimbiber2025`; `runtimeVersion` policy `appVersion`.
- App name is **Bookimbiber** (one word) everywhere.
- Plan and decisions: `docs/firebase-migration.md`. Build/deploy workflow: `EASCheatsheet.md`.

## Working cheaply

- To check `.env` without opening it: `npx expo config --type public | grep ^env:` lists the variable names it loads. Reading `.env` or `admin-data.txt` directly gets blocked.
- `git commit -- <paths>` re-adds files that were `git rm --cached` but still exist on disk. Stage the removal, then commit **without** a path list.
- `npx expo install --fix` may fail at the final "apply config plugins" step after upgrading `expo` itself mid-run. The version fixes have already applied; verify with `npx expo install --check`.
- `babel-preset-expo` and `@expo/vector-icons` must stay direct dependencies (both broke bundling when only reachable through `expo`).
- `expo-file-system` no longer needs to be a direct dependency or override (that rule existed only for `react-native-appwrite`).

## How the user works

- Windows, VS Code, bash, PowerShell; Android + web only.
- Wants plain explanations and an appraisal before big changes. Confirm before pushing or other outward-facing actions.
