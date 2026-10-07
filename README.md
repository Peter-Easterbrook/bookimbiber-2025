# Bookimbiber

![Bookimbiber: track, discover & imbibe in your organised bookshelf](assets/Banner.png)

A personal reading tracker for Android (and the web). Catalogue the books you want to read, mark them read when you finish, keep a dated reading history, and hear about new releases from the authors you follow.

Built with React Native and Expo, with Firebase for accounts and data and the Google Books API for book search.

## Features

- **Personal bookshelf:** add books to your reading list, newest first.
- **Book search:** search Google Books by title, author or ISBN. ISBNs typed into the search box are detected automatically.
- **Barcode scanner:** scan a book's ISBN barcode (EAN-13, 978/979) with the camera to look it up.
- **Reading history:** mark a book as read (with a little confetti) and it moves to your history with its completion date.
- **Author following:** follow favourite authors and check for their recent releases, with notifications. Books you already own are filtered out.
- **Amazon links:** jump to a book on your local Amazon store.
- **Profile:** change your name, password and profile photo; reset a forgotten password by email; delete your account and all its data.
- **Dark and light themes,** following the system setting or toggled by hand.
- **Easy on the API quota:** Google Books results are cached (6 hours for searches, 24 hours for author lookups, 7 days for ISBNs), and the new-release check is limited to once an hour.

## Tech stack

| Area | What it uses |
| --- | --- |
| App | Expo SDK 55, React Native 0.83, React 19, Expo Router (file-based routing) |
| Accounts | Firebase Authentication (email and password), via the Firebase JS SDK |
| Data | Cloud Firestore, live-updating with `onSnapshot` |
| Book data | Google Books API |
| State | React Context (`UserContext`, `BooksContext`, `AuthorContext`, `ThemeContext`) |
| Builds and updates | EAS Build, EAS Update (over-the-air JavaScript updates) |

## Getting started

Requirements: Node.js, npm, and an Android device or emulator with a development build installed (the app uses native modules, so Expo Go is not enough).

1. Install dependencies from the lockfile:

   ```sh
   npm ci
   ```

2. Create a `.env` file in the project root with your Firebase web app config (Firebase console → Project settings → General → Your apps → Config):

   ```sh
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   EXPO_PUBLIC_FIREBASE_APP_ID=...
   EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY=...
   ```

   The Google Books key comes from Google Cloud Console (APIs & Services → Credentials, restricted to the Books API). Without it, searches use Google's shared anonymous quota, which is often exhausted.

   These are public identifiers, not secrets: Firestore security rules (`firestore.rules`) control who can read and write what. `.env` is gitignored.

3. Start the development server:

   ```sh
   npx expo start --dev-client -c   # Android development build
   npx expo start --web             # in the browser
   ```

## Data

Each user's data lives in Firestore under `bookimbiber_users/{uid}/`, in a `books` and an `authors` subcollection. The security rules let a signed-in user read and write only their own documents. Profile photos and new-release notifications stay on the device.

## Project layout

```
app/            Screens (Expo Router): (auth) login/register, (dashboard) books, create, profile, notifications
components/     Themed UI components, book search modal, ISBN scanner, new-releases card
contexts/       User, books, authors and theme state
lib/            Firebase setup, Google Books client, notifications, Amazon links, image optimisation
utils/          API response cache and debouncer
docs/           Design notes, including the Firebase migration plan
```

## Building and releasing

Builds run on EAS. The full workflow (when to ship an over-the-air update and when to rebuild, version bumps, release checklist) is in [EASCheatsheet.md](EASCheatsheet.md).

```sh
eas build -p android --profile production --auto-submit   # new build → Play internal testing track
eas update -p android --branch production --environment production -m "..."   # JS-only update
```

## Privacy

Bookimbiber stores only what it needs: your name, email address, and the books and authors you add. The in-app privacy policy is in [app/privacy-policy.jsx](app/privacy-policy.jsx).
