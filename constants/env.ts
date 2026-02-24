export type TEnv = {
  apiUrl: string;

  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;

  googleWebClientId: string;
};

export const env: TEnv = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'NA',

  firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'NA',
  firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'NA',
  firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'NA',
  firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'NA',
  firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'NA',
  firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'NA',

  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'NA',
};
