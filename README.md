[![npm version](https://img.shields.io/npm/v/expo-eas-ipad-support)](https://www.npmjs.com/package/expo-eas-ipad-support) [![npm downloads](https://img.shields.io/npm/dm/expo-eas-ipad-support)](https://www.npmjs.com/package/expo-eas-ipad-support) [![license](https://img.shields.io/npm/l/expo-eas-ipad-support)](https://github.com/vaiden/expo-eas-ipad-support/blob/main/LICENSE)

# expo-eas-ipad-support

A build-time Expo config plugin that fixes iPad apps running in zoomed iPhone compatibility mode.

## The Problem

Expo's built-in `supportsTablet: true` setting in `app.json` is supposed to set `UIDeviceFamily = [1, 2]` in the final iOS build. Due to a known Expo bug ([#32344](https://github.com/expo/expo/issues/32344)), the setting doesn't propagate to the built `Info.plist`, resulting in `UIDeviceFamily = [1]` (iPhone only). iPad then runs the app in zoomed iPhone compatibility mode instead of at native resolution.

## Installation

```bash
npx expo install expo-eas-ipad-support
```

or

```bash
npm install expo-eas-ipad-support
```

## Usage

Add the plugin to the `plugins` array in your `app.json` or `app.config.js`. It should be listed **before** other plugins:

```json
{
  "expo": {
    "plugins": [
      "expo-eas-ipad-support",
      "expo-router",
      ...
    ]
  }
}
```

Then rebuild via EAS (native config changes require a new build):

```bash
eas build --platform ios
```

## How It Works

The plugin applies two patches to the generated native Xcode project during `expo prebuild`:

1. **Info.plist** -- Sets `UIDeviceFamily = [1, 2]`. This is the key iOS reads at launch to decide whether to run the app natively or in zoomed iPhone compatibility mode.

2. **pbxproj** -- Sets `TARGETED_DEVICE_FAMILY = "1,2"` in the Xcode build settings. This is what Xcode uses during compilation to embed the correct device family into the final binary.

Both are necessary because they serve different purposes in the iOS build pipeline.

## When It Runs

The plugin is a **build-time** hook that runs during `expo prebuild` (which EAS triggers automatically before compiling). It never runs at app runtime.

```
eas build --platform ios
  |
  +-- expo prebuild (generates native Xcode project from app.json)
  |     |
  |     +-- Config plugins execute here, in order:
  |           1. expo-eas-ipad-support  <-- patches the generated project
  |           2. expo-router
  |           3. other plugins...
  |     |
  |     +-- Native Xcode project is now on disk with correct settings
  |
  +-- xcodebuild (compiles the patched Xcode project into .app)
  |
  +-- .app artifact uploaded to EAS
```

## Local Verification

Verify without a cloud build:

```bash
npx expo prebuild --platform ios --clean

# Check Info.plist
plutil -p ios/<AppName>/Info.plist | grep -A3 UIDeviceFamily

# Check pbxproj
grep TARGETED_DEVICE_FAMILY ios/<AppName>.xcodeproj/project.pbxproj

# Clean up generated native project
rm -rf ios/
```

## Characteristics

- Pure JavaScript, ~30 lines
- Only touches the generated throwaway native project (not your source code)
- Zero runtime overhead
- No additional dependencies (uses `withInfoPlist` and `withXcodeProject` from `expo/config-plugins`, already a transitive dependency of every Expo project)

## License

Apache 2.0 -- see [LICENSE](LICENSE) for details.
