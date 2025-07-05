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

## 📦 **Package Installation**

| Command                      | Use For                                    |
| ---------------------------- | ------------------------------------------ |
| `npx expo install <package>` | ✅ Expo SDK packages (expo-_, @expo/_)     |
| `npm install <package>`      | Regular npm packages (lodash, axios, etc.) |
| `npx expo install --fix`     | Fix mismatched Expo package versions       |

## 🏗️ **EAS Build Commands**

| Command                                                  | Description                                  |
| -------------------------------------------------------- | -------------------------------------------- |
| `eas login`                                              | Log in to your Expo/EAS account              |
| `eas build:configure`                                    | Configure EAS build without starting a build |
| `npx eas build --profile development --platform android` | 🤖 Build a development client for Android    |
| `npx eas build --profile development --platform ios`     | 🍎 Build a development client for iOS        |
| `npx eas build -p android --profile preview`             | Build a preview version for Android          |
| `eas update --auto`                                      | Update your app using EAS Update             |
| `eas update --branch main`                               | Publish an update to the main branch         |

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
