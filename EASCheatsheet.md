# Expo & EAS CLI Cheat Sheet — Book Imbiber

> **Targets:** Android (Google Play) and Web only. No iOS builds.
> **Stack:** Expo SDK 55 · package `com.petereasterbro1.bookimbiber2025` · backend Appwrite (`fra.cloud.appwrite.io`)
> **OTA policy:** `runtimeVersion: { "policy": "appVersion" }` — read [Step 6](#step-6--deploy) before every deploy.

## Expo CLI Basics

| Command                                      | Description                                            |
| -------------------------------------------- | ------------------------------------------------------ |
| `npx expo start`                             | Start the Expo development server                      |
| `npx expo start -c`                          | Clear Metro Bundler cache and start the server         |
| `npx expo start --dev-client`                | Start server for the development build (see below)     |
| `npx expo start --web`                       | Start the app in a web browser (dev mode, hot reload)  |
| `npx expo start --android`                   | Open the app on a connected Android device/emulator    |
| `npx expo start --web --no-dev --minify`     | Web app in production-like mode                        |
| `npx expo start --android --no-dev --minify` | Android app in production-like mode                    |
| `npx expo-doctor`                            | Check project health before building                   |
| `npx expo install <package>`                 | Install a package at the version matching SDK 55       |
| `npx expo install --check`                   | List outdated/incompatible dependencies                |
| `npx expo install --fix`                     | Fix incorrect dependency versions for the SDK          |
| `npx expo install expo@^56.0.0 --fix`        | Upgrade the Expo SDK (example: to SDK 56)              |
| `npx expo export --platform android`         | Bundle the app exactly as a build would (catches bad imports) |

## EAS Build & Submit Commands

| Command                                              | Description                                       |
| ---------------------------------------------------- | ------------------------------------------------- |
| `eas login` / `eas whoami`                           | Log in / check which Expo account is active       |
| `eas build --profile development -p android`         | Build a development client APK                    |
| `eas build -p android --profile preview`             | Build a preview APK for sideload testing          |
| `eas build -p android --profile production`          | Build production AAB for Google Play              |
| `eas build -p android --profile production --auto-submit` | Build, then submit to Play (internal track — see Step 6) |
| `eas build:list`                                     | List EAS builds (status, version, versionCode)    |
| `eas submit -p android`                              | Submit the latest AAB to Google Play              |
| `eas credentials -p android`                         | View keystore / SHA-1 / Play service account key  |

## EAS Update Commands (OTA)

> Since **SDK 55**, `eas update` **requires `--environment`**. OTA updates reach standalone builds (Play Store / sideloaded APK) and dev builds — never Expo Go.

| Command                                                                               | Description                         |
| ------------------------------------------------------------------------------------- | ----------------------------------- |
| `eas update -p android --branch production --environment production -m "..."`         | Push OTA update to production       |
| `eas update -p android --branch preview --environment preview -m "..."`               | Push OTA update to preview builds   |
| `eas update -p android --branch production --environment production --rollout-percentage 20 -m "..."` | Staged OTA rollout to 20% |
| `eas update:list --branch production`                                                 | List recent updates on production   |

## Environment Variables

`eas secret:*` and `eas env:create` are **deprecated** — use `eas env:set`.

| Command                                                                                              | Description                        |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `eas env:set --name EXPO_PUBLIC_X --value "..." --environment production --visibility plaintext`     | Create/update a variable           |
| `eas env:list --environment production`                                                              | List variables for an environment  |
| `eas env:push --path .env --environment development --environment preview --environment production` | Upload every variable in `.env` to all three environments |
| `eas env:pull --environment development --path .env`                                                 | Download variables into a local `.env` |

> `push` and `pull` default to `.env.local`, so always pass `--path .env` for this project.

> `EXPO_PUBLIC_*` values are inlined into the JS bundle — never put true secrets in them. Build profiles named `development`/`preview`/`production` use the matching EAS environment automatically.

### Firebase config (required for every build)

The app reads its Firebase config from six `EXPO_PUBLIC_FIREBASE_*` variables (see `lib/firebase.js`). Locally they come from `.env` (gitignored). EAS builds run on Expo's servers and never see `.env`, so the same variables must exist in EAS. Otherwise the build succeeds, but the app can't reach Firebase.

- After creating or changing `.env`, push it to all three environments (`--force` skips the overwrite prompt):

  ```powershell
  eas env:push --path .env --environment development --environment preview --environment production
  eas env:list --environment production   # check all six are there
  ```

- In the EAS website instead: create each variable once with **Development**, **Preview** and **Production** all ticked, visibility **Plain text** or **Sensitive**. Never **Secret**: `EXPO_PUBLIC_*` values end up in the app bundle anyway.
- The values live in the Firebase console → Project settings → General → Your apps → Bookimbiber web app → Config.

## EAS Update vs New Build: When Do You Need to Rebuild?

### Use EAS Update (no rebuild):

- JavaScript changes — screens, components, contexts, styling
- Logic changes and bug fixes (Appwrite queries, Google Books calls, caching, series detection)
- New screens/features in pure JS
- Content and text updates

Users receive the update on the next cold start after it downloads in the background (`checkAutomatically: "ON_LOAD"`).

### New build required:

- Native dependencies (adding/removing/upgrading packages with native code)
- `app.json` changes — permissions, plugins, scheme, intent filters, icons, splash
- `app.plugin.js` changes (the BouncyCastle Gradle fix)
- Expo SDK upgrades

> **Rule for this app:** a new build ⇒ **bump the version first**. With the `appVersion` policy, that's the *only* thing that stops an OTA from reaching a binary that lacks the native code it needs.

## Running Your App on a Device

### Development Build (recommended)

The app ships `expo-dev-client`, a custom config plugin (`app.plugin.js`) and native modules (camera, notifications, Skia, file system) — use a development build rather than Expo Go.

1. Build dev client: `eas build --profile development -p android`
2. Install the APK on the device
3. Start dev server: `npx expo start --dev-client`
4. Open the app on the device

### Direct install (USB/ADB)

```bash
npx expo run:android
```

Requires Android Studio / SDK locally. Generates a native `android/` folder — don't commit it (the project uses Continuous Native Generation).

## Troubleshooting

- **Metro bundler stuck?** `npx expo start -c`
- **Dependency issues?** `npx expo install --fix`
- **Build failing?** Open the logs from `eas build:list` (or the link printed by `eas build`). For dependency/cache errors, rebuild with `--clear-cache`.
- **App crashing in production only?** Try `--no-dev --minify`, then check logcat: `adb logcat *:E ReactNativeJS:V`
- **Login/data failing everywhere?** Appwrite free projects pause after ~2 weeks idle → https://cloud.appwrite.io → project → **Resume**
- **Native module silently missing (e.g. Appwrite file/account calls)?** `expo-file-system` must stay a **direct dependency** *and* in `overrides` in `package.json` — `react-native-appwrite` imports it, and it won't autolink otherwise.
- **Camera/notifications broken in a release build?** Confirm `expo-camera` and `expo-notifications` are still in `app.json` → `plugins`, and `android.permission.CAMERA` is in `android.permissions`.
- **Debug network issues:** `EXPO_DEBUG=true npx expo start`

## Current eas.json Configuration

```json
{
  "cli": {
    "version": ">= 16.3.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true,
      "channel": "production",
      "android": { "buildType": "app-bundle" }
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Build types:**

- **APK**: development and preview (internal distribution builds are APKs) — for testing and sideloading
- **AAB** (`buildType: "app-bundle"`): production — required by Google Play

**Notes on this config:**

- `cli.appVersionSource` is **not set**, so EAS falls back to `local` and warns that the field will become required. EAS docs recommend `"remote"`. Before switching, run `eas build:version:get -p android` / `eas build:version:set -p android` so the remote `versionCode` starts **above the last uploaded one** (last build: 16). `app.json` still says `versionCode: 4`. If remote were initialized from that, Play would reject the upload.
- `submit.production` is empty, so Android submissions go to the **internal** track by default.

---

## Update / Build Workflow

> EAS Build runs `npm ci`, which requires `package.json` and `package-lock.json` to be in exact sync. This workflow keeps them in sync and catches problems locally before a remote build fails.

### Step 1 — Bump the version _(new builds only — never for OTA)_

```powershell
npm run bump-version          # patch: 1.1.3 → 1.1.4  (bug fixes)
npm run bump-version minor    # minor: 1.1.3 → 1.2.0  (new features)
npm run bump-version major    # major: 1.1.3 → 2.0.0  (breaking changes / redesigns)
```

`scripts/bump-version.js` keeps `app.json` (`expo.version`) and `package.json` (`version`) in sync. EAS auto-increments `versionCode` on production builds — don't set it by hand.

### Step 2 — Install or update dependencies

```powershell
npx expo install <package>   # Expo / React Native packages (SDK-compatible versions)
npm install <package>        # Everything else — never edit package.json by hand
```

### Step 3 — Reinstall from the lockfile

Run after any dependency change:

```powershell
Remove-Item -Recurse -Force node_modules   # Bash: rm -rf node_modules
npm ci
```

> **Don't delete `package-lock.json`.** `npm ci` installs strictly from the lockfile and **fails loudly** if it has drifted from `package.json`, and that failure is exactly what this step is checking for. Deleting the lockfile re-resolves every `^` range to its newest match, so you'd ship a dependency tree you never tested. Only regenerate it (`npm install`) if `npm ci` reports a genuine sync error.

### Step 4 — Validate locally

```powershell
npx expo-doctor
npx expo install --check
```

A clean `expo-doctor` run is **20/20**. `react-native-keyboard-aware-scroll-view` is excluded from the React Native Directory check (`expo.doctor.reactNativeDirectoryCheck.exclude` in `package.json`). If that check fails again, read what it names before adding to the exclude list. The "packages out of date" check may flag patch versions. Usually it's safe to fix with `npx expo install --fix`.

Before a **new build** (not needed for OTA), also bundle the app exactly as the build will. That way an unresolved import fails here in about two minutes, not ten minutes into an EAS build:

```powershell
npx expo export --platform android
```

### Step 5 — Commit

```powershell
git add .
git commit -m "fix: short description of what actually changed"
git push
```

Write a real message. When you trace a build back six months later, the commit message is all you'll have to go on.

### Step 6 — Deploy

`runtimeVersion` uses the **`appVersion`** policy: an OTA update reaches every build whose `expo.version` matches the version at publish time. EAS does **not** check whether the native layer changed. You enforce that yourself:

- **JS-only change → OTA. Do NOT bump the version.** Bumping would orphan every installed build.
- **Native change → bump the version, then build.** Never publish an OTA under an old version after a native change. Those users' binaries lack the new native code and will crash or white-screen.

**JS only** (UI, Appwrite logic, Google Books logic, content — not dependency updates) → OTA:

```powershell
eas update -p android --branch production --environment production --message "describe the change"
eas update:list --branch production
```

**Native deps, `app.json`, `app.plugin.js`, SDK upgrade, icons/splash** → new build:

```powershell
eas build -p android --profile production --auto-submit
```

Because `submit.production` has no `track`, this lands on the **internal testing** track, not production. Keep it that way: never point auto-submit straight at production. Google re-signs every Play-distributed install with the App Signing key, so the internal track is the only place to test the *exact* binary users will get.

If a build fails with a dependency sync or cache error, add `--clear-cache`.

> **Optional hardening:** switch to `"runtimeVersion": { "policy": "fingerprint" }`. It hashes the native layer, so an OTA automatically stops matching builds whose native code differs, which removes the manual rule above. Changing policy is itself a native change and needs a new build.

### Step 7 — Verify, then promote

1. Play Console → **Test and release → Testing → Internal testing**
2. Confirm the new bundle appears under **App bundles**, _not_ **Deactivated app bundles**. If it's deactivated, the track silently serves the previous version and you'll test the wrong binary.
3. Install from the internal track and confirm **Settings → Apps → Book Imbiber** shows the version you just built
4. Smoke-test what the release touched (see checklist below)
5. **Internal testing → Promote release → Production**

Promoting ships the identical artifact, with no rebuild needed.

---

## Release Checklist

Copy into the release commit or an issue and work down it.

### Before building

- [ ] Appwrite project is active (not paused)
- [ ] `npm run bump-version`: only for a new build, never for an OTA
- [ ] `npm ci` runs clean (proves `package.json` and the lockfile agree; EAS runs it too)
- [ ] `npx expo-doctor` → 20/20 (or only known patch-version warnings)
- [ ] `npx expo export --platform android` → bundles without error
- [ ] `eas env:list --environment production` matches the keys the app actually reads
- [ ] Everything committed with a meaningful message

### Choosing OTA or build

- [ ] Touched **only** JS? → `eas update ... --environment production`, no version bump, skip the rest
- [ ] Touched `app.json`, `app.plugin.js`, a native dependency, icons, or the SDK? → bump version + new build

### Building

- [ ] `eas build -p android --profile production --auto-submit` (→ internal track)
- [ ] Never auto-submit straight to production

### On the internal build, before promoting

Test on a real device, installed from the internal track.

- [ ] Bundle listed under **App bundles**, not **Deactivated app bundles**
- [ ] **Settings → Apps** reports the version you just built
- [ ] Register / login / logout (Appwrite)
- [ ] Password reset deep link opens the app (`bookimbiber2025://reset-password`)
- [ ] Book search (title, author, typed ISBN) returns results
- [ ] **ISBN barcode scanner** opens the camera and finds a book
- [ ] Add a book, mark it read, and confetti plays
- [ ] Author follow + new releases refresh; notification permission prompt
- [ ] Amazon link opens in the browser
- [ ] Profile edit (name / password); light/dark theme toggle
- [ ] Whatever this release actually changed

### After promoting

- [ ] Play Console → **Android vitals**: crash-free rate holds over the first day
- [ ] A test OTA (if any) shows up via `eas update:list --branch production`
