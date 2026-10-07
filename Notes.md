# Bookimbiber — start here

**Read this first:** the Firebase migration is finished and released. Next job is the Expo SDK upgrade (job 1 below).

## Position (2026-10-07)

- **1.2.0 is live** on Play's internal testing track (versionCode 18), installed on the user's phone and working. Distribution is internal testing only (testers added by email); no closed/production releases planned. The old closed-testing release (1.1.0, versionCode 16) is still on that track.
- Backend: Firebase Auth + Firestore (Appwrite deleted). Merged into `master` as `e64eb4e` (2026-10-07); branch `firebase-migration` can be deleted once `master` is pushed.
- Book search uses the user's own Google Books API key (key "Bookimbiber Books" in Google Cloud project `react-http-7b17c`, restricted to Books API). ISBN lookups fall back to the German National Library (`lib/dnb.js`) when Google has no record, which is common for German editions.
- `.env` holds six `EXPO_PUBLIC_FIREBASE_*` values plus `EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY`; all seven are also in EAS (development, preview, production). Re-push after any `.env` change: see `EASCheatsheet.md` → *Firebase config*.
- EAS keeps the Android versionCode remotely (`appVersionSource: "remote"`, currently 18). `--auto-submit` uses the Rooster Recipes Play service account key, stored in Bookimbiber's EAS credentials.
- Git history was rewritten on 2026-10-06 to remove `login-data.txt` and the `.jks`; hashes from before then changed.

## Next jobs

1. **Upgrade the Expo SDK.** App is on SDK 55; latest stable is 57 (Jun 2026); 58 was in beta (`next` tag) on 2026-10-07. Go one SDK at a time (55 → 56 → 57 → 58 once stable) on a branch: `npx expo install expo@^N --fix`, read that SDK's breaking changes, `npx expo-doctor`, dev build, test. Rooster Recipes and ESL Exercises are already on 57. Use the `expo:expo-upgrade` skill. A native change, so release as a new version (bump, build), never OTA.
2. Dev build for testing: `eas build --profile development -p android`. It can't coexist with the Play install (different signing keys): uninstall one to install the other. Run `npx expo start --dev-client -c` in the project folder; the phone must be on the same Wi-Fi.

## Parked (unpark when the user asks)

- `eas.json`: `appVersionSource: "remote"` is set (2026-10-07). Still parked: raise `cli.version`, fill in `submit.production`.
- `app.json`: move `splash` into the `expo-splash-screen` plugin, add `adaptiveIcon.monochromeImage`, add a notification `icon`/`color` to the `expo-notifications` plugin.
- Unused code: `lib/imageOptimization.js`, `lib/android14Features.js`, `lib/avatar.js`, `lib/cache-util.js`, `hooks/useEdgeToEdge.js` (nothing imports them); series view in `app/(dashboard)/books.jsx` was never implemented (`viewMode` unused). Delete or build out.
- About 40 `console.log` calls; `react-native-reanimated/plugin` in `babel.config.js` is probably redundant on SDK 55.

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
- `babel-preset-expo` must stay a direct devDependency (npm once left it nested inside `expo`, which broke bundling).
- `expo-file-system` no longer needs to be a direct dependency or override (that rule existed only for `react-native-appwrite`).

## How the user works

- Windows, VS Code, bash, PowerShell; Android + web only.
- Wants plain explanations and an appraisal before big changes. Confirm before pushing or other outward-facing actions.
