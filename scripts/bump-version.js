#!/usr/bin/env node

/**
 * Version Bump Script
 * Automatically increments version numbers in package.json and app.json
 *
 * Usage:
 *   node scripts/bump-version.js [patch|minor|major]
 *   npm run bump-version [patch|minor|major]
 *
 * Default: patch (e.g., 1.0.12 -> 1.0.13)
 */

const fs = require('fs');
const path = require('path');

// Get version bump type from command line args (default to 'patch')
const bumpType = process.argv[2] || 'patch';

if (!['patch', 'minor', 'major'].includes(bumpType)) {
  console.error('❌ Invalid bump type. Use: patch, minor, or major');
  process.exit(1);
}

// File paths (using process.cwd() for better compatibility)
const rootDir = process.cwd();
const packageJsonPath = path.join(rootDir, 'package.json');
const appJsonPath = path.join(rootDir, 'app.json');

/**
 * Increment version based on bump type
 */
function incrementVersion(version, type) {
  const parts = version.split('.').map(Number);

  switch (type) {
    case 'major':
      parts[0] += 1;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1] += 1;
      parts[2] = 0;
      break;
    case 'patch':
    default:
      parts[2] += 1;
      break;
  }

  return parts.join('.');
}

try {
  // Read package.json
  console.log('📖 Reading package.json...');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const oldVersion = packageJson.version;

  // Calculate new version
  const newVersion = incrementVersion(oldVersion, bumpType);
  console.log(`🔼 Bumping ${bumpType} version: ${oldVersion} → ${newVersion}`);

  // Update package.json
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ Updated package.json');

  // Read and update app.json
  console.log('📖 Reading app.json...');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  appJson.expo.version = newVersion;
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
  console.log('✅ Updated app.json');

  console.log('');
  console.log('🎉 Version bump complete!');
  console.log(`   New version: ${newVersion}`);
  console.log('');
  console.log('💡 Note: EAS will auto-increment versionCode/buildNumber for Android/iOS builds');

} catch (error) {
  console.error('❌ Error bumping version:', error.message);
  process.exit(1);
}
