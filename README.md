# 📚 Bookimbiber

![Bookimbiber: track, discover & imbibe in your organised bookshelf](assets/Banner.png)

**Your personal reading tracker.** Catalogue the books you want to read, scan them straight off the shelf, mark them read when you finish, and hear about new releases from the authors you follow.

![Android](https://img.shields.io/badge/Android-3DDC84?logo=android&logoColor=white)
![Expo SDK 55](https://img.shields.io/badge/Expo-SDK%2055-000020?logo=expo&logoColor=white)
![React Native 0.83](https://img.shields.io/badge/React%20Native-0.83-61DAFB?logo=react&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)
![Version 1.2.0](https://img.shields.io/badge/version-1.2.0-blue)

## ✨ Features

| | Feature | What it does |
| --- | --- | --- |
| 🔎 | **Book search** | Search Google Books by title, author or ISBN. Typed ISBNs are recognised automatically. |
| 📷 | **Barcode scanner** | Point the camera at a book's barcode to look it up instantly. |
| 🇩🇪 | **German editions too** | ISBNs Google doesn't know are looked up in the German National Library (Deutsche Nationalbibliothek) catalogue, covers included. |
| 📖 | **Reading list** | Your to-read shelf, newest first, live-synced to the cloud. |
| 🎉 | **Reading history** | Mark a book as read (with confetti) and it moves to your history with its completion date. |
| ✍️ | **Follow authors** | Follow favourite authors and check for their recent releases, with notifications. Books you already own are filtered out. |
| 🛒 | **Amazon links** | Jump to any book on your local Amazon store. |
| 👤 | **Your profile** | Change your name, password and photo, reset a forgotten password by email, or delete your account and all its data. |
| 🌗 | **Dark and light themes** | Follows your system setting, or toggle it yourself. |

## 🧰 Tech stack

| Area | Built with |
| --- | --- |
| 📱 App | Expo SDK 55 · React Native 0.83 · React 19 · Expo Router (file-based routing) |
| 🔐 Accounts | Firebase Authentication (email and password), via the Firebase JS SDK |
| ☁️ Data | Cloud Firestore, updating live with `onSnapshot` |
| 📚 Book data | Google Books API, with the German National Library as an ISBN fallback |
| 🧠 State | React Context: `UserContext`, `BooksContext`, `AuthorContext`, `ThemeContext` |
| 🚀 Delivery | EAS Build and EAS Update (over-the-air JavaScript updates) |

### ⚡ Easy on the API quota

Google Books has a daily quota, so the app treats it with care:

- Results are cached on the device: 6 hours for searches, 24 hours for author lookups, 7 days for ISBNs.
- Failed requests are never cached, so a brief outage can't leave you stuck with empty results.
- The new-release check runs only when you ask, at most once an hour, and checks authors in small batches.

## 🚀 Getting started

**You'll need** Node.js, npm, and an Android device or emulator with a development build installed. The app uses native modules (camera, notifications), so Expo Go isn't enough.

1. **Install dependencies** from the lockfile:

   ```sh
   npm ci
   ```

2. **Create a `.env` file** in the project root:

   ```sh
   # Firebase console → Project settings → General → Your apps → Config
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   EXPO_PUBLIC_FIREBASE_APP_ID=...
   # Google Cloud Console → APIs & Services → Credentials (restrict it to the Books API)
   EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY=...
   ```

   > 💡 These are public identifiers, not secrets: the Firestore security rules in `firestore.rules` decide who can read and write what. `.env` is gitignored all the same.

3. **Start the development server:**

   ```sh
   npx expo start --dev-client -c   # Android development build
   npx expo start --web             # in the browser
   ```

## 🗂️ Project layout

```
app/          📱 Screens (Expo Router): (auth) login and register; (dashboard) books, create, profile, notifications
components/   🧩 Themed UI components, book search modal, ISBN scanner, new-releases card
contexts/     🧠 User, books, authors and theme state
lib/          🔌 Firebase setup, Google Books and German National Library clients, notifications, Amazon links
utils/        ⚡ API response cache and debouncer
docs/         📝 Design notes, including the Firebase migration plan
```

## 🔒 Your data

Each user's books and followed authors live in Firestore under `bookimbiber_users/{uid}/`, and the security rules let a signed-in user read and write **only their own** documents. Your profile photo and new-release notifications never leave your device. Deleting your account removes everything.

The full privacy policy is in the app and in [`app/privacy-policy.jsx`](app/privacy-policy.jsx).

## 📦 Building and releasing

Builds run on EAS. The full workflow is in [`EASCheatsheet.md`](EASCheatsheet.md): when an over-the-air update is enough and when to rebuild, version bumps, and the release checklist.

```sh
eas build -p android --profile production --auto-submit   # new build → Play internal testing
eas update -p android --branch production --environment production -m "..."   # JavaScript-only update
```

## 📲 Try it

Bookimbiber is distributed through Google Play's internal testing. If you'd like to try it, get in touch at **support@onestepweb.dev** and I'll add you as a tester.

---

Made with ☕ and 📖 by Peter Easterbrook · [onestepweb.dev](https://www.onestepweb.dev)
