import { useState } from 'react';

import { useClerk, useSSO, useUser } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

interface UseAuthReturn {
  user: ReturnType<typeof useUser>['user'];
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const useAuth = (): UseAuthReturn => {
  const { startSSOFlow } = useSSO();
  const { signOut: clerkSignOut } = useClerk();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setIsLoading(true);

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
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

  return { user, isLoading, signInWithGoogle, signOut };
};

export { useAuth };
