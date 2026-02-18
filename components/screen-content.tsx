import React from 'react';
import { Text, View } from 'react-native';

import { EditScreenInfo } from './edit-screenInfo';

type ScreenContentProps = {
  title: string;
  path: string;
  children?: React.ReactNode;
};

export const ScreenContent = ({ title, path, children }: ScreenContentProps) => {
  return (
    <View className="items-center flex-1 justify-center bg-background">
      <Text className="text-xl font-bold text-foreground">{title}</Text>
      <View className="h-[1px] my-7 w-4/5 bg-border" />
      <EditScreenInfo path={path} />
      {children}
    </View>
  );
};
