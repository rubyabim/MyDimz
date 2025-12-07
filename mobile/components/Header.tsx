import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function Header({ title = '' }: { title?: string }) {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const buttonColor = colorScheme === 'dark' ? Colors.light.tint : tint;

  return (
    <ThemedView style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ThemedText type="title">{title}</ThemedText>
        <TouchableOpacity style={{ padding: 6, borderRadius: 8, backgroundColor: buttonColor }}>
          <IconSymbol name="house.fill" color="#fff" size={18} />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
