import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { PokemonListScreen } from '../features/pokemon-list/screens/PokemonListScreen';

export type RootStackParamList = {
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
