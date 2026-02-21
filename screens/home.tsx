import { Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/hooks/use-auth';

const HomeScreen = () => {
  const { user, token, signOut } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <Text className="text-2xl font-bold text-foreground mb-2">
        {user?.firstName ? `Hey, ${user.firstName}` : 'Home'}
      </Text>
      <Text className="text-muted-foreground mb-2">
        {user?.primaryEmailAddress?.emailAddress}
      </Text>
      <Text className="text-xs text-muted-foreground mb-10 text-center" numberOfLines={3}>
        {token ?? 'No token'}
      </Text>

      <TouchableOpacity
        className="w-full flex-row items-center justify-center rounded-xl bg-white/10 py-4 px-6"
        onPress={signOut}
      >
        <Text className="text-foreground font-semibold text-lg">Sign out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
