# Bookimbiber — start here

**Read this first:** 1.2.0 (versionCode 18) is built and live on Play's **internal testing** track, but the user's phone was still being served the old closed-testing 1.1.0 (versionCode 16) on 2026-10-07. Everything on the Play side was checked (Gmail in the ticked testers list, invite accepted, Play Store cache cleared); waiting for propagation. Next: confirm 1.2.0 installs and works, then merge (job 6).

## Position (2026-10-07)

- Backend moved from Appwrite (deleted) to Firebase Auth + Firestore. All code is on branch **`firebase-migration`** (migration commit `3592421`), pushed to GitHub, **not merged** into `master`.
- Git history was rewritten (2026-10-06) to remove `login-data.txt` and the `.jks` from every commit, then force-pushed (`master`, `claude-edits`, `firebase-migration`). Every commit hash from before then changed.
- Verified: `expo-doctor` 20/20, `npx expo export --platform android` bundles, web app runs, and a new account was registered successfully in the browser.
- Firestore rules and Realtime DB rules are published in the console. `.env` holds the six `EXPO_PUBLIC_FIREBASE_*` values plus `EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY` (gitignored, local only).
- Book search works with the user's own Google Books API key (key "Bookimbiber Books" in Google Cloud project `react-http-7b17c`, restricted to Books API). ISBN lookups fall back to the German National Library (`lib/dnb.js`) when Google has no record, which is common for German editions.
- App version is still 1.1.3. On Play the app is on the **closed testing** track (last release `bookimbiber-26`, versionCode 16, 8 Mar 2026). That build can't log in until 1.2.0 ships (expected; no active testers besides the user).

## Next jobs

1. ✅ Firebase config is in EAS (all six variables, done 2026-10-07). If `.env` changes, re-push: see `EASCheatsheet.md` → *Firebase config*.
2. ✅ Dev build installed on the phone (2026-10-07). To use it: in the project folder run `npx expo start --dev-client -c`, then open Bookimbiber on the phone (same Wi-Fi) and tap the server it lists, or scan the terminal's QR code.
3. ✅ Phase 3 tests all passed on the dev build (2026-10-07).
4. ✅ Google Books key pushed to EAS (all three environments).
5. ✅ 1.2.0 built (`eas build -p android --profile production --auto-submit`) and submitted to internal testing. EAS reused the Rooster Recipes Play service account key (`../recipe-rooster-2025/google-play-key.json`), now stored in Bookimbiber's EAS credentials. The remote versionCode is now 18. **Still to check:** the phone gets 1.2.0 from Play (Settings → Apps → Bookimbiber shows 1.2.0), then log in, search, scan a German ISBN. If Play keeps serving 1.1.0: last resort is uninstall + reinstall from the tester link, or promote 1.2.0 to closed testing (needs Google review).
6. Merge `firebase-migration` into `master` and push (ask the user before pushing; auto mode blocks force-pushes, so the user runs those).
7. **Upgrade the Expo SDK** after the merge (not before: keep Firebase and SDK changes separate). App is on SDK 55; latest stable is 57 (Jun 2026); 58 was in beta (`next` tag) on 2026-10-07. Go one SDK at a time (55 → 56 → 57 → 58 once stable): `npx expo install expo@^N --fix`, read that SDK's breaking changes, `npx expo-doctor`, dev build, test. Rooster Recipes and ESL Exercises are already on 57. Use the `expo:expo-upgrade` skill.

Done: Phase 5 docs (`CLAUDE.md`, `EASCheatsheet.md`, `README.md` rewritten for Firebase); Appwrite agent skills removed (their symlinks broke `eas build` on Windows). Web demos via EAS Hosting were considered and dropped (2026-10-07): not worth the effort.

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
