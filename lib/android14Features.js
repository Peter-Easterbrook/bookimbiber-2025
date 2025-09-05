/**
 * Android 14 Enhanced Features for Book Imbiber
 * Implementations for notifications, themed icons, and Material You theming
 */

// Installation required: expo install expo-notifications expo-constants expo-status-bar

/**
 * Enhanced Notification System for Android 14
 * Features: Rich notifications, notification channels, themed icons
 */
export class Android14NotificationManager {
  constructor() {
    this.channels = {
      NEW_RELEASES: 'new-releases',
      READING_REMINDERS: 'reading-reminders',
      SERIES_UPDATES: 'series-updates',
      GENERAL: 'general'
    };
  }

  /**
   * Initialize notification channels (Android 8+)
   * Enhanced for Android 14 with proper categorization
   */
  async setupNotificationChannels() {
    const { setNotificationChannelAsync } = await import('expo-notifications');
    
    // New Releases Channel - High priority for author notifications
    await setNotificationChannelAsync(this.channels.NEW_RELEASES, {
      name: 'New Book Releases',
      description: 'Notifications for new books by followed authors',
      importance: 'high', // Android 14: Enhanced importance handling
      sound: 'default',
      vibrate: true,
      badge: true,
      enableLights: true,
      lightColor: '#4A90E2', // Brand blue
      lockscreenVisibility: 'public', // Android 14: Better lock screen handling
    });

    // Reading Reminders - Medium priority
    await setNotificationChannelAsync(this.channels.READING_REMINDERS, {
      name: 'Reading Reminders',
      description: 'Daily reading goal reminders',
      importance: 'default',
      sound: 'default',
      vibrate: false,
      badge: false,
    });

    // Series Updates - Medium priority
    await setNotificationChannelAsync(this.channels.SERIES_UPDATES, {
      name: 'Series Updates',
      description: 'New books in your followed series',
      importance: 'default',
      sound: 'default',
      vibrate: true,
      badge: true,
    });

    // General - Low priority
    await setNotificationChannelAsync(this.channels.GENERAL, {
      name: 'General',
      description: 'App updates and general notifications',
      importance: 'low',
      sound: null,
      vibrate: false,
      badge: false,
    });
  }

  /**
   * Send rich notification for new author releases
   * Android 14: Enhanced with large icons and action buttons
   */
  async notifyNewRelease(author, books) {
    const { scheduleNotificationAsync } = await import('expo-notifications');
    
    const bookTitles = books.slice(0, 3).map(b => b.title).join(', ');
    const moreText = books.length > 3 ? ` and ${books.length - 3} more` : '';
    
    await scheduleNotificationAsync({
      content: {
        title: `📚 New from ${author}!`,
        body: `${bookTitles}${moreText}`,
        data: {
          type: 'new_release',
          author: author,
          books: books,
        },
        // Android 14: Enhanced rich content
        categoryIdentifier: 'book_release',
        sound: 'default',
        priority: 'high',
        // Large icon for Android 14
        largeIcon: books[0]?.thumbnail || null,
        // Action buttons (Android 14)
        actions: [
          {
            identifier: 'view_books',
            title: 'View Books',
            options: { opensAppToForeground: true }
          },
          {
            identifier: 'dismiss',
            title: 'Later',
            options: { opensAppToForeground: false }
          }
        ]
      },
      trigger: null, // Send immediately
      identifier: `new_release_${author}_${Date.now()}`,
      channelId: this.channels.NEW_RELEASES,
    });
  }

  /**
   * Send reading reminder notification
   */
  async sendReadingReminder(streak = 0) {
    const { scheduleNotificationAsync } = await import('expo-notifications');
    
    const messages = [
      "Time for today's reading session! 📖",
      "Your books are waiting! What's on your list today?",
      `You're on a ${streak}-day streak! Keep it going! 🔥`,
      "A good book and some quiet time awaits! 📚"
    ];
    
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    await scheduleNotificationAsync({
      content: {
        title: "Book Imbiber",
        body: message,
        data: { type: 'reading_reminder' },
        categoryIdentifier: 'reading_reminder',
      },
      trigger: null,
      channelId: this.channels.READING_REMINDERS,
    });
  }
}

