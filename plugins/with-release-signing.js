const { withAppBuildGradle } = require("@expo/config-plugins");

const signingConfig = `
        release {
            if (project.hasProperty('DARSHUB_UPLOAD_STORE_FILE')) {
                storeFile file(DARSHUB_UPLOAD_STORE_FILE)
                storePassword DARSHUB_UPLOAD_STORE_PASSWORD
                keyAlias DARSHUB_UPLOAD_KEY_ALIAS
                keyPassword DARSHUB_UPLOAD_KEY_PASSWORD
            }
        }`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (mod) => {
    let gradle = mod.modResults.contents;
    if (!gradle.includes("DARSHUB_UPLOAD_STORE_FILE")) {
      gradle = gradle.replace(/signingConfigs\s*\{/, (match) => `${match}${signingConfig}`);
      gradle = gradle.replace(
        /(release\s*\{[^}]*?)signingConfig signingConfigs\.debug/,
        "$1signingConfig project.hasProperty('DARSHUB_UPLOAD_STORE_FILE') ? signingConfigs.release : signingConfigs.debug",
      );
    }
    mod.modResults.contents = gradle;
    return mod;
  });
};
