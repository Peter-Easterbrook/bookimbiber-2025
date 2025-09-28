# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Book Imbiber is a React Native app built with Expo that helps users track their reading journey. Users can catalog books, search via Google Books API, scan ISBN barcodes, and maintain their personal digital bookshelf. The app uses Appwrite as the backend for authentication and data storage.

## Development Commands

### Essential Commands

- `npm start` - Start Expo development server
- `npx expo start` - Alternative way to start dev server
- `npx expo start -c` - Start with cleared Metro cache
- `npx expo start --android` - Run on Android device/emulator
- `npx expo start --ios` - Run on iOS device/simulator
- `npx expo start --web` - Run in web browser

### Build Commands (EAS)

- `npx eas build --profile development --platform android` - Development build for Android
- `npx eas build -p android --profile preview` - Preview build for testing
- `npx eas build -p android --profile production` - Production build

### Maintenance Commands

- `npx expo install --fix` - Fix dependency version mismatches
- `npx expo-doctor` - Check project health
- `npx expo install --check` - Review dependency updates
- `npx expo update` - Update to latest Expo SDK

## Architecture

### App Structure (Expo Router)

- **File-based routing**: Uses Expo Router with file-based routing in `app/` directory
- **Route groups**: `(auth)` for login/register, `(dashboard)` for main app screens
- **Nested layouts**: Each route group has its own `_layout.jsx` for navigation structure

### State Management (React Context)

The app uses React Context for global state management:

- **UserContext** (`contexts/UserContext.jsx`) - Authentication state and user data
- **ThemeContext** (`contexts/ThemeContext.jsx`) - Dark/light theme switching
- **BooksContext** (`contexts/BooksContext.jsx`) - Book data and reading state with series detection
- **AuthorContext** (`contexts/AuthorContext.jsx`) - Author following and new release tracking

### Key Services

- **Appwrite** (`lib/appwrite.js`) - Backend-as-a-Service for auth and data storage
  - Project endpoint: `https://fra.cloud.appwrite.io/v1`
  - Handles user accounts, databases, and file storage
- **Google Books API** (`lib/googleBooks.js`) - Book search and metadata
  - Includes smart query formatting for author/title/ISBN searches
  - Language filtering for English books only
- **Series Detection** (`lib/seriesDetection.js`) - Automatic book series detection and grouping
- **Android 14 Features** (`lib/android14Features.js`) - Enhanced notifications, themed icons, Material You
- **Image Optimization** (`lib/imageOptimization.js`) - Performance monitoring, caching, and quality selection
- **Amazon Links** (`lib/amazonLink.js`) - Generate purchase links
- **Avatar Generation** (`lib/avatar.js`) - User profile picture handling

### Component Structure

- **Themed Components** - All UI components support dark/light themes
  - Naming convention: `Themed*` (e.g., `ThemedView`, `ThemedText`, `ThemedButton`)
  - Located in `components/` directory
- **Optimized Images** - Performance-focused image components
  - `OptimizedImage.jsx` - Core optimized image with caching and lazy loading
  - `LazyBookCover.jsx` - Book cover specific component with quality selection
- **Authentication Guards** - `components/auth/UserOnly.jsx` and `GuestOnly.jsx`
- **Specialized Components** - ISBN scanner, book search modal, drawer navigation

### Styling & Theming

- **Colors** defined in `constants/Colors.js` with light/dark variants
- **Custom fonts**: Berlin Sans FB (regular and bold) loaded in root layout
- **Responsive design** using React Native's responsive patterns

## Key Features

### Book Management

- Search books via Google Books API (title, author, ISBN)
- ISBN barcode scanning with camera
- Mark books as read/unread with completion dates
- **Series Detection** - Automatically detect and group book series
- **Author Following** - Track favorite authors and get new release notifications
- Personal bookshelf organization
- Amazon purchase link generation

### Authentication Flow

- Appwrite-powered login/registration
- Persistent session management
- User profile with avatar support
- Privacy-focused data handling

### UI/UX Features

- Dark/light theme toggle with system preference detection
- **Android 14 Enhancements** - Material You theming, rich notifications, themed app icons
- **Image Optimization** - Lazy loading, smart caching, quality selection for smooth performance
- Drawer navigation for main app sections
- Confetti animations for reading achievements
- Loading states and error handling throughout

## Development Notes

### Environment Setup

- Uses Expo SDK 53 with React Native 0.79.5
- Android-only deployment (iOS config exists but unused)
- Targets Android SDK 34 for Android 14 compatibility
- EAS Build for production deployments
- Automatic updates enabled via Expo Updates

### Safe Area & Inset Handling (Android 14 Compatible)

- Uses `expo-status-bar` for status bar management (Android 14 compatible)
- Uses `SafeAreaProvider` and `useSafeAreaInsets` throughout
- Custom `useEdgeToEdge` hook provides consistent inset handling
- All main screens properly handle system UI insets
- Compatible with Android 14 and earlier versions

### Database Schema (Appwrite)

The app stores user books in Appwrite databases. Key collections and fields include:

**Books Collection** (`681e13450007197b1942`):

- Book metadata from Google Books API
- User reading status and completion dates
- **Series fields**: `seriesName`, `bookNumber`, `seriesConfidence`
- User preferences and settings

**Authors Collection** (`681e13450007197b1943`) - New:

- `userId`, `authorName`, `authorId`
- `booksCount`, `genres`, `lastChecked`, `isActive`
- For author following and new release notifications

### Testing & Quality

- No specific testing framework configured
- Use `npx expo-doctor` before builds
- Format code with Prettier (configured in devDependencies)

### Deployment

- EAS Build profiles: development, preview, production
- Auto-increment version numbers in production builds
- OTA updates enabled for JavaScript changes

## Advanced Features (Recently Added)

### Series Detection System

- **Automatic Detection**: Detects series from book titles using pattern matching
- **Confidence Scoring**: High/medium/low confidence based on detection method
- **Grouping**: `groupBooksBySeries()` organizes books by series with proper ordering
- **Integration**: Auto-detects series when adding books via Google Books API

### Author Following & Notifications

- **Follow Authors**: Track favorite authors with metadata storage
- **New Release Detection**: Automatically check for new books from followed authors
- **Smart Filtering**: Books already in user's collection are automatically excluded from new release notifications and cards
- **Rich Notifications**: Android 14 enhanced notifications with book covers
- **Author Suggestions**: AI-powered suggestions based on user's reading history

### Android 14 Enhanced Features

- **Material You Theming**: Dynamic color extraction and themed icons
- **Rich Notifications**: Enhanced notification channels with actions and large icons
- **Status Bar Integration**: Proper edge-to-edge display with system UI
- **Installation**: Requires `expo-notifications` and notification permissions

### Image Optimization System

- **Smart Caching**: 30-day cache with automatic cleanup and size management
- **Quality Selection**: Device-based quality selection (low/medium/high)
- **Lazy Loading**: Intersection-based loading for smooth scrolling
- **Performance Monitoring**: Tracks cache hit rates and load times
- **Batch Preloading**: Preloads images for upcoming content

### Implementation Status

- ✅ **Series Detection**: Ready - Auto-detects on book creation
- ✅ **Author Following**: Ready - Requires new Appwrite collection
- ✅ **Android 14 Features**: Ready - Requires expo-notifications setup
- ✅ **Image Optimization**: Ready - Replace existing Image components

### Required Dependencies

```bash
# For Android 14 features
npx expo install expo-notifications expo-constants

# For image optimization (already installed)
@react-native-async-storage/async-storage
expo-file-system
```
