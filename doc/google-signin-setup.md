# Google Sign-In Setup Guide

This guide walks through setting up Google Sign-In in a React Native Expo project using `@react-native-google-signin/google-signin`.

> **Important:** Google Sign-In requires native code. It will NOT work in Expo Go. You must use a **development build**.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create a Firebase Project](#2-create-a-firebase-project)
3. [Register Your Android App in Firebase](#3-register-your-android-app-in-firebase)
4. [Get Your Debug SHA-1 Fingerprint](#4-get-your-debug-sha-1-fingerprint)
5. [Add SHA-1 to Firebase](#5-add-sha-1-to-firebase)
6. [Download google-services.json](#6-download-google-servicesjson)
7. [Enable Google Sign-In in Firebase Auth](#7-enable-google-sign-in-in-firebase-auth)
8. [Install Dependencies](#8-install-dependencies)
9. [Configure app.json](#9-configure-appjson)
10. [Generate the Android Folder (Prebuild)](#10-generate-the-android-folder-prebuild)
11. [Add Code for Google Sign-In](#11-add-code-for-google-sign-in)
12. [Build the Development APK](#12-build-the-development-apk)
13. [Run the App](#13-run-the-app)
14. [Common Errors and Fixes](#14-common-errors-and-fixes)

---

## 1. Prerequisites

- Node.js installed
- Bun installed (`npm install -g bun`)
- Android Studio installed (for Android SDK and emulator)
- A Google account
- A physical Android device or emulator

---

## 2. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Enter a project name and follow the setup wizard
4. Once created, you'll land on the project dashboard

---

## 3. Register Your Android App in Firebase

1. In your Firebase project, click the **Android icon** to add an Android app
2. Enter your **package name** — this must match your `app.json` android package name:
   ```
   com.aritra69.mycelium
   ```
3. Optionally enter an app nickname
4. Click **Register app**
5. Download the `google-services.json` file (we'll place it later)

---

## 4. Get Your Debug SHA-1 Fingerprint

The SHA-1 fingerprint identifies your app's signing key. For debug builds, it comes from the default debug keystore.

### If you already have the `android/` folder:

```sh
cd android && ./gradlew signingReport
```

Look for the output under `Variant: debug` and copy the `SHA1` value.

### If you don't have the `android/` folder yet:

First generate it with prebuild:

```sh
bunx expo prebuild --platform android
```

Then run the signing report:

```sh
cd android && ./gradlew signingReport
```

Copy the `SHA1` fingerprint from the `debug` variant output.

---

## 5. Add SHA-1 to Firebase

1. Go to **Firebase Console** > **Project Settings** (gear icon)
2. Scroll down to **Your apps** > select your Android app
3. Click **Add fingerprint**
4. Paste your debug SHA-1 fingerprint
5. Click **Save**

> **Note:** If you later create a release build with a different keystore, you'll need to add that SHA-1 as well.

---

## 6. Download google-services.json

1. Still in **Project Settings** > **Your apps** > Android app
2. Click **Download google-services.json**
3. Place this file in **two locations**:
   - Project root: `./google-services.json`
   - Android app folder: `./android/app/google-services.json` (after prebuild)

> **Important:** Every time you add a new SHA-1 or change OAuth settings, re-download this file.

---

## 7. Enable Google Sign-In in Firebase Auth

1. In Firebase Console, go to **Build** > **Authentication**
2. Click **Get started** if you haven't enabled Auth yet
3. Go to the **Sign-in method** tab
4. Click **Google** > **Enable**
5. Select a support email and click **Save**

---

## 8. Install Dependencies

```sh
# Google Sign-In package
bun add @react-native-google-signin/google-signin

# Expo dev client (required for development builds)
bun add expo-dev-client
```

---

## 9. Configure app.json

Add the Google Sign-In config plugin and the `google-services.json` reference to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID"
        }
      ]
    ],
    "android": {
      "googleServicesFile": "./google-services.json",
      "package": "com.aritra69.mycelium"
    }
  }
}
```

> Replace `YOUR_IOS_CLIENT_ID` with the iOS client ID from your Google Cloud Console (only needed for iOS).

---

## 10. Generate the Android Folder (Prebuild)

This generates the native `android/` directory with all plugins applied:

```sh
bunx expo prebuild --platform android
```

If you need to regenerate from scratch (e.g., after changing plugins):

```sh
bunx expo prebuild --platform android --clean
```

> **Warning:** `--clean` deletes the existing `android/` folder. Any manual native changes will be lost.

After prebuild, verify that `android/app/google-services.json` exists and contains your app's configuration.

---

## 11. Add Code for Google Sign-In

### Find Your Web Client ID

Open your `google-services.json` and find the `oauth_client` entry with `"client_type": 3` — this is your **Web Client ID**:

```json
{
  "oauth_client": [
    {
      "client_id": "XXXXXXXXXX-yyyyyyyy.apps.googleusercontent.com",
      "client_type": 3
    }
  ]
}
```

> **Critical:** Always use the `client_type: 3` (Web) client ID, NOT the `client_type: 1` (Android) one. Using the wrong type causes `DEVELOPER_ERROR`.

### Configure in App.tsx

```tsx
import { useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Use the client_type: 3 (Web) ID from google-services.json
const WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';

const App = () => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
    });
  }, []);

  // ...
};
```

### Sign-In Handler

```tsx
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const handleGoogleSignIn = async (): Promise<void> => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const signInResult = await GoogleSignin.signIn();

    const idToken = signInResult.data?.idToken;
    if (!idToken) {
      throw new Error('No ID token found');
    }

    console.log('Sign-In Success!');
    console.log('ID Token:', idToken);
    console.log('User:', JSON.stringify(signInResult.data, null, 2));
  } catch (error: unknown) {
    console.error('Google Sign-In Error:', error);
  }
};
```

---

## 12. Build the Development APK

Build and install the dev client on your connected device/emulator:

```sh
bunx expo run:android
```

This compiles all native modules (including `RNGoogleSignin`) into the APK and installs it.

The output APK is located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

You can also transfer this APK to a physical device manually if needed.

### Using EAS Build (Cloud)

Alternatively, build via EAS:

```sh
bunx eas build --profile development --platform android
```

---

## 13. Run the App

After the APK is installed on your device:

```sh
bunx expo start --dev-client
```

- If using an emulator or USB-connected device, press **`a`** to open the app
- If using a physical device on the same WiFi, enter the dev server URL shown in the terminal (e.g., `http://192.168.x.x:8081`)

> **Do NOT use Expo Go.** Always open the installed development build app.

---

## 14. Common Errors and Fixes

### `RNGoogleSignin could not be found`

**Cause:** You're running in Expo Go, which doesn't have native modules.

**Fix:** Build a development client with `bunx expo run:android` and use `bunx expo start --dev-client`.

---

### `DEVELOPER_ERROR`

**Cause:** Configuration mismatch between your app and Google Cloud Console.

**Fix checklist:**

1. **Web Client ID mismatch** — The `webClientId` in `GoogleSignin.configure()` must be the `client_type: 3` ID from your `google-services.json`, from the **same** Firebase project
2. **SHA-1 not added** — Your debug keystore SHA-1 must be added to Firebase. Run:
   ```sh
   cd android && ./gradlew signingReport
   ```
   Add the SHA-1 in Firebase Console > Project Settings > Your Android app > Add fingerprint
3. **Package name mismatch** — Your package name must be identical in:
   - `app.json` (`expo.android.package`)
   - `android/app/build.gradle` (`applicationId`)
   - Firebase Console (Android app registration)
4. **Stale google-services.json** — After adding SHA-1, re-download `google-services.json` from Firebase and replace it in both `./google-services.json` and `./android/app/google-services.json`
5. **Rebuild** — After any config change: `bunx expo run:android`

**Quick diagnosis:**
```sh
npx @react-native-google-signin/config-doctor
```

---

### `Unable to determine redirect location for runtime 'custom'`

**Cause:** Dev server started without `--dev-client` flag.

**Fix:**
```sh
bunx expo start --dev-client
```

---

### `Invalid URL` in dev build

**Cause:** The dev build app can't find the dev server.

**Fix:**
- Make sure your phone and PC are on the **same WiFi network**
- Enter the URL manually: `http://<YOUR_PC_IP>:8081`
- Or use tunnel mode: `bunx expo start --dev-client --tunnel`

---

## Quick Reference: Command Summary

| Step | Command |
|---|---|
| Install packages | `bun add @react-native-google-signin/google-signin expo-dev-client` |
| Generate android folder | `bunx expo prebuild --platform android` |
| Regenerate from scratch | `bunx expo prebuild --platform android --clean` |
| Get debug SHA-1 | `cd android && ./gradlew signingReport` |
| Build dev APK | `bunx expo run:android` |
| Start dev server | `bunx expo start --dev-client` |
| Start with tunnel | `bunx expo start --dev-client --tunnel` |
| Clear cache | `bunx expo start --dev-client --clear` |
| Run config doctor | `npx @react-native-google-signin/config-doctor` |
