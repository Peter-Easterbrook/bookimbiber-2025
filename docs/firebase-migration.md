# Migration plan: Appwrite → Cloud Firestore

> **Status:** Appwrite deleted; Phase 2 code done on branch `firebase-migration` (2026-10-06); Phase 3 testing next · **Target release:** 1.2.0 (new native build)
> **Firebase project:** `react-http-7b17c`, shared with other hobby apps; Book Imbiber uses the `(default)` Firestore database

## Why

- Appwrite's free plan pauses idle projects every couple of weeks and has to be resumed by hand.
- Firebase's free Spark plan doesn't pause idle projects. Its quotas (about 50k reads and 20k writes a day, 1 GiB stored) are far above what this app uses.
- The only active user is the developer, and all Appwrite data is test data. **No data is migrated**, and the Appwrite project can be deleted outright.

## Decisions

| Decision | Choice | Reason |
| --- | --- | --- |
| Database | **Cloud Firestore**, not Realtime Database | The data is already per-user documents with "where `userId` == … order by date" queries. Firestore does this natively. `onSnapshot` replaces `client.subscribe`, and security rules replace `Permission` / `Role.user`. |
| SDK | **Firebase JS SDK** (`firebase`), not `@react-native-firebase` | Pure JS: no `google-services.json`, no config plugins, no native modules, and it works on web too. Login persists through `getReactNativePersistence(AsyncStorage)`. The trade-off is memory-only offline caching, which is acceptable here. |
| Existing data | **Discard** | Test data only. Appwrite project already deleted. |
| Firebase project | **Shared `react-http-7b17c`** | Its Firestore was unused (the other apps use its Realtime Database, which has separate rules). Only the `(default)` Firestore database is free, so Book Imbiber lives there under a `bookimbiber_` prefix. |
| Supabase? | No | Its free tier also pauses inactive projects. |

## What changes

Appwrite is used in only five files. Screens talk to the contexts, so most UI code is untouched.

| File | Appwrite usage | Firebase replacement |
| --- | --- | --- |
| `lib/appwrite.js` | `Client`, `Account`, `Databases`, `Storage`, `Avatars` | `lib/firebase.js`: `initializeApp`, `initializeAuth` with AsyncStorage persistence, `getFirestore` |
| `contexts/UserContext.jsx` | `account.create / get / getSession / createEmailPasswordSession / deleteSession / updateName / updatePassword / createRecovery / updateRecovery` | `createUserWithEmailAndPassword`, `onAuthStateChanged`, `signInWithEmailAndPassword`, `signOut`, `updateProfile`, `reauthenticateWithCredential` + `updatePassword`, `sendPasswordResetEmail`, **new** `deleteUser` |
| `contexts/BooksContext.jsx` | `databases.*Document(s)`, `Query.equal / orderDesc`, `client.subscribe` | `addDoc`, `getDocs` + `query(orderBy)` on the user's subcollection, `updateDoc`, `deleteDoc`, `onSnapshot` |
| `contexts/AuthorContext.jsx` | Same as BooksContext | Same as BooksContext |
| `app/(auth)/login.jsx` | Handles the `reset-password` deep link | Delete that handling (Firebase hosts the reset page) |

Appwrite system fields are used about 63 times in 7 files (`BooksContext`, `AuthorContext`, `UserContext`, `books.jsx`, `profile.jsx`, `NewReleasesCard.jsx`, `AuthorFollowButton.jsx`):

- `$id` → `id`. Map every snapshot document to `{ id: doc.id, ...doc.data() }`.
- `$createdAt` → `createdAt`, written with `serverTimestamp()` and read with `.toDate()`.

## Shared-project rules of the road

`react-http-7b17c` hosts several apps, so:

- **Auth users are shared.** One email means one account across every app on this project. Book Imbiber's **Delete account** deletes it everywhere. Keep this in mind when testing, or test with a dedicated email.
- **Firestore rules are one file per database.** Each app owns one top-level prefix and adds its own `match` block. Never deploy a rules file that drops another app's block.
- **Email templates are project-wide** (Authentication → Templates). The password-reset email shows the project's *public-facing name*, which is set in Project settings → General.
- **Quotas are pooled** across all apps on the project. That's no concern at hobby scale.

