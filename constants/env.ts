export type TEnv = {
  apiUrl: string;
};

export const env: TEnv = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'NA',
};
