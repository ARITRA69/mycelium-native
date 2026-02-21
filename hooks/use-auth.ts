import { useEffect, useState } from 'react';

import { useAuth as useClerkAuth, useClerk, useSSO, useUser } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';

import { api, setTokenGetter } from '@/lib/api';

WebBrowser.maybeCompleteAuthSession();

type UseAuthReturn = {
  user: ReturnType<typeof useUser>['user'];
  isLoading: boolean;
  token: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const useAuth = (): UseAuthReturn => {
  const { startSSOFlow } = useSSO();
  const { signOut: clerkSignOut } = useClerk();
  const { user } = useUser();
  const { getToken } = useClerkAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Register getToken once on mount so the API interceptor always has it
  setTokenGetter(getToken);

  useEffect(() => {
    if (user) {
      getToken().then(setToken);
    }
  }, [user, getToken]);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setIsLoading(true);

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });

        try {
          await api.get('/user/me');
        } catch (err) {
          console.error('User sync failed, rolling back session:', err);
          await clerkSignOut();
        }
      }
    } catch (err) {
      console.error('OAuth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    await clerkSignOut();
  };

  return { user, isLoading, token, signInWithGoogle, signOut };
};

export { useAuth };
