const { withInfoPlist, withXcodeProject } = require('expo/config-plugins');

function withiPadSupport(config) {
  console.log('[withiPadSupport] Applying iPad device family overrides...');

  config = withInfoPlist(config, (config) => {
    const before = config.modResults.UIDeviceFamily;
    config.modResults.UIDeviceFamily = [1, 2];
    console.log(`[withiPadSupport] Info.plist UIDeviceFamily: ${JSON.stringify(before)} -> [1, 2]`);
    return config;
  });

  config = withXcodeProject(config, (config) => {
    const project = config.modResults;
    const configurations = project.pbxXCBuildConfigurationSection();
    let patchCount = 0;
    for (const { buildSettings } of Object.values(configurations || {})) {
      if (buildSettings?.PRODUCT_NAME !== undefined) {
        const before = buildSettings.TARGETED_DEVICE_FAMILY;
        buildSettings.TARGETED_DEVICE_FAMILY = '"1,2"';
        patchCount++;
        if (patchCount === 1) {
          console.log(`[withiPadSupport] pbxproj TARGETED_DEVICE_FAMILY: ${before} -> "1,2"`);
        }
      }
    }
    console.log(`[withiPadSupport] Patched ${patchCount} build configurations`);
    return config;
  });

  return config;
}

module.exports = withiPadSupport;