/**
 * Android 14 Themed App Icon System
 * Supports Material You dynamic theming
 */
export class Android14ThemeManager {
  /**
   * Configure app.json for Android 14 themed icons
   * This shows the configuration needed in app.json
   */
  static getThemedIconConfig() {
    return {
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#000000",
          // Android 14: Themed icon support
          monochromeImage: "./assets/monochrome-icon.png", 
        },
        // Android 14: Material You color extraction
        theme: {
          primaryColor: "#4A90E2", // Your app's primary brand color
          backgroundColor: "#FFFFFF",
        }
      }
    };
  }

  /**
   * Detect if device supports Material You theming
   */
  async supportsMaterialYou() {
    const { Platform, NativeModules } = await import('react-native');
    const { getConstants } = await import('expo-constants');
    
    if (Platform.OS !== 'android') return false;
    
    const constants = getConstants();
    const androidVersion = constants.platform?.android?.apiLevel;
    
    // Material You available on Android 12+ (API 31+)
    // Enhanced features on Android 14+ (API 34+)
    return androidVersion >= 31;
  }

  /**
   * Get system colors for Material You theming
   * Android 14: Enhanced color extraction
   */
  async getSystemColors() {
    try {
      const supportsMY = await this.supportsMaterialYou();
      if (!supportsMY) return null;

      // This would typically use native modules to access system colors
      // For now, return fallback colors that work well
      return {
        primary: '#4A90E2',
        onPrimary: '#FFFFFF',
        primaryContainer: '#E3F2FD',
        onPrimaryContainer: '#0D47A1',
        background: '#FAFAFA',
        onBackground: '#212121',
        surface: '#FFFFFF',
        onSurface: '#212121',
      };
    } catch (error) {
      console.error('Error getting system colors:', error);
      return null;
    }
  }
}

/**
 * Android 14 Status Bar and Navigation
 * Enhanced system UI integration
 */
export class Android14UIManager {
  /**
   * Configure status bar for Android 14
   */
  static async configureStatusBar(theme = 'auto') {
    const { setStatusBarStyle, setStatusBarBackgroundColor } = await import('expo-status-bar');
    
    // Android 14: Enhanced status bar theming
    if (theme === 'dark') {
      setStatusBarStyle('light', true);
      setStatusBarBackgroundColor('#000000', true);
    } else if (theme === 'light') {
      setStatusBarStyle('dark', true);
      setStatusBarBackgroundColor('#FFFFFF', true);
    } else {
      // Auto - follow system theme
      setStatusBarStyle('auto', true);
      setStatusBarBackgroundColor('transparent', true);
    }
  }

  /**
   * Configure navigation bar for Android 14
   */
  static configureNavigationBar() {
    return {
      android: {
        navigationBar: {
          barStyle: 'dark-content', // Android 14: Better contrast
          backgroundColor: 'transparent',
        },
        // Android 14: Edge-to-edge display
        windowSoftInputMode: 'adjustResize',
        enforceStatusBar: false,
        enforceNavigationBar: false,
      }
    };
  }
}

/**
 * Installation and setup instructions:
 * 
 * 1. Install required packages:
 *    npx expo install expo-notifications expo-constants
 * 
 * 2. Add to app.json plugins:
 *    "plugins": [
 *      "expo-router", 
 *      "expo-font", 
 *      "expo-localization",
 *      ["expo-notifications", {
 *        "icon": "./assets/notification-icon.png",
 *        "color": "#4A90E2",
 *        "defaultChannel": "default"
 *      }]
 *    ]
 * 
 * 3. Add permissions to app.json android section:
 *    "permissions": [
 *      "android.permission.INTERNET",
 *      "android.permission.ACCESS_NETWORK_STATE",
 *      "android.permission.POST_NOTIFICATIONS",
 *      "android.permission.VIBRATE"
 *    ]
 * 
 * 4. Create themed icons:
 *    - assets/monochrome-icon.png (for Android 14 themed icons)
 *    - assets/notification-icon.png (for notifications)
 * 
 * 5. Initialize in _layout.jsx:
 *    const notificationManager = new Android14NotificationManager();
 *    await notificationManager.setupNotificationChannels();
 */