export type TEnv = {
  clerkPublishableKey: string;
  apiUrl: string;
};

export const env: TEnv = {
  clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'NA',
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'NA',
};
