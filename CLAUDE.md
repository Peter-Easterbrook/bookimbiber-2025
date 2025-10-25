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
  - Provides: `user`, `login`, `register`, `logout`, `updateName`, `updatePassword`, `deleteBooks`
  - Handles user profile updates with validation and error handling
- **ThemeContext** (`contexts/ThemeContext.jsx`) - Dark/light theme switching
- **BooksContext** (`contexts/BooksContext.jsx`) - Book data and reading state with series detection
- **AuthorContext** (`contexts/AuthorContext.jsx`) - Author following and new release tracking with API caching

### Key Services

- **Appwrite** (`lib/appwrite.js`) - Backend-as-a-Service for auth and data storage
  - Project endpoint: `https://fra.cloud.appwrite.io/v1`
  - Handles user accounts, databases, and file storage
- **Google Books API** (`lib/googleBooks.js`) - Book search and metadata with aggressive caching
  - Includes smart query formatting for author/title/ISBN searches
  - Language filtering for English books only
  - **Caching**: 6-24 hour cache for searches, 7-day cache for ISBN lookups
  - **Rate Limit Protection**: Prevents quota exhaustion through intelligent caching
- **API Cache** (`utils/api-cache.js`) - AsyncStorage-based caching system for API responses
  - Configurable TTL (Time To Live) for different data types
  - Automatic expiration and cleanup
  - Debouncer utility for rate limiting function calls
- **Series Detection** (`lib/seriesDetection.js`) - Automatic book series detection and grouping
- **Android 14 Features** (`lib/android14Features.js`) - Enhanced notifications, themed icons, Material You
- **Image Optimization** (`lib/imageOptimization.js`) - Performance monitoring, caching, and quality selection
- **Amazon Links** (`lib/amazonLink.js`) - Generate purchase links
- **Avatar Generation** (`lib/avatar.js`) - User profile picture handling

### Component Structure

- **Themed Components** - All UI components support dark/light themes
  - Naming convention: `Themed*` (e.g., `ThemedView`, `ThemedText`, `ThemedButton`)
  - Located in `components/` directory
  - **ThemedButton** - Supports Android ripple effect with theme-aware colors
- **Optimized Images** - Performance-focused image components
  - `OptimizedImage.jsx` - Core optimized image with caching and lazy loading
  - `LazyBookCover.jsx` - Book cover specific component with quality selection
- **Authentication Guards** - `components/auth/UserOnly.jsx` and `GuestOnly.jsx`
- **Specialized Components** - ISBN scanner, book search modal, drawer navigation
  - **BookSearchModal** - Enhanced with ISBN scanning and automatic ISBN detection in search queries
  - **ISBNScanner** - Camera-based barcode scanner integrated into book search workflow
- **NewReleasesCard** - Displays new releases with debounced refresh (1-hour cooldown)

### Styling & Theming

- **Colors** defined in `constants/Colors.js` with light/dark variants
  - Includes `rippleColor` for Android ripple effects on interactive elements
- **Custom fonts**: Berlin Sans FB (regular and bold) loaded in root layout
- **Responsive design** using React Native's responsive patterns
- **Android Ripple Effects** - Native Material Design ripple effects on all buttons and interactive cards
  - Applied to ThemedButton, FlatList cards, and navigation elements
  - Theme-aware colors for consistent visual feedback

## Key Features

### Book Management

- Search books via Google Books API (title, author, ISBN)
  - **Automatic ISBN Detection** - Search automatically detects ISBN format and uses optimized lookup
- **ISBN Barcode Scanning** - Camera-based barcode scanner integrated into search modal
  - Validates EAN-13 barcodes for books (starting with 978 or 979)
  - Direct integration with Google Books API via ISBN lookup
- Mark books as read/unread with completion dates
- **Series Detection** - Automatically detect and group book series
- **Author Following** - Track favorite authors and get new release notifications
- Personal bookshelf organization
- **Amazon Purchase Links** - Locale-aware Amazon links with improved reliability
  - Removed unreliable `canOpenURL` check for better Android compatibility
  - User-friendly error handling for devices without web browsers

### Authentication Flow

- Appwrite-powered login/registration
- Persistent session management
- **Editable User Profile** - Users can update their name and password from the profile page
- User profile with avatar support
- Privacy-focused data handling

