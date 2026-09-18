import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { PokemonDetailScreen } from '../features/pokemon-detail/screens/PokemonDetailScreen';
import { PokemonListScreen } from '../features/pokemon-list/screens/PokemonListScreen';

export type RootStackParamList = {
  PokemonDetail: { pokemonId: number };
  PokemonList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          component={PokemonListScreen}
          name="PokemonList"
          options={{ title: 'Pokédex' }}
        />
        <Stack.Screen
          component={PokemonDetailScreen}
          name="PokemonDetail"
          options={{ title: 'Detalhes do Pokémon' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
