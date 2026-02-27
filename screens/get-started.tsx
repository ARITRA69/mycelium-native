import { Text, TouchableOpacity, View } from 'react-native';

import * as MediaLibrary from 'expo-media-library';

type GetStartedScreenProps = {
  onNavigateToOnboarding: () => void;
  onNavigateToHome: () => void;
};

const GetStartedScreen = ({ onNavigateToOnboarding, onNavigateToHome }: GetStartedScreenProps) => {
  const handleGetStarted = async (): Promise<void> => {
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status === 'granted') {
      onNavigateToHome();
    } else {
      onNavigateToOnboarding();
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <Text className="text-3xl font-bold text-foreground mb-2">Welcome to Mycelium</Text>
      <Text className="text-muted-foreground mb-10">Your memories, organised.</Text>

      <TouchableOpacity
        className="w-full items-center justify-center rounded-xl py-4 px-6 bg-primary"
        onPress={handleGetStarted}
        activeOpacity={0.8}
      >
        <Text className="text-white font-semibold text-lg">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GetStartedScreen;
