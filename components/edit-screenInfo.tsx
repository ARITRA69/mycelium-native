import { Text, View } from 'react-native';

export const EditScreenInfo = ({ path }: { path: string }) => {
  const title = 'Open up the code for this screen:';
  const description =
    'Change any of the text, save the file, and your app will automatically update.';

  return (
    <View>
      <View className="items-center mx-12">
        <Text className="text-lg leading-6 text-center text-muted-foreground">{title}</Text>
        <View className="rounded-xl px-5 py-3 bg-white/90 border border-white my-2">
          <Text className="text-background font-semibold">{path}</Text>
        </View>
        <Text className="text-lg leading-6 text-center text-muted-foreground">{description}</Text>
      </View>
    </View>
  );
};


