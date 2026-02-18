import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { StatusBar } from 'expo-status-bar';

import { env } from '@/constants/env';
import HomeScreen from '@/screens/home';
import LoginScreen from '@/screens/login';

import './global.css';

const App = () => {
  return (
    <ClerkProvider
      publishableKey={env.clerkPublishableKey}
      tokenCache={tokenCache}
    >
      <SignedIn>
        <HomeScreen />
      </SignedIn>
      <SignedOut>
        <LoginScreen />
      </SignedOut>
      <StatusBar style="light" />
    </ClerkProvider>
  );
};

export default App;
