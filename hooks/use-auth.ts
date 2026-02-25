import { useEffect, useState } from 'react';

import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { api, setTokenGetter } from '@/lib/api';
import { firebaseAuth } from '@/lib/firebase';
import { useFirebaseAuth } from '@/context/auth-context';
import { env } from '@/constants/env';

WebBrowser.maybeCompleteAuthSession();

type UseAuthReturn = {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const useAuth = (): UseAuthReturn => {
  const { user } = useFirebaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const [_request, _response, promptAsync] = Google.useAuthRequest({
    webClientId: env.googleWebClientId,
    androidClientId: env.googleWebClientId,
  });

  useEffect(() => {
    if (user) {
      user.getIdToken().then(setToken);
    }
  }, [user]);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const result = await promptAsync();

      if (result.type === 'success') {
        const { id_token } = result.params;
        const credential = GoogleAuthProvider.credential(id_token);
        const userCredential = await signInWithCredential(firebaseAuth, credential);

        // Ensure token getter is set before the backend sync call
        setTokenGetter(() => userCredential.user.getIdToken());

        try {
          await api.get('/user/me');
        } catch (err) {
          console.error('User sync failed, rolling back session:', err);
          await firebaseSignOut(firebaseAuth);
        }
      }
    } catch (err) {
      console.error('OAuth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    await firebaseSignOut(firebaseAuth);
  };

  return { user, isLoading, token, signInWithGoogle, signOut };
};

export { useAuth };
