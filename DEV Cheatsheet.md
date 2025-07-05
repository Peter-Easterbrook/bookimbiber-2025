# 🛠️ General Dev CLI Cheat Sheet

## 📂 **Git Essentials**

| Command                   | Description                              |
| ------------------------- | ---------------------------------------- |
| `git init`                | 🌱 Initialize a new git repository       |
| `git add .`               | Stage all changes for commit             |
| `git commit -m "message"` | 💾 Commit staged changes with a message  |
| `git push --all`          | Push all branches to remote              |
| `git pull`                | 📥 Pull changes from remote repository   |
| `git status`              | Check status of working directory        |
| `git log --oneline`       | 📜 View commit history in compact format |

## 🌿 **Git Branches & Remote**

| Command                            | Description                                   |
| ---------------------------------- | --------------------------------------------- |
| `git branch`                       | List local branches                           |
| `git branch -a`                    | 🔍 List all branches (local and remote)       |
| `git checkout -b branch-name`      | Create and switch to new branch               |
| `git merge branch-name`            | 🔀 Merge specified branch into current branch |
| `git remote add origin <repo-url>` | Add a remote repository                       |
| `git push -u origin master`        | Push to master and set upstream               |

## 🧹 **Git Cleanup**

| Command                           | Description                                       |
| --------------------------------- | ------------------------------------------------- |
| `git rm <filename> --cached`      | 🗑️ Remove a file from git tracking (keep locally) |
| `git rm -r --cached node_modules` | Remove node_modules from git tracking             |
| `git clean -fd`                   | Remove untracked files and directories            |
| `git reset --hard HEAD`           | ⏪ Discard all local changes to tracked files     |
| `git restore --staged <file>`     | Unstage a file                                    |

## 📦 **NPM/Yarn Commands**

| Command                            | Description                                              |
| ---------------------------------- | -------------------------------------------------------- |
| `npm install`                      | Install dependencies                                     |
| `npm run dev`                      | 🚀 Run the development server                            |
| `npm test`                         | Run tests                                                |
| `npm update`                       | Update all packages                                      |
| `npm list --depth=0`               | 📋 List installed packages                               |
| `npm install -g npkill`            | Install npkill globally (for cleaning node_modules)      |
| `npx npkill`                       | Run npkill to remove node_modules folders                |
| `ncu --interactive --format group` | 📊 Interactively update npm packages                     |
| `npm install --legacy-peer-deps`   | Install dependencies, ignoring peer dependency conflicts |

## 🧰 **Node Version & Management**

| Command                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `node -v`              | Check Node.js version                          |
| `nvm list`             | 📝 List installed Node versions (if using nvm) |
| `nvm use 16.14.0`      | Switch to specific Node version                |
| `choco upgrade nodejs` | Upgrade Node.js using Chocolatey (Windows)     |

## ⚡ **VS Code & Project Utilities**

| Command                                 | Description                                    |
| --------------------------------------- | ---------------------------------------------- |
| `code .`                                | 📝 Open current directory in VS Code           |
| `npm run new-component SomeComponent`   | Create a new component file (if script exists) |
| `touch README.md`                       | Create a new README.md file                    |
| `mkdir -p src/{components,pages,utils}` | Create nested directory structure              |

## 🗑️ **Cleanup Commands**

| Command                                                          | Description                                  |
| ---------------------------------------------------------------- | -------------------------------------------- |
| `rm -rf node_modules package-lock.json`                          | 🧹 Remove node_modules and lock file         |
| `git commit -m "Removed node_module folder"`                     | Commit removal of node_modules from repo     |
| `find . -name "node_modules" -type d -prune -exec rm -rf '{}' +` | Find and remove all node_modules directories |

## 📄 **Create a .gitignore File**

Run this script to create a basic .gitignore file for your web/Node.js projects:

```bash
cat > .gitignore << 'EOL'
# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local
.env

# typescript
*.tsbuildinfo

EOL

echo "✅ Created .gitignore with common patterns for web and Node.js projects"
```

## 💡 **Pro Tips**

- Use `git add -p` to interactively stage changes in hunks
- Create aliases for frequently used commands in your `.bashrc` or `.zshrc`
- Use `npx` to run locally installed packages without global installation
- Learn to use `git rebase -i HEAD~n` to clean up your commit history
- Use VSCode's integrated terminal for a smoother workflow
- Add `export NODE_OPTIONS=--max-old-space-size=4096` to your shell profile for large projects
