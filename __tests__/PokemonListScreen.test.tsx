import React from 'react';
import { FlatList } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { PokemonListScreen } from '../src/features/pokemon-list/screens/PokemonListScreen';

jest.mock('react-native', () => {
  const ReactRuntime = jest.requireActual('react');

  const View = (props: Record<string, unknown>) =>
    ReactRuntime.createElement('View', props, props.children);
  const Text = (props: Record<string, unknown>) =>
    ReactRuntime.createElement('Text', props, props.children);
  const Image = (props: Record<string, unknown>) =>
    ReactRuntime.createElement('Image', props, props.children);
  const Pressable = (props: Record<string, unknown>) =>
    ReactRuntime.createElement('Pressable', props, props.children);
  const ActivityIndicator = (props: Record<string, unknown>) =>
    ReactRuntime.createElement('ActivityIndicator', props, props.children);

  function TestFlatList(props: {
    accessibilityLabel?: string;
    data: unknown[];
    ListEmptyComponent?: unknown;
    ListFooterComponent?: unknown;
    renderItem: (value: { item: unknown }) => unknown;
  }) {
    const children = props.data.length
      ? props.data.map((item, index) =>
          ReactRuntime.createElement(
            ReactRuntime.Fragment,
            { key: index },
            props.renderItem({ item }),
          ),
        )
      : props.ListEmptyComponent;

    return ReactRuntime.createElement(
      View,
      { accessibilityLabel: props.accessibilityLabel },
      children,
      props.ListFooterComponent,
    );
  }

  return {
    ActivityIndicator,
    FlatList: TestFlatList,
    Image,
    Pressable,
    StyleSheet: { create: (styles: unknown) => styles },
    Text,
    View,
  };
});

const mockUsePokemonList = jest.fn();

jest.mock('../src/features/pokemon-list/hooks/usePokemonList', () => ({
  usePokemonList: () => mockUsePokemonList(),
}));

describe('PokemonListScreen', () => {
  it('renders an accessible loading state', () => {
    mockUsePokemonList.mockReturnValue({
      isLoading: true,
      isError: false,
    });

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<PokemonListScreen />);
    });
    expect(
      renderer.root.findByProps({ accessibilityRole: 'progressbar' }),
    ).toBeTruthy();
    expect(
      renderer.root.findByProps({ children: 'Carregando Pokémon.' }),
    ).toBeTruthy();
  });

  it('renders an empty state with retry action', async () => {
    const refetch = jest.fn();
    mockUsePokemonList.mockReturnValue({
      data: { pages: [{ items: [], nextOffset: null }] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isError: false,
      isFetchingNextPage: false,
      isLoading: false,
      isRefetching: false,
      refetch,
    });

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<PokemonListScreen />);
      await Promise.resolve();
    });
    const retryButton = renderer.root.findByProps({
      accessibilityLabel: 'Tentar novamente',
    });
    expect(
      renderer.root.findByProps({ children: 'Nenhum Pokémon encontrado.' }),
    ).toBeTruthy();

    await ReactTestRenderer.act(async () => retryButton.props.onPress());
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders successful Pokémon results', async () => {
    mockUsePokemonList.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: 1,
                name: 'bulbasaur',
                imageUrl: 'https://example.com/1.png',
              },
            ],
            nextOffset: 20,
          },
        ],
      },
      fetchNextPage: jest.fn(),
      hasNextPage: true,
      isError: false,
      isFetchingNextPage: false,
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn(),
    });

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<PokemonListScreen />);
      await Promise.resolve();
    });

    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Bulbasaur, número 1' }),
    ).toBeTruthy();
    expect(renderer.root.findByProps({ children: 'Bulbasaur' })).toBeTruthy();
  });

  it('renders an error with a retry action', () => {
    const refetch = jest.fn();
    mockUsePokemonList.mockReturnValue({
      error: new Error('Falha de conexão.'),
      isError: true,
      isLoading: false,
      refetch,
    });

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<PokemonListScreen />);
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

  it('requests the next page only when not already loading', async () => {
    const fetchNextPage = jest.fn();
    mockUsePokemonList.mockReturnValue({
      data: { pages: [{ items: [], nextOffset: 20 }] },
      fetchNextPage,
      hasNextPage: true,
      isError: false,
      isFetchingNextPage: false,
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn(),
    });

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<PokemonListScreen />);
      await Promise.resolve();
    });
    const list = renderer.root.findByType(FlatList);
    await ReactTestRenderer.act(async () => list.props.onEndReached());
    expect(fetchNextPage).toHaveBeenCalledTimes(1);

    mockUsePokemonList.mockReturnValue({
      data: { pages: [{ items: [], nextOffset: 20 }] },
      fetchNextPage,
      hasNextPage: true,
      isError: false,
      isFetchingNextPage: true,
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn(),
    });
    await ReactTestRenderer.act(async () => {
      renderer.update(<PokemonListScreen />);
      await Promise.resolve();
    });
    await ReactTestRenderer.act(async () => list.props.onEndReached());
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('shows the incremental loading footer', async () => {
    mockUsePokemonList.mockReturnValue({
      data: {
        pages: [{ items: [{ id: 1, name: 'bulbasaur', imageUrl: 'image' }] }],
      },
      fetchNextPage: jest.fn(),
      hasNextPage: true,
      isError: false,
      isFetchingNextPage: true,
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn(),
    });

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<PokemonListScreen />);
      await Promise.resolve();
    });

    expect(
      renderer.root.findByProps({ children: 'Carregando mais Pokémon.' }),
    ).toBeTruthy();
  });
});
