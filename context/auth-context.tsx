import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { onAuthStateChanged, type User } from 'firebase/auth';

import { setTokenGetter } from '@/lib/api';
import { firebaseAuth } from '@/lib/firebase';

type AuthContextType = {
  user: User | null;
  isLoaded: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextType>({ user: null, isLoaded: false });

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (firebaseUser) {
        setTokenGetter(() => firebaseUser.getIdToken());
      } else {
        setTokenGetter(() => Promise.resolve(null));
      }
      setUser(firebaseUser);
      setIsLoaded(true);
    });

    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={{ user, isLoaded }}>{children}</AuthContext.Provider>;
};

const useFirebaseAuth = (): AuthContextType => useContext(AuthContext);

export { AuthProvider, useFirebaseAuth };
