# 📱 Expo & EAS CLI Cheat Sheet

## 🚀 **Expo CLI Basics**

| Command                    | Description                                           |
| -------------------------- | ----------------------------------------------------- |
| `npx expo start`           | Start the Expo development server                     |
| `npx expo start -c`        | 🧹 Clear Metro Bundler cache and start the server     |
| `npx expo start --web`     | Start the app in a web browser (dev mode, hot reload) |
| `npx expo start --android` | Open the app on a connected Android device/emulator   |
| `npx expo start --ios`     | Open the app on a connected iOS device/simulator      |

## 🛠️ **Advanced Expo Commands**

| Command                                      | Description                                                        |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `npx expo start --web --no-dev --minify`     | 🚀 Start the app in a web browser (production-like mode)           |
| `npx expo start --android --no-dev --minify` | Run Android app in production-like mode                            |
| `npx expo start --dev-client`                | Start server for custom dev client builds                          |
| `npx expo-doctor`                            | 🩺 Check project health before publishing/building                 |
| `npx expo install --fix`                     | Fix incorrect dependencies for your Expo SDK version               |
| `npx expo install --check`                   | Review and upgrade dependencies for your Expo SDK version          |
| `npx expo upgrade`                           | 📦 Upgrade all Expo dependencies to the latest compatible versions |
| `expo publish`                               | Publish a new release to Expo                                      |

## 🏗️ **EAS Build Commands**

| Command                                                  | Description                                    |
| -------------------------------------------------------- | ---------------------------------------------- |
| `eas login`                                              | Log in to your Expo/EAS account                |
| `eas build:configure`                                    | Configure EAS build without starting a build   |
| `npx eas build --profile development --platform android` | 🤖 Build a development client for Android      |
| `npx eas build --profile development --platform ios`     | 🍎 Build a development client for iOS          |
| `npx eas build -p android --profile preview`             | Build a preview APK for Android testing        |
| `npx eas build -p android --profile production`          | 🚀 Build production AAB for Google Play Store  |
| `npx eas build -p ios --profile production`              | 🚀 Build production app for Apple App Store    |
| `eas build:list`                                         | List all your EAS builds                       |
| `eas submit -p android`                                  | Submit your Android build to Google Play Store |
| `eas submit -p ios`                                      | Submit your iOS build to Apple App Store       |
| `eas update --auto`                                      | Update your app using EAS Update               |
| `eas update --branch main`                               | Publish an update to the main branch           |

## 🔄 **EAS Update vs New Build: When Do You Need to Rebuild?**

### **✅ Use EAS Update (No Rebuild Needed):**

Push over-the-air (OTA) updates for:

- ✏️ JavaScript/TypeScript code changes
- 🎨 UI/component updates
- 🧠 Logic changes and bug fixes
- 📄 New screens/features in pure JS/TS
- 🔥 Firebase queries and business logic changes
- 📝 Content updates

```bash
# Push an update without rebuilding
eas update --branch production --message "Fixed validation logic"
```

Users get updates automatically when they reopen the app!

### **🏗️ New Build Required:**

You **must rebuild** when changing:

- 📦 Native dependencies (adding/removing packages with native code)
- ⚙️ `app.json` configuration (permissions, plugins, scheme, icons)
- 🖼️ Assets bundled at build time (app icon, splash screen)
- 🔧 Native code modifications
- 📱 Expo SDK version upgrades
- 🔐 OAuth/authentication configuration in native modules

```bash
# Build and submit new version
npx eas build -p android --profile production
eas submit -p android
```

### **💡 Recommended Workflow:**

1. 🧪 Make changes in your code
2. ❓ Ask: "Did I change native code or app.json?"
   - **No** → Use `eas update`
   - **Yes** → Use `eas build`
3. ✅ For closed testing on Google Play, most feature updates only need `eas update`!

## 🔑 **Google OAuth Configuration for Android**

### **Get Your Production SHA-1 Certificate:**

After building with EAS, you need to configure Google Cloud Console with your production signing certificate:

```bash
# Get your Android credentials including SHA-1 fingerprint
eas credentials -p android
```

Look for output like:

```
Android Keystore
  SHA1 Fingerprint: A1:B2:C3:D4:E5:F6:...
  SHA256 Fingerprint: ...
```

Copy the **SHA1 Fingerprint**.

### **Configure Google Cloud Console:**

