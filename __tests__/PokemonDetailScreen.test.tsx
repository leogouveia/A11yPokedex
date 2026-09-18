import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Image } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import type { RootStackParamList } from '../src/app/AppNavigator';
import { PokemonDetailScreen } from '../src/features/pokemon-detail/screens/PokemonDetailScreen';

jest.mock('react-native', () => {
  const ReactRuntime = jest.requireActual('react');
  const create = (type: string) => (props: Record<string, unknown>) =>
    ReactRuntime.createElement(type, props, props.children);

  return {
    ActivityIndicator: create('ActivityIndicator'),
    Image: create('Image'),
    Pressable: create('Pressable'),
    ScrollView: create('ScrollView'),
    StyleSheet: { create: (styles: unknown) => styles },
    Text: create('Text'),
    View: create('View'),
  };
});

const mockUsePokemonDetail = jest.fn();

jest.mock('../src/features/pokemon-detail/hooks/usePokemonDetail', () => ({
  usePokemonDetail: (...args: unknown[]) => mockUsePokemonDetail(...args),
}));

const route = {
  key: 'PokemonDetail-1',
  name: 'PokemonDetail' as const,
  params: { pokemonId: 1 },
};
const push = jest.fn();
const navigation = { push } as unknown as NativeStackNavigationProp<
  RootStackParamList,
  'PokemonDetail'
>;

describe('PokemonDetailScreen', () => {
  beforeEach(() => {
    mockUsePokemonDetail.mockReset();
    push.mockReset();
  });

  it('renders an accessible loading state', () => {
    mockUsePokemonDetail.mockReturnValue({ isLoading: true });

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <PokemonDetailScreen navigation={navigation} route={route} />,
      );
    });

    expect(
      renderer.root.findByProps({
        accessibilityLabel: 'Carregando detalhes do Pokémon.',
      }),
    ).toBeTruthy();
  });

  it('renders an error with retry action', () => {
    const refetch = jest.fn();
    mockUsePokemonDetail.mockReturnValue({
      error: new Error('Falha de conexão.'),
      isError: true,
      isLoading: false,
      refetch,
    });

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <PokemonDetailScreen navigation={navigation} route={route} />,
      );
    });

    const retryButton = renderer.root.findByProps({
      accessibilityLabel: 'Tentar novamente',
    });
    expect(
      renderer.root.findByProps({ children: 'Falha de conexão.' }),
    ).toBeTruthy();
    ReactTestRenderer.act(() => retryButton.props.onPress());
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders detail sections and navigates through evolution', () => {
    mockUsePokemonDetail.mockReturnValue({
      data: {
        abilities: ['overgrow'],
        description: 'Descrição.',
        evolutions: [
          { id: 1, imageUrl: 'one', name: 'bulbasaur' },
          { id: 2, imageUrl: 'two', name: 'ivysaur' },
        ],
        height: 7,
        id: 1,
        imageUrl: 'art',
        moves: ['tackle'],
        name: 'bulbasaur',
        stats: [{ label: 'HP', value: 45 }],
        types: ['Planta'],
        weight: 69,
      },
      isError: false,
      isLoading: false,
    });

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <PokemonDetailScreen navigation={navigation} route={route} />,
      );
    });

    expect(renderer.root.findByProps({ children: 'Descrição.' })).toBeTruthy();
    expect(
      renderer.root.findByProps({
        children: 'Tipos',
        accessibilityRole: 'header',
      }),
    ).toBeTruthy();
    expect(renderer.root.findByProps({ children: 'Planta' })).toBeTruthy();
    const mainImage = renderer.root
      .findAllByType(Image)
      .find(image => image.props.source?.uri === 'art');
    expect(mainImage).toBeTruthy();
    expect(mainImage?.props.accessibilityElementsHidden).toBe(true);
    expect(mainImage?.props.accessible).toBe(false);
    expect(mainImage?.props.importantForAccessibility).toBe('no');
    const evolution = renderer.root.findByProps({
      accessibilityLabel: 'Ivysaur, número 2',
    });
    ReactTestRenderer.act(() => evolution.props.onPress());
    expect(push).toHaveBeenCalledWith('PokemonDetail', { pokemonId: 2 });
  });
});
