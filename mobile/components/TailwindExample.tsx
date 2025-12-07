import React from 'react';
import { View, Text } from 'react-native';

export default function TailwindExample() {
  return (
    <View className="p-4 bg-white dark:bg-black rounded-md">
      <Text className="text-lg text-black dark:text-white">NativeWind is working ✅</Text>
    </View>
  );
}
