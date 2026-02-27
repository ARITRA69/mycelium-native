import { useState } from 'react';

import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import GetStartedScreen from '@/screens/get-started';
import HomeScreen from '@/screens/home';
import OnboardingScreen from '@/screens/onboarding';

import './global.css';

type Screen = 'get-started' | 'onboarding' | 'home';

const App = () => {
  const [screen, setScreen] = useState<Screen>('get-started');

  const renderScreen = () => {
    if (screen === 'home') return <HomeScreen />;
    if (screen === 'onboarding') return <OnboardingScreen onComplete={() => setScreen('home')} />;
    return (
      <GetStartedScreen
        onNavigateToOnboarding={() => setScreen('onboarding')}
        onNavigateToHome={() => setScreen('home')}
      />
    );
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        {renderScreen()}
        <StatusBar style="light" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
