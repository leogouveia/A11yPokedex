import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  onChangeText: (value: string) => void;
  value: string;
};

export function PokemonSearchInput({ onChangeText, value }: Props) {
  return (
    <View style={styles.container}>
      <Text
        accessibilityElementsHidden
        allowFontScaling
        importantForAccessibility="no"
        nativeID="pokemon-search-label"
        style={styles.label}
      >
        Buscar Pokémon
      </Text>
      <TextInput
        accessibilityHint="Pesquise por nome, número da Pokédex ou tipo."
        accessibilityLabel="Buscar Pokémon"
        accessibilityLabelledBy="pokemon-search-label"
        allowFontScaling
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder="Nome, número ou tipo"
        placeholderTextColor="#486581"
        returnKeyType="search"
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
    paddingTop: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#486581',
    borderRadius: 6,
    borderWidth: 1,
    color: '#102A43',
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  label: {
    color: '#102A43',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
});
