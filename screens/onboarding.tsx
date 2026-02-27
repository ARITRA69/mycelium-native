import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

import * as MediaLibrary from 'expo-media-library';

type OnboardingScreenProps = {
  onComplete: () => void;
};

const OnboardingScreen = ({ onComplete }: OnboardingScreenProps) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermissions = async (): Promise<void> => {
    if (isRequesting) return;
    try {
      setIsRequesting(true);
      await MediaLibrary.requestPermissionsAsync(false, ['photo', 'video']);
      onComplete();
    } catch (err) {
      console.error('Failed to request permissions:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = (): void => {
    onComplete();
  };

  return (
    <View className="flex-1 bg-background px-6 pt-16 pb-10">
      <View className="flex-1 items-center justify-center">
        <View className="w-28 h-28 rounded-3xl items-center justify-center mb-8 bg-primary-background">
          <Text className="text-[52px]">🖼️</Text>
        </View>

        <Text className="text-3xl font-bold text-foreground text-center mb-4">
          Access your library
        </Text>
        <Text className="text-muted-foreground text-center text-base leading-6 px-4">
          Mycelium needs access to your photos and videos to help you organise and relive your
          memories.
        </Text>
      </View>

      <View className="w-full gap-3">
        <TouchableOpacity
          className={`w-full items-center justify-center rounded-xl py-4 px-6 ${isRequesting ? 'bg-primary/40' : 'bg-primary'}`}
          onPress={handleRequestPermissions}
          disabled={isRequesting}
          activeOpacity={0.8}
        >
          {isRequesting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-semibold text-lg">Allow Access</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full items-center justify-center py-3"
          onPress={handleSkip}
          disabled={isRequesting}
          activeOpacity={0.7}
        >
          <Text className="text-muted-foreground font-medium">Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingScreen;