1. 🌐 Go to [Google Cloud Console](https://console.cloud.google.com)
2. 🔧 Navigate to: **APIs & Services** → **Credentials**
3. 📱 Find your **Android OAuth 2.0 Client ID**
4. ✏️ Click to edit and configure:
   - **Package name**: `com.petereasterbro1.eslexercises25`
   - **SHA-1 certificate fingerprint**: Click "Add fingerprint" and paste your SHA-1
5. 💾 Save changes

### **Important Notes:**

- ⚠️ **No redirect URI field for Android clients** - Google constructs it automatically from your package name
- 🔄 The redirect URI is: `com.petereasterbro1.eslexercises25:/oauth2redirect`
- ✅ You must add the production SHA-1 after each new EAS build if signing keys change
- 🔐 Each build profile (development/preview/production) may have different SHA-1 fingerprints

## 🔐 **Environment & Configuration**

| Command                                       | Description                          |
| --------------------------------------------- | ------------------------------------ |
| `eas env:create --name "VAR" --value "VALUE"` | Push an environment variable to EAS  |
| `eas env:list`                                | List all environment variables       |
| `eas secret:create`                           | Create a new secret for your project |
| `eas secret:list`                             | List all secrets for your project    |

## 📲 **Running Your App on a Device**

### **Expo Go (no custom native code):**

1. Start dev server: `npx expo start`
2. 📷 Scan QR code with Expo Go app
3. Watch for real-time updates as you code!

### **Development Build (custom native code):**

1. Build dev client: `npx eas build --profile development --platform android`
2. Install .apk/.ipa on device
3. Start dev server: `npx expo start --dev-client`
4. Open app on device

### **Direct install (Android only):**

1. Connect device via USB or same WiFi
2. Run: `npx expo run:android`

## 🔍 **Troubleshooting Tips**

- **Metro bundler stuck?** Run `npx expo start -c` to clear cache
- **Dependency issues?** Try `npx expo install --fix`
- **Build failing?** Check EAS build logs with `eas build:list`
- **App crashing?** Test with `--no-dev` flag to simulate production

## 💡 **Pro Tips**

- Use `npx expo-doctor` and `npx expo install --check` regularly to keep your project healthy
- Always run `npx expo start -c` to clear cache when facing weird issues
- For version-specific builds, use `eas build --profile production --auto-submit`
- Use the `--non-interactive` flag with EAS commands in CI/CD pipelines
- Debug network issues with `EXPO_DEBUG=true npx expo start`

## 🚨 **Fixing npm ci Errors in EAS Build**

### **Understanding the Issue:**

EAS Build uses `npm ci` when it detects a `package-lock.json` file (this is correct and expected). However, `npm ci` is strict and requires **exact synchronization** between `package.json` and `package-lock.json`. If they're out of sync, builds fail.

### **Quick Fix - Regenerate Lock File:**

The simplest solution is to regenerate your `package-lock.json` to match your current `package.json`:

```bash
# 1. Delete lock file and node_modules
rm -rf node_modules package-lock.json
# Windows: rmdir /s /q node_modules & del package-lock.json

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

### **Best Practices to Prevent Issues:**

- ✅ **Always commit `package-lock.json`** to version control
- ✅ **Use `npm install`** (not manual edits) to update dependencies
- ✅ **Use `npx expo install <package>`** for Expo-specific packages
- ✅ **Run `npx expo install --check`** to verify compatibility
- ✅ **Run `npm ci` locally** before pushing to catch sync issues early
- ✅ **Keep Node.js version consistent** (specify in `eas.json`)

### **Testing Locally Before EAS Build:**

To verify your lock file is valid, run the same command EAS uses:

```bash
# This is what EAS runs - if it works locally, it'll work in EAS
npm ci
```

If `npm ci` fails locally, your lock file is out of sync. Fix it with the steps above.

## 📦 **Production Build Workflow**

### **For Google Play Store (AAB):**

```bash
# 1. Check project health
npx expo-doctor

# 2. Verify dependencies are in sync
npx expo install --check

# 3. Build production AAB
npx eas build -p android --profile production

# 4. Wait for build to complete (check status)
eas build:list

# 5. Submit to Google Play Store (optional)
eas submit -p android
```

### **For Apple App Store:**

```bash
# 1. Check project health
npx expo-doctor

# 2. Build production IPA
npx eas build -p ios --profile production

# 3. Submit to App Store (optional)
eas submit -p ios
```

### **Recommended eas.json Configuration:**

```json
{
  "cli": {
    "version": ">= 13.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "node": "20.11.0"
    },
    "preview": {
      "distribution": "internal",
      "node": "20.11.0",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "node": "20.11.0",
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

### **Build Types:**

- **APK** (`buildType: "apk"`): For testing, sideloading, direct distribution
- **AAB** (`buildType: "app-bundle"`): For Google Play Store (required for production)
- **IPA**: For iOS App Store distribution

### **Quick Fix Command Sequence (on Bash):**

```bash
# Automatically bump version (patch by default: 1.0.12 -> 1.0.13)
npm run bump-version patch

# Or specify version type:
# npm run bump-version patch   (1.0.12 -> 1.0.13)
# npm run bump-version minor   (1.0.12 -> 1.1.0)
# npm run bump-version major   (1.0.12 -> 2.0.0)

# Clean and rebuild
Remove-Item -Recurse -Force node_modules, package-lock.json
npx rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npx expo-doctor
npx expo install --fix

# If the NPM packages are installed but the imports are throwing errors:

npm ci

# Commit and push
git add .
git commit -m "Bump version and prep for new build"
git push

# Build for production
npx eas build -p android --profile production
# Or push an update without rebuilding
eas update --branch production --message "Fixes category issue"
eas update:list --branch production
```
