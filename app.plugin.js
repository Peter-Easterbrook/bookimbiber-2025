const { withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * Fixes a JitPack timeout issue where Gradle tries to resolve org.bouncycastle
 * packages (a transitive dep of expo-updates) from JitPack instead of Maven Central.
 * Forcing the version here tells Gradle to use what's already on Maven Central.
 */
const withBouncyCastleFix = (config) => {
  return withProjectBuildGradle(config, (config) => {
    const contents = config.modResults.contents;

    if (contents.includes('bcprov-jdk15to18')) {
      // Already patched
      return config;
    }

    const patch = `
// Fix: force bouncycastle resolution from Maven Central, not JitPack
subprojects {
    configurations.all {
        resolutionStrategy {
            force 'org.bouncycastle:bcprov-jdk15to18:1.81'
            force 'org.bouncycastle:bcutil-jdk15to18:1.81'
        }
    }
}
`;

    // Append before the last line of the file
    config.modResults.contents = contents.trimEnd() + '\n' + patch;
    return config;
  });
};

module.exports = withBouncyCastleFix;
