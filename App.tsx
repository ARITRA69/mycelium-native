import { ActivityIndicator, View } from 'react-native';

import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useFirebaseAuth } from '@/context/auth-context';
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

const AppRoot = () => {
  const { user, isLoaded } = useFirebaseAuth();

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#a855f7" size="large" />
      </View>
    );
  }

  return user ? <AuthenticatedRoot /> : <LoginScreen />;
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoot />
      <StatusBar style="light" />
    </AuthProvider>
  );
};

export default App;