### UI/UX Features

- Dark/light theme toggle with system preference detection
- **Android Material Design** - Native ripple effects on all interactive elements
  - Buttons with theme-aware ripple colors
  - FlatList cards with smooth touch feedback
  - Navigation elements with borderless ripple effects
- **Android 14 Enhancements** - Material You theming, rich notifications, themed app icons
- **Image Optimization** - Lazy loading, smart caching, quality selection for smooth performance
- **Responsive Navigation** - Improved back button with Pressable for better touch responsiveness
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
- **Android Navigation Bar Configuration** - Transparent navigation bar with proper system UI integration
  - Configured in `app.json` for compatibility with 3-button and gesture navigation
  - Ensures content is not hidden and touch input works correctly on all Android devices
- Compatible with Android 14 and earlier versions

### Database Schema (Appwrite)

The app stores user books in Appwrite databases. Key collections and fields include:

**Books Collection** (`681e13450007197b1942`):

- Book metadata from Google Books API
- User reading status and completion dates
- **Series fields**: `seriesName`, `bookNumber`, `seriesConfidence`
- User preferences and settings

**Authors Collection** (`authors`):

- `userId`, `authorName`, `authorId`
- `booksCount`, `genres`, `lastChecked`, `isActive`
- For author following and new release notifications

### API Rate Limit Management

**Problem**: Google Books API has a daily quota limit that was being exceeded even with only 4 app installations.

**Solution**: Implemented comprehensive caching and debouncing system:

1. **API Response Caching** (`utils/api-cache.js`):
   - General searches: 6-hour cache
   - Author book searches: 24-hour cache
   - ISBN lookups: 7-day cache (permanent data)
   - Empty results are also cached to prevent repeated failed lookups

2. **Debouncing System**:
   - User-triggered refresh limited to once per hour
   - Friendly alerts show remaining cooldown time
   - Force refresh option available when truly needed

3. **Batch Processing**:
   - Author checks process 3 at a time with 500ms delays between batches
   - Prevents overwhelming the API with simultaneous requests

4. **Smart Loading**:
   - Removed automatic periodic checks
   - User-triggered checks only (via refresh button)
   - Cache is checked before making any API call

**Result**: ~90% reduction in API calls (from 100+ to 10-20 per day per user)

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
- **New Release Detection**: User-triggered checks for new books from followed authors
- **Smart Filtering**: Books already in user's collection are automatically excluded from new release notifications and cards
- **Debounced Refresh**: 1-hour cooldown on manual refresh to prevent API abuse
- **Batch Processing**: Checks authors in batches of 3 with delays to respect API limits
- **Rich Notifications**: Android 14 enhanced notifications with book covers
- **Author Suggestions**: AI-powered suggestions based on user's reading history

### API Caching System (`utils/api-cache.js`)

- **AsyncStorage-based**: Persistent cache across app sessions
- **TTL Support**: Configurable time-to-live for different data types
- **Metadata Tracking**: Stores timestamps and expiration info
- **Cache Management**:
  - `apiCache.set(key, data, ttl)` - Store with expiration
  - `apiCache.get(key)` - Retrieve if not expired
  - `apiCache.remove(key)` - Clear specific entry
  - `apiCache.clearAll()` - Clear all cached data
  - `apiCache.getMetadata(key)` - Check cache status

### Debouncer Utility (`utils/api-cache.js`)

- **Rate Limiting**: Prevents function calls within cooldown period
- **Per-Key Tracking**: Different cooldowns for different operations
- **Methods**:
  - `canProceed(key)` - Check if cooldown has passed
  - `getRemainingTime(key)` - Get milliseconds until ready
  - `markCalled(key)` - Record function call
  - `reset(key)` - Clear cooldown for specific key

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

### Profile Management System

- **Editable Profile Page** (`app/(dashboard)/profile.jsx`)
  - Toggle between view and edit modes
  - Update user name with validation (min 2 characters)
  - Change password with current password verification
  - Password strength requirement (min 8 characters)
  - Confirmation field for new password
  - Success/error feedback with user-friendly alerts
- **UserContext Methods**:
  - `updateName(newName)` - Updates user's display name
  - `updatePassword(currentPassword, newPassword)` - Updates password with verification
  - Includes rate limiting protection and error handling