## Data model

Per-user subcollections under an app-specific prefix:

```
bookimbiber_users/{uid}                 // optional profile doc; not needed initially
bookimbiber_users/{uid}/books/{autoId}
  title, author, description, ... (same fields as today, minus userId)
  read: boolean, completedDate: timestamp | null
  seriesName, bookNumber, seriesConfidence
  createdAt: timestamp      // serverTimestamp()

bookimbiber_users/{uid}/authors/{autoId}
  authorName, authorId, booksCount, genres, lastChecked, isActive
  createdAt: timestamp
```

Why subcollections:
- Ownership comes from the path, so there's no `userId` field to check or keep consistent.
- `orderBy('createdAt', 'desc')` inside one subcollection uses Firestore's automatic single-field indexes, so **no composite indexes are needed**.
- Account deletion is "delete everything under `bookimbiber_users/{uid}`".

Check the field list against what `BooksContext` and `AuthorContext` actually write.

### Security rules (`firestore.rules`)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    // --- Book Imbiber ---
    match /bookimbiber_users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // --- other apps add their own blocks here ---
  }
}
```

Anything not matched is denied by default. If the Firestore database was created in **test mode**, its current rules allow everything until an expiry date. Replace them with the above before Book Imbiber writes any data.

## Plan of action

### Phase 0: Appwrite shutdown ✅ done (2026-10-06)

1. Appwrite project deleted. The 1.1.x build on Play can no longer log in until 1.2.0 ships.

### Phase 1: Firebase setup (project `react-http-7b17c`)

Console: https://console.firebase.google.com/project/react-http-7b17c

2. **Register a web app for Book Imbiber.** Go to the ⚙️ gear (Project settings) → **General** → **Your apps** → **Add app** → the **Web** icon (`</>`). Nickname it "Book Imbiber"; skip Firebase Hosting.
3. **Get the config keys.** Same page → **Your apps** → select *Book Imbiber* → **SDK setup and configuration** → **Config**. It shows a `firebaseConfig` object with `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`. You can come back to this page any time to see them again.
4. **Authentication** → **Sign-in method**: make sure **Email/Password** is enabled. Other apps may already have done this.
5. **Firestore Database** → **Rules** tab: paste in `firestore.rules` from the repo and **Publish**. (The database's location was fixed when it was created; there's nothing to do about it.)
6. While there, check that the **Realtime Database rules** aren't left fully open (`".read": true, ".write": true`). Real login accounts now live in this project, so open rules are worth tightening, even though they don't affect Firestore.
7. Put the config in `.env` (gitignored) as `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`, `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` and `EXPO_PUBLIC_FIREBASE_APP_ID`.
   - For EAS builds, add them with `eas env:set ... --environment production` (and `preview`, `development`).
   - These are public identifiers, not secrets; the rules do the protecting.
   - Remove the old Appwrite keys from `.env` (`API_Endpoint`, `PROJECT_ID`, `DB_ID`, `COLLECTION_ID`, `PROFILES_COLLECTION_ID`, `AVATARS_BUCKET_ID`).
8. Optional hardening later: App Check, and restricting the browser API key (Google Cloud Console → APIs & Services → Credentials) to the Firebase APIs.

### Phase 2: Code (branch `firebase-migration`) ✅ done

What was actually done:
- `lib/firebase.js` (config from `EXPO_PUBLIC_FIREBASE_*`, AsyncStorage login persistence, `ignoreUndefinedProperties`, `userCollection` / `userDoc` / `fromSnapshot` helpers).
- `UserContext`, `BooksContext` and `AuthorContext` rewritten. The user object is now `{ id, name, email }`.
- Password reset is a real "send reset link" form on login and register. The Appwrite code-entry modal and deep link are gone.
- Profile screen has **Delete account** (password-confirmed).
- "Delete All Books" now deletes read books too (the Appwrite version only deleted unread ones).
- Removed: `lib/appwrite.js`, both Appwrite scripts, the `reset-password` intent filter, `react-native-appwrite`, `node-appwrite`, `react-native-dotenv`, `react-native-get-random-values`, `react-native-url-polyfill`, `expo-document-picker`, and `expo-file-system` with its override (`expo` still brings it in).
- Added `babel-preset-expo` as a devDependency: npm had left it only nested inside `expo`, which broke bundling.
- `npx expo-doctor` 20/20; `npx expo export --platform android` bundles cleanly.

Original checklist:

9. `npx expo install firebase`.
10. Create `lib/firebase.js`, then delete `lib/appwrite.js`.
11. Rewrite `UserContext` and keep the API the screens already use (`user`, `login`, `register`, `logout`, `updateName`, `updatePassword`, `deleteBooks`). Add `deleteAccount`, which deletes the user's `books` and `authors` subcollection documents and then calls `deleteUser`. Warn in the UI that this deletes the Firebase account shared with other apps on the project.
12. Map Firebase auth error codes (`auth/invalid-credential`, `auth/email-already-in-use`, `auth/weak-password`, `auth/too-many-requests`, `auth/requires-recent-login`) to the friendly messages in login, register and profile.
13. Rewrite `BooksContext` and `AuthorContext`, replacing `client.subscribe` with `onSnapshot` and unsubscribing on logout/unmount.
14. Replace `$id` → `id` and `$createdAt` → `createdAt` across the 7 files.
15. Password reset:
    - remove the deep-link handling in `login.jsx`
    - remove the `reset-password` intent filter from `app.json` (keep `scheme`; Expo Router uses it)
    - the "forgot password" action just calls `sendPasswordResetEmail`
16. Add a **Delete account** action to the profile screen. Google Play requires in-app account deletion for apps that let users create accounts.
17. Remove packages:
    - `react-native-appwrite`
    - `node-appwrite` (dev dependency)
    - `scripts/database-setup.js` and `scripts/test-database-attributes.js`
    - `expo-file-system` and its `overrides` entry, *only if* nothing else imports it
    - also check and remove: `react-native-dotenv`, `react-native-get-random-values`, `react-native-url-polyfill`, `expo-document-picker`
18. `npx expo install --fix`, then `npx expo-doctor` → 20/20.

### Phase 3: Test

19. Development build (`eas build --profile development -p android`), then test:
    - [ ] Register, log in, log out
    - [ ] Kill the app → reopen → still logged in
    - [ ] Password-reset email arrives and the Firebase-hosted page changes the password
    - [ ] Update name; update password (including the re-auth path)
    - [ ] Add, edit, mark-read and delete books; the list updates live
    - [ ] Follow/unfollow authors; new releases still work
    - [ ] A second test account cannot see the first account's books
    - [ ] Data appears only under `bookimbiber_users/` in the Firestore console
    - [ ] Delete account removes the user and their documents
    - [ ] Web build (`npx expo start --web`) logs in and lists books
20. Run the rest of the release checklist in `EASCheatsheet.md`, minus the deep-link item.

### Phase 4: Ship

21. Update `app/privacy-policy.jsx` to name Firebase (Google) as the data processor and describe account deletion.
22. Play Console → **Data safety**: update data collection and processing, and add the account-deletion URL or in-app path.
23. `npm run bump-version minor` (→ 1.2.0). This must be a new build: the native dependencies change and `app.json` changes.
24. `npx expo export --platform android`, commit, then `eas build -p android --profile production --auto-submit` → internal track → test → promote.

### Phase 5: Cleanup

25. Update `CLAUDE.md`, `EASCheatsheet.md` (Appwrite troubleshooting lines, the "Appwrite project is active" checklist item) and `README.md`.
26. Remove `.claude/skills/appwrite-*` and the `.appwrite` line from `.gitignore` if they're no longer wanted.
