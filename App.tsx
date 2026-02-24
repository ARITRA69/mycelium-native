import { ActivityIndicator, View } from 'react-native';

import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { StatusBar } from 'expo-status-bar';

import { env } from '@/constants/env';
import { useOnboarding } from '@/hooks/use-onboarding';
import HomeScreen from '@/screens/home';
import LoginScreen from '@/screens/login';
import OnboardingScreen from '@/screens/onboarding';

import './global.css';

const AuthenticatedRoot = () => {
  const { isLoaded, isOnboardingComplete } = useOnboarding();

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#a855f7" size="large" />
      </View>
    );
  }

  return isOnboardingComplete ? <HomeScreen /> : <OnboardingScreen />;
};

const App = () => {
  return (
    <ClerkProvider
      publishableKey={env.clerkPublishableKey}
      tokenCache={tokenCache}
    >
      <SignedIn>
        <AuthenticatedRoot />
      </SignedIn>
      <SignedOut>
        <LoginScreen />
      </SignedOut>
      <StatusBar style="light" />
    </ClerkProvider>
  );
};

export default App;
