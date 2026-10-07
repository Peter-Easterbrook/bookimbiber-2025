# CLAUDE.md

Bookimbiber (one word) is a personal reading tracker: Expo / React Native app for **Android and web only** (iOS config is unused). Users catalogue books, search Google Books or scan ISBN barcodes, mark books read, and follow authors for new-release notifications.

**Start every session by reading `Notes.md`**: current position, next jobs, parked work, and known pitfalls.

## Where things are documented

- `Notes.md`: start-here note (state, next jobs, facts not worth recomputing).
- `EASCheatsheet.md`: build, OTA update, env variables, release workflow and checklist. Read it before any build, `eas update`, version bump or dependency change.
- `docs/firebase-migration.md`: why and how the backend moved from Appwrite to Firebase, data model, rules, test checklist.
- `README.md`: features, setup, project layout.

## Stack

- Expo SDK 55, React Native 0.83, React 19, Expo Router (file-based; route groups `app/(auth)` and `app/(dashboard)`, each with its own `_layout.jsx`). Exact versions: `package.json`.
- **Firebase JS SDK** (`firebase`, not `@react-native-firebase`): Auth (email/password) + Cloud Firestore. Set up in `lib/firebase.js`.
- Google Books API via `lib/googleBooks.js`, with AsyncStorage caching in `utils/api-cache.js`.
- State in React Context: `contexts/UserContext.jsx`, `BooksContext.jsx`, `AuthorContext.jsx`, `ThemeContext.jsx`, read through `hooks/useUser`, `useBooks`, `useAuthors`.
- Builds and OTA updates with EAS; `runtimeVersion` policy `appVersion`.

## Data and auth

- Firebase project `react-http-7b17c` is **shared with other hobby apps**. Bookimbiber owns only the `(default)` Firestore database's `bookimbiber_users/{uid}/books` and `.../authors` subcollections. The other apps use the Realtime Database.
- Auth accounts are project-wide: one email is one account across all those apps, so `deleteAccount` removes the login everywhere.
- Build every Firestore path with `userCollection(uid, name)` / `userDoc(uid, name, id)` and map snapshots with `fromSnapshot` (adds `id`, converts Timestamps to ISO strings). All from `lib/firebase.js`.
- The app's user object is `{ id, name, email }` (from `UserContext`). Documents use `id`; there are no Appwrite `$id` / `$createdAt` fields any more.
- Security rules: `firestore.rules` is the repo copy; it is published by pasting into the Firebase console. A rules change for one app must keep the other apps' blocks.
- Firebase config comes from six `EXPO_PUBLIC_FIREBASE_*` variables: `.env` locally (gitignored), EAS environment variables for builds.

## Conventions

- UI uses the `Themed*` components in `components/` (light/dark via `ThemeContext`, colours in `constants/Colors.js`, fonts Berlin Sans FB). Pressables use `android_ripple` with the theme's `rippleColor`.
- Any new Google Books (or other quota-limited) API call goes through `apiCache` with a TTL: ISBN 7 days, author searches 24 hours, general searches 6 hours. Cache empty results too. User-triggered refreshes use the `Debouncer` from `utils/api-cache.js` (new-release check: once an hour).
- Install Expo / React Native packages with `npx expo install <pkg>` so versions match the SDK; check with `npx expo install --check` and `npx expo-doctor`.
- Any native change (adding or removing a native package, `app.json` plugins/permissions/intent filters, `app.plugin.js`, SDK upgrade) needs a version bump (`npm run bump-version`) and a new build, never an OTA update.
- No test framework. Verify changes with `npx expo export --platform android` (catches bad imports), then on a dev build.

## Gotchas

- Keep `babel-preset-expo` a direct devDependency: npm once left it nested inside `expo`, which broke bundling.
- `.env` and `admin-data.txt` hold credentials: reading them is blocked. To see which variables `.env` defines, run `npx expo config --type public` and read the `env:` line.
- Force-pushes are blocked in auto mode: give the user the command to run.

## Unused code

`lib/imageOptimization.js`, `lib/android14Features.js`, `lib/avatar.js`, `lib/cache-util.js` and `hooks/useEdgeToEdge.js` are not imported anywhere. Series detection is not implemented (`viewMode` in `app/(dashboard)/books.jsx` is unused). Check before building on any of them.
