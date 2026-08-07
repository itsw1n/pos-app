import React from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { categoryBarStyles } from './CategoryBar.styles';

export const ALL_CATEGORIES = 'All';

interface CategoryBarProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export function CategoryBar({
  categories,
  activeCategory,
  onSelect,
}: CategoryBarProps): React.JSX.Element {
  const names = [ALL_CATEGORIES, ...categories];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={categoryBarStyles.scroll}
      contentContainerStyle={categoryBarStyles.content}
    >
      {names.map((name) => {
        const isActive = name === activeCategory;
        return (
          <Pressable
            key={name}
            style={[
              categoryBarStyles.chip,
              isActive ? categoryBarStyles.chipActive : null,
            ]}
            onPress={() => onSelect(name)}
          >
            <Text
              style={[
                categoryBarStyles.chipText,
                isActive ? categoryBarStyles.chipTextActive : null,
              ]}
            >
              {name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
