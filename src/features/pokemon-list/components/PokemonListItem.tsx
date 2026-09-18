import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { PokemonListItem as PokemonListItemModel } from '../../../domain/pokemon/models';

type Props = {
  pokemon: PokemonListItemModel;
};

function formatName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function PokemonListItem({ pokemon }: Props) {
  return (
    <View
      accessible
      accessibilityLabel={`${formatName(pokemon.name)}, número ${pokemon.id}`}
      style={styles.item}
    >
      <Image
        accessibilityElementsHidden
        accessible={false}
        source={{ uri: pokemon.imageUrl }}
        style={styles.image}
      />
      <View style={styles.textContent}>
        <Text style={styles.number}>{`#${String(pokemon.id).padStart(
          3,
          '0',
        )}`}</Text>
        <Text allowFontScaling style={styles.name}>
          {formatName(pokemon.name)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 80,
    padding: 12,
  },
  image: {
    height: 56,
    width: 56,
  },
  name: {
    color: '#102A43',
    fontSize: 18,
    fontWeight: '700',
  },
  number: {
    color: '#486581',
    fontSize: 14,
    marginBottom: 2,
  },
  textContent: {
    flex: 1,
    marginLeft: 12,
  },
});