### Implementation Status

- ✅ **Series Detection**: Ready - Auto-detects on book creation
- ✅ **Author Following**: Ready - Requires new Appwrite collection
- ✅ **API Caching**: Implemented - Reduces API calls by ~90%
- ✅ **Debouncing**: Implemented - 1-hour refresh cooldown
- ✅ **Android 14 Features**: Ready - Requires expo-notifications setup
- ✅ **Image Optimization**: Ready - Replace existing Image components
- ✅ **Profile Editing**: Implemented - Users can update name and password
- ✅ **Android Navigation Bar**: Configured - Compatible with all navigation types
- ✅ **Android Ripple Effects**: Implemented - Material Design ripple on all interactive elements
- ✅ **ISBN Scanning**: Integrated - Camera barcode scanner in search modal with auto-detection
- ✅ **Amazon Link Reliability**: Improved - Better error handling for all Android devices

## Recent Improvements (Version 1.0.7)

### Android Material Design Enhancements

1. **Native Ripple Effects**
   - Added Android ripple effect to ThemedButton component
   - Ripple effects now work on all buttons across the app (login, register, create, profile)
   - Theme-aware ripple colors that match light/dark mode
   - Fixed FlatList card ripple by restructuring Pressable/View hierarchy

2. **ISBN Scanner Integration**
   - Integrated ISBNScanner component into BookSearchModal
   - Added barcode button next to search button
   - Automatic ISBN detection in search queries (no need to use scanner for typed ISBNs)
   - Improved ISBN validation and error handling

3. **Amazon Link Reliability**
   - Removed unreliable `Linking.canOpenURL` check that caused failures on some devices
   - Direct URL opening with better error handling
   - User-friendly error messages when browser is not available
   - Consistent behavior across all Android versions

4. **Navigation Improvements**
   - Replaced Link component with Pressable for back button in book details
   - Added borderless ripple effect to back button
   - Improved touch responsiveness with proper padding
   - Better accessibility labels and roles

### Technical Details

- **Ripple Implementation**: Uses `android_ripple` prop on Pressable with theme colors
- **ISBN Detection**: Regex pattern matching for ISBN-10 and ISBN-13 formats
- **Error Handling**: User-facing alerts for common issues (network, browser, etc.)
- **Performance**: Ripple effects use native Android rendering for smooth animations

### Required Dependencies

```bash
# Core dependencies (already installed)
@react-native-async-storage/async-storage  # For API caching
expo-file-system  # For image optimization

# For Android 14 features
npx expo install expo-notifications expo-constants
```

## Performance Optimization Best Practices

### When Adding New API Calls

1. **Always use caching**: Import `apiCache` from `utils/api-cache.js`
2. **Choose appropriate TTL**:
   - Permanent data (ISBN): 7 days
   - Author/book searches: 24 hours
   - General searches: 6 hours
3. **Cache empty results**: Prevents repeated failed lookups
4. **Log cache hits/misses**: Use console.log for debugging

### When Adding User-Triggered Actions

1. **Consider debouncing**: Use `Debouncer` class for rate-limited actions
2. **Provide feedback**: Alert users about remaining cooldown time
3. **Batch operations**: Process in small groups with delays
4. **Force refresh option**: Allow override for critical updates

### Example Implementation

```javascript
import { apiCache, Debouncer } from '../utils/api-cache';

// Create debouncer (1 hour cooldown)
const actionDebouncer = new Debouncer(60 * 60 * 1000);

async function cachedApiCall(param) {
  const cacheKey = `my_call_${param}`;

  // Try cache first
  const cached = await apiCache.get(cacheKey);
  if (cached) return cached;

  // Fetch and cache
  const data = await fetchFromAPI(param);
  await apiCache.set(cacheKey, data, 24 * 60 * 60 * 1000); // 24 hours
  return data;
}

async function debouncedAction(userId) {
  const key = `action_${userId}`;

  if (!actionDebouncer.canProceed(key)) {
    const remainingMs = actionDebouncer.getRemainingTime(key);
    alert(`Wait ${Math.ceil(remainingMs / 60000)} minutes`);
    return;
  }

  await performAction();
  actionDebouncer.markCalled(key);
}
```
