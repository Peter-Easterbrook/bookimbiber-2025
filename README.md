# 📚 Book Imbiber 2025 - Your Digital Bookshelf

> A modern React Native book management app built with Expo, helping you organize and track your personal library with style! 📱✨

## 🌟 What is Book Imbiber?

Book Imbiber is your personal digital librarian! Keep track of books you've read, want to read, or are currently reading. Search for books using Google Books API, add custom descriptions, and maintain your own curated collection.

Perfect for book lovers who want to:

- 📖 Track their reading progress
- 🔍 Discover new books with integrated search
- 📝 Add personal notes and descriptions
- ⭐ View ratings and reviews from other readers
- 🌙 Enjoy both light and dark themes

## ✨ Features

### 📚 **Book Management**

- Add books manually or search via Google Books API
- View book covers, ratings, and review counts
- Mark books as read/unread
- Delete books from your collection
- Detailed book view with full descriptions

### 🔍 **Smart Search**

- Integrated Google Books API search
- Real-time search results with covers and metadata
- One-tap book addition from search results
- Automatic population of book details

### 🎨 **Beautiful UI**

- Clean, modern Material Design interface
- Dark/Light theme support with theme toggle
- Smooth animations and transitions
- Responsive design for tablets and phones
- Custom themed components throughout

### 🔐 **User Authentication**

- Secure user registration and login
- Personal book collections per user
- Appwrite backend integration
- Session management

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Appwrite (Database, Auth, Storage)
- **Navigation**: Expo Router (file-based routing)
- **APIs**: Google Books API for book search
- **State Management**: React Context API
- **Styling**: StyleSheet with custom themed components
- **Icons**: Expo Vector Icons (@expo/vector-icons)

## 📱 Screenshots

_Coming soon! We're still adding books to our digital shelves..._

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Expo Go app (for testing) or EAS Development Build

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/bookimbiber-2025.git
   cd Bookimbiber-2025
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   APPWRITE_ENDPOINT=your_appwrite_endpoint
   APPWRITE_PROJECT_ID=your_project_id
   GOOGLE_BOOKS_API_KEY=your_google_books_api_key
   ```

4. **Start the development server**

   ```bash
   npx expo start
   ```

5. **Run on device**
   - Scan QR code with Expo Go app, or
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

## 🏗️ Project Structure

```
📱 Bookimbiber-2025/
├── 📄 app.json                # Expo app configuration
├── 📋 APPWRITE_SETUP.md       # Backend setup guide
├── 🛠️ DEV Cheatsheet.md       # Development commands
├── 🚀 EAS Cheatsheet.md       # Expo build commands
├── ⚙️ eas.json                # EAS build configuration
├── 📦 package.json            # Dependencies & scripts
├── 📖 README.md               # Project documentation
├── 🎨 style.css               # Global styles
├── 📂 app/                    # 🧭 Expo Router pages
│   ├── 🏠 index.jsx           # Welcome/landing page
│   ├── 📐 _layout.jsx         # Root layout
│   ├── 🔐 (auth)/             # Authentication screens
│   │   ├── 📐 _layout.jsx
│   │   ├── 🚪 login.jsx       # User login
│   │   └── ✍️ register.jsx    # User registration
│   └── 📊 (dashboard)/        # Main app screens
│       ├── 📐 _layout.jsx     # Dashboard layout with tabs
│       ├── 📚 books.jsx       # Book collection list
│       ├── ➕ create.jsx      # Add new book form
│       ├── 👤 profile.jsx     # User profile
│       └── 📖 books/[id].jsx  # Individual book details
├── 🖼️ assets/                 # App icons & images
│   ├── 🎯 adaptive-icon.png
│   ├── ⭐ favicon.png
│   ├── 📱 icon.png
│   ├── 🌊 splash-icon.png
│   ├── 🌊 splash.png
│   └── 🖼️ img/               # Custom images
│       ├── 🌙 logo_dark.png
│       ├── ☀️ logo_light.png
│       └── 🆕 NewLogo.png
├── 🧩 components/             # Reusable UI components
│   ├── 🔍 BookSearchModal.jsx # Google Books search
│   ├── 📏 Spacer.jsx          # Layout spacing
│   ├── 🔘 ThemedButton.jsx    # Styled button
│   ├── 🃏 ThemedCard.jsx      # Card container
│   ├── ⏳ ThemedLoader.jsx    # Loading spinner
│   ├── 🏷️ ThemedLogo.jsx      # App logo component
│   ├── 🔒 ThemedPasswordInput.jsx # Password field
│   ├── 📝 ThemedText.jsx      # Styled text
│   ├── 📝 ThemedTextInput.jsx # Styled input
│   ├── 📦 ThemedView.jsx      # Styled container
│   ├── 🌓 ThemeToggle.jsx     # Dark/light theme switch
│   └── 🔐 auth/               # Auth-specific components
│       ├── 👻 GuestOnly.jsx   # Guest user wrapper
│       └── 👤 UserOnly.jsx    # Authenticated user wrapper
├── 🎨 constants/              # App constants
│   └── 🌈 Colors.js           # Theme color palette
├── 🔗 contexts/               # React Context providers
│   ├── 📚 BooksContext.jsx    # Book state management
│   ├── 🌓 ThemeContext.jsx    # Theme management
│   └── 👤 UserContext.jsx     # User authentication
├── 🪝 hooks/                  # Custom React hooks
│   ├── 📚 useBooks.js         # Book operations hook
│   └── 👤 useUser.js          # User management hook
├── 🔧 lib/                    # External service configs
│   ├── 🗄️ appwrite.js         # Appwrite backend config
│   ├── 👤 avatar.js           # Avatar generation
│   └── 📖 googleBooks.js      # Google Books API
└── 📜 scripts/                # Utility scripts
    ├── 🏗️ database-setup.js   # Database initialization
    └── 🧪 test-database-attributes.js # DB testing
```

## 🎯 Features in Development

- [ ] Reading progress tracking
- [ ] Book recommendations
- [ ] Social features (share books with friends)
- [ ] Export/import book collections
- [ ] Offline support
- [ ] Book notes and highlights
- [ ] Reading statistics and insights

## 🤝 Contributing

We love contributors! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev) for the amazing development platform
- [Appwrite](https://appwrite.io) for the backend services
- [Google Books API](https://developers.google.com/books) for book data
- The React Native community for endless inspiration

## 📞 Support

Having issues? Found a bug? Want to suggest a feature?

- 🐛 [Report a bug](https://github.com/your-username/bookimbiber-2025/issues)
- 💡 [Request a feature](https://github.com/your-username/bookimbiber-2025/issues)
- 💬 [Join our discussions](https://github.com/your-username/bookimbiber-2025/discussions)

---

**Happy Reading! 📚✨**

_Made with ❤️ and lots of ☕ by book lovers, for book lovers._
