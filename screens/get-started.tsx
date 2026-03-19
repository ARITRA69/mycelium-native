import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as MediaLibrary from 'expo-media-library';

type GetStartedScreenProps = {
  onNavigateToOnboarding: () => void;
  onNavigateToHome: () => void;
};

const GetStartedScreen = ({ onNavigateToOnboarding, onNavigateToHome }: GetStartedScreenProps) => {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleNavigateAfterSignIn = async (): Promise<void> => {
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status === 'granted') {
      onNavigateToHome();
    } else {
      onNavigateToOnboarding();
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      setIsSigningIn(true);

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();

      const idToken = signInResult.data?.idToken;
      if (!idToken) {
        throw new Error('No ID token found');
      }

      // Mimicking backend call — log user data instead of hitting API
      console.log('=== Google Sign-In Success ===');
      console.log('ID Token:', idToken);
      console.log('User Data:', JSON.stringify(signInResult.data, null, 2));
      console.log('==============================');

      await handleNavigateAfterSignIn();
    } catch (error: unknown) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Sign-In Failed', 'Something went wrong. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <Text className="text-3xl font-bold text-foreground mb-2">Welcome to Mycelium</Text>
      <Text className="text-muted-foreground mb-10">Your memories, organised.</Text>

      <TouchableOpacity
        className="w-full flex-row items-center justify-center rounded-xl py-4 px-6 bg-primary"
        onPress={handleGoogleSignIn}
        activeOpacity={0.8}
        disabled={isSigningIn}
      >
        {isSigningIn ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-white font-semibold text-lg">Sign in with Google</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default GetStartedScreen;
