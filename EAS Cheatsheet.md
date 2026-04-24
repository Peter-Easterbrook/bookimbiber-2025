# Expo & EAS CLI Cheat Sheet

## Expo CLI Basics

| Command                    | Description                                           |
| -------------------------- | ----------------------------------------------------- |
| `npx expo start`           | Start the Expo development server                     |
| `npx expo start -c`        | Clear Metro Bundler cache and start the server        |
| `npx expo start --web`     | Start the app in a web browser (dev mode, hot reload) |
| `npx expo start --android` | Open the app on a connected Android device/emulator   |

## Advanced Expo Commands

| Command                                      | Description                                                        |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `npx expo start --web --no-dev --minify`     | Start the app in a web browser (production-like mode)              |
| `npx expo start --android --no-dev --minify` | Run Android app in production-like mode                            |
| `npx expo start --dev-client`                | Start server for custom dev client builds                          |
| `npx expo-doctor`                            | Check project health before publishing/building                    |
| `npx expo install --fix`                     | Fix incorrect dependencies for your Expo SDK version               |
| `npx expo install --check`                   | Review and upgrade dependencies for your Expo SDK version          |
| `npx expo update`                            | Update all Expo dependencies to the latest compatible versions     |

## EAS Build Commands

| Command                                                  | Description                                    |
| -------------------------------------------------------- | ---------------------------------------------- |
| `eas login`                                              | Log in to your Expo/EAS account                |
| `eas build:configure`                                    | Configure EAS build without starting a build   |
| `npx eas build --profile development --platform android` | Build a development client for Android         |
| `npx eas build -p android --profile preview`             | Build a preview APK for Android testing        |
| `npx eas build -p android --profile production`          | Build production AAB for Google Play Store     |
| `eas build:list`                                         | List all your EAS builds                       |
| `eas submit -p android`                                  | Submit your Android build to Google Play Store |
| `eas update --branch production --platform android --message "..."` | Push an OTA update to production  |
| `eas update:list --branch production`                    | List updates on the production branch          |

## EAS Update vs New Build: When Do You Need to Rebuild?

### Use EAS Update (No Rebuild Needed):

Push over-the-air (OTA) updates for:

- JavaScript/TypeScript code changes
- UI/component updates
- Logic changes and bug fixes
- New screens/features in pure JS/TS
- Appwrite queries and business logic changes
- Content updates

```bash
# Push an update without rebuilding
eas update --branch production --platform android --message "Fixed validation logic"
```

Users get updates automatically when they reopen the app.

> **Note:** OTA updates only work within the same `version` (semver). If you bump the version in `app.json`, users on older builds won't receive updates until they install the new build.

### New Build Required:

You **must rebuild** when changing:

- Native dependencies (adding/removing packages with native code)
- `app.json` configuration (permissions, plugins, scheme, icons)
- Assets bundled at build time (app icon, splash screen)
- Native code modifications
- Expo SDK version upgrades

```bash
# Build and submit new version
npx eas build -p android --profile production
eas submit -p android
```

### Recommended Workflow:

1. Make changes in your code
2. Ask: "Did I change native code or `app.json`?"
   - **No** → Use `eas update`
   - **Yes** → Use `eas build`
3. For closed testing on Google Play, most feature updates only need `eas update`

## Environment & Configuration

| Command                                       | Description                          |
| --------------------------------------------- | ------------------------------------ |
| `eas env:create --name "VAR" --value "VALUE"` | Push an environment variable to EAS  |
| `eas env:list`                                | List all environment variables       |
| `eas secret:create`                           | Create a new secret for your project |
| `eas secret:list`                             | List all secrets for your project    |

## Running Your App on a Device

### Development Build (required — app uses custom native code):

1. Build dev client: `npx eas build --profile development --platform android`
2. Install APK on device
3. Start dev server: `npx expo start --dev-client`
4. Open app on device

> **Note:** Expo Go will **not** work for this project — it uses custom native modules (camera, notifications, file system, etc.).

### Direct install (Android, requires ADB):

```bash
npx expo run:android
```

## Troubleshooting Tips

- **Metro bundler stuck?** Run `npx expo start -c` to clear cache
- **Dependency issues?** Try `npx expo install --fix`
- **Build failing?** Check EAS build logs with `eas build:list`
- **App crashing?** Test with `--no-dev` flag to simulate production
- **Appwrite project paused?** Go to https://cloud.appwrite.io → select project → click "Resume"

## Pro Tips

- Use `npx expo-doctor` and `npx expo install --check` regularly to keep your project healthy
- Always run `npx expo start -c` to clear cache when facing weird issues
- Use the `--non-interactive` flag with EAS commands in CI/CD pipelines
- Debug network issues with `EXPO_DEBUG=true npx expo start`

## Fixing npm ci Errors in EAS Build

EAS Build uses `npm ci` when it detects a `package-lock.json` file. `npm ci` requires **exact synchronization** between `package.json` and `package-lock.json`. If they're out of sync, builds fail.

### Quick Fix — Regenerate Lock File:

```bash
# 1. Delete lock file and node_modules
rm -rf node_modules package-lock.json

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall dependencies (generates fresh package-lock.json)
npm install

# 4. Verify no issues
npx expo-doctor

# 5. Commit and push the synchronized files
git add package.json package-lock.json
git commit -m "Sync package-lock.json with package.json"
git push

# 6. Clear EAS cache and rebuild
eas build --clear-cache -p android --profile production
```

### Best Practices:

- Always commit `package-lock.json` to version control
- Use `npm install` (not manual edits) to update dependencies
- Use `npx expo install <package>` for Expo-specific packages
- Run `npx expo install --check` to verify compatibility
- Run `npm ci` locally before pushing to catch sync issues early

## Production Build Workflow

### For Google Play Store (AAB):

```bash
# 1. Bump version (patch: 1.1.2 -> 1.1.3 | minor: 1.1.2 -> 1.2.0 | major: 1.1.2 -> 2.0.0)
npm run bump-version patch

# 2. Check project health
npx expo-doctor

# 3. Verify dependencies are in sync
npx expo install --check

# 4. Clean install (optional but safe before a build)
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 5. If imports are failing despite packages being installed:
npm ci

# 6. Commit and push
git add .
git commit -m "Bump version and prep for new build"
git push

# 7. Build production AAB
npx eas build -p android --profile production

# 8. Check build status
eas build:list

# 9. Submit to Google Play Store
eas submit -p android
```

### Build Types:

- **APK** (`buildType: "apk"`): For testing, sideloading, direct distribution (preview profile)
- **AAB** (`buildType: "app-bundle"`): For Google Play Store — required for production

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
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "channel": "production",
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```
