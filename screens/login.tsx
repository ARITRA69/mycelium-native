import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';

import GoogleIcon from '@/assets/brands/google.png';

import { useAuth } from '@/hooks/use-auth';

const LoginScreen = () => {
  const { signInWithGoogle, isLoading } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <Text className="text-3xl font-bold text-foreground mb-2">Welcome</Text>
      <Text className="text-muted-foreground mb-10">Sign in to continue</Text>

      <TouchableOpacity
        className="w-full flex-row items-center justify-center rounded-xl bg-white/90 py-4 px-6"
        onPress={signInWithGoogle}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#0a0a0f" />
        ) : (
          <View className="flex-row items-center gap-2">
            <Image
              source={GoogleIcon}
              className="size-6"
            />
            <Text className="text-background font-semibold text-lg">
              Sign in with Google
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
