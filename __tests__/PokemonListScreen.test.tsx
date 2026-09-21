import React from 'react';
import { FlatList } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { PokemonListScreen } from '../src/features/pokemon-list/screens/PokemonListScreen';

const mockScrollToOffset = jest.fn();

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
  const Modal = (props: Record<string, unknown>) =>
    props.visible
      ? ReactRuntime.createElement('Modal', props, props.children)
      : null;
  const ScrollView = (props: Record<string, unknown>) =>
    ReactRuntime.createElement('ScrollView', props, props.children);
  const TextInput = (props: Record<string, unknown>) =>
    ReactRuntime.createElement('TextInput', props);

  const MockFlatList = ReactRuntime.forwardRef(function MockFlatListComponent(
    props: {
    accessibilityLabel?: string;
    data: unknown[];
    ListEmptyComponent?: unknown;
    ListFooterComponent?: unknown;
    renderItem: (value: { item: unknown }) => unknown;
    },
    ref: React.Ref<{ scrollToOffset: typeof mockScrollToOffset }>,
  ) {
    ReactRuntime.useImperativeHandle(ref, () => ({ scrollToOffset: mockScrollToOffset }));
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
  });

  return {
    ActivityIndicator,
    FlatList: MockFlatList,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet: { create: (styles: unknown) => styles },
    Text,
    TextInput,
    View,
  };
});

const mockUsePokemonList = jest.fn();
const mockUsePokemonSearch = jest.fn();

jest.mock('../src/features/pokemon-list/hooks/usePokemonList', () => ({
  usePokemonList: (...args: unknown[]) => mockUsePokemonList(...args),
}));
beforeEach(() => {
  mockUsePokemonList.mockReset();
  mockUsePokemonSearch.mockReset();
  mockScrollToOffset.mockReset();
  mockUsePokemonSearch.mockReturnValue({
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    refetch: jest.fn(),
  });
});

jest.mock('../src/features/pokemon-search/hooks/usePokemonSearch', () => ({
  usePokemonSearch: (...args: unknown[]) => mockUsePokemonSearch(...args),
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

  it('shows and activates the return-to-top button after significant scrolling', async () => {
    mockUsePokemonList.mockReturnValue({
      data: {
        pages: [
          {
            items: [{ id: 1, name: 'bulbasaur', imageUrl: 'image' }],
          },
        ],
      },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
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
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Voltar ao topo' }),
    ).toHaveLength(0);

    await ReactTestRenderer.act(async () => {
      list.props.onScroll({ nativeEvent: { contentOffset: { y: 399 } } });
    });
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Voltar ao topo' }),
    ).toHaveLength(0);

    await ReactTestRenderer.act(async () => {
      list.props.onScroll({ nativeEvent: { contentOffset: { y: 400 } } });
    });
    const scrollToTopButton = renderer.root.findByProps({
      accessibilityLabel: 'Voltar ao topo',
    });
    expect(scrollToTopButton.props.accessibilityRole).toBe('button');
    expect(scrollToTopButton.props.accessibilityHint).toBe(
      'Volta a lista para o início.',
    );

    ReactTestRenderer.act(() => scrollToTopButton.props.onPress());
    expect(mockScrollToOffset).toHaveBeenCalledWith({
      offset: 0,
      animated: true,
    });
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

  it('keeps loaded items visible and offers an accessible retry after incremental failure', async () => {
    const fetchNextPage = jest.fn();
    const refetch = jest.fn();
    mockUsePokemonList.mockReturnValue({
      data: {
        pages: [
          {
            items: [{ id: 1, name: 'bulbasaur', imageUrl: 'image' }],
          },
        ],
      },
      error: new Error('Falha ao carregar a próxima página.'),
      fetchNextPage,
      hasNextPage: true,
      isError: true,
      isFetchNextPageError: true,
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

    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Bulbasaur, número 1' }),
    ).toBeTruthy();
    expect(
      renderer.root.findByProps({
        children: 'Não foi possível carregar mais Pokémon. Tente novamente.',
      }),
    ).toBeTruthy();

    const retryButton = renderer.root.findByProps({
      accessibilityLabel: 'Tentar novamente',
    });
    expect(retryButton.props.accessibilityRole).toBe('button');

    await ReactTestRenderer.act(async () => retryButton.props.onPress());
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
    expect(refetch).not.toHaveBeenCalled();
  });

  it('shows incremental loading instead of the error while retrying the next page', async () => {
    const fetchNextPage = jest.fn();
    const baseQuery = {
      data: {
        pages: [
          {
            items: [{ id: 1, name: 'bulbasaur', imageUrl: 'image' }],
          },
        ],
      },
      fetchNextPage,
      hasNextPage: true,
      isError: true,
      isFetchNextPageError: true,
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn(),
    };
    mockUsePokemonList.mockReturnValue({
      ...baseQuery,
      isFetchingNextPage: false,
    });

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<PokemonListScreen />);
      await Promise.resolve();
    });
    expect(
      renderer.root.findByProps({
        children: 'Não foi possível carregar mais Pokémon. Tente novamente.',
      }),
    ).toBeTruthy();

    mockUsePokemonList.mockReturnValue({
      ...baseQuery,
      isFetchNextPageError: false,
      isFetchingNextPage: true,
    });
    await ReactTestRenderer.act(async () => {
      renderer.update(<PokemonListScreen />);
      await Promise.resolve();
    });

    expect(
      renderer.root.findByProps({ children: 'Carregando mais Pokémon.' }),
    ).toBeTruthy();
    expect(
      renderer.root.findAllByProps({
        children: 'Não foi possível carregar mais Pokémon. Tente novamente.',
      }),
    ).toHaveLength(0);
  });

  it('supports filtering by type and generation simultaneously', async () => {
    mockUsePokemonList.mockReturnValue({
      data: { pages: [{ items: [], nextOffset: null }] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
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

    const filterButton = renderer.root.findByProps({
      accessibilityLabel: 'Abrir filtros',
    });
    expect(filterButton.findByProps({ children: 'Filtros' })).toBeTruthy();
    expect(filterButton.props.accessibilityValue).toEqual({
      text: 'Nenhum filtro ativo',
    });

    const openFilters = renderer.root.findByProps({
      accessibilityLabel: 'Abrir filtros',
    });

    await ReactTestRenderer.act(async () => {
      openFilters.props.onPress();
      await Promise.resolve();
    });

    const typeButton = renderer.root.findByProps({
      accessibilityLabel: 'Filtrar por tipo: fogo',
    });
    const generationButton = renderer.root.findByProps({
      accessibilityLabel: 'Filtrar por geração: 1ª Geração',
    });

    await ReactTestRenderer.act(async () => {
      typeButton.props.onPress();
      await Promise.resolve();
    });
    await ReactTestRenderer.act(async () => {
      generationButton.props.onPress();
      await Promise.resolve();
    });
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Aplicar filtros' })
        .props.onPress();
      await Promise.resolve();
    });

    expect(
      renderer.root.findByProps({ children: 'Filtros (2)' }),
    ).toBeTruthy();
    expect(mockUsePokemonList).toHaveBeenLastCalledWith({
      enabled: true,
      generation: '1',
      type: 'fire',
    });
  });

  it('shows the number of active filters on the filter button', async () => {
    mockUsePokemonList.mockReturnValue({
      data: { pages: [{ items: [], nextOffset: null }] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
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

    expect(renderer.root.findByProps({ children: 'Filtros' })).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Abrir filtros' })
        .props.onPress();
      await Promise.resolve();
    });
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Filtrar por tipo: fogo' })
        .props.onPress();
      await Promise.resolve();
    });
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Aplicar filtros' })
        .props.onPress();
      await Promise.resolve();
    });

    expect(renderer.root.findByProps({ children: 'Filtros (1)' })).toBeTruthy();
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Abrir filtros' }).props
        .accessibilityValue,
    ).toEqual({ text: '1 filtro ativo' });

    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Abrir filtros' })
        .props.onPress();
      await Promise.resolve();
    });
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Filtrar por geração: 1ª Geração' })
        .props.onPress();
      await Promise.resolve();
    });
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Aplicar filtros' })
        .props.onPress();
      await Promise.resolve();
    });

    expect(renderer.root.findByProps({ children: 'Filtros (2)' })).toBeTruthy();
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Abrir filtros' }).props
        .accessibilityValue,
    ).toEqual({ text: '2 filtros ativos' });
  });

  it('keeps temporary filter changes when cancelled', async () => {
    mockUsePokemonList.mockReturnValue({
      data: { pages: [{ items: [], nextOffset: null }] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
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

    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Abrir filtros' })
        .props.onPress();
      await Promise.resolve();
    });
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Filtrar por tipo: fogo' })
        .props.onPress();
      await Promise.resolve();
    });
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Cancelar filtros' })
        .props.onPress();
      await Promise.resolve();
    });

    expect(mockUsePokemonList).toHaveBeenLastCalledWith({ enabled: true });
  });

  it('clears temporary filter changes before applying', async () => {
    mockUsePokemonList.mockReturnValue({
      data: { pages: [{ items: [], nextOffset: null }] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
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

    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Abrir filtros' })
        .props.onPress();
      await Promise.resolve();
    });
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Filtrar por tipo: fogo' })
        .props.onPress();
      await Promise.resolve();
    });
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Filtrar por geração: 1ª Geração' })
        .props.onPress();
      await Promise.resolve();
    });
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Limpar filtros' })
        .props.onPress();
      await Promise.resolve();
    });
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Aplicar filtros' })
        .props.onPress();
      await Promise.resolve();
    });

    expect(renderer.root.findByProps({ children: 'Filtros' })).toBeTruthy();
    expect(mockUsePokemonList).toHaveBeenLastCalledWith({ enabled: true });
  });

  it('searches as the user types a name and shows matching Pokémon', async () => {
    const navigate = jest.fn();
    mockUsePokemonList.mockReturnValue({
      data: { pages: [] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isError: false,
      isFetchingNextPage: false,
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn(),
    });
    mockUsePokemonSearch.mockReturnValue({
      data: [
        {
          id: 4,
          name: 'charmander',
          imageUrl: 'https://example.com/4.png',
        },
      ],
      error: null,
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    });

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <PokemonListScreen navigation={{ navigate }} />,
      );
      await Promise.resolve();
    });

    const searchInput = renderer.root.findByProps({
      accessibilityLabel: 'Buscar Pokémon',
    });

    await ReactTestRenderer.act(async () => {
      searchInput.props.onChangeText('Char');
      await Promise.resolve();
    });

    expect(mockUsePokemonSearch).toHaveBeenCalledWith('Char');
    expect(mockUsePokemonList).toHaveBeenCalledWith({ enabled: false });
    const result = renderer.root.findByProps({
      accessibilityLabel: 'Charmander, número 4',
    });
    expect(result).toBeTruthy();

    ReactTestRenderer.act(() => result.props.onPress());
    expect(navigate).toHaveBeenCalledWith('PokemonDetail', { pokemonId: 4 });
  });

  it('shows an empty search state without retry when nothing matches', async () => {
    mockUsePokemonList.mockReturnValue({
      data: { pages: [] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isError: false,
      isFetchingNextPage: false,
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn(),
    });
    mockUsePokemonSearch.mockReturnValue({
      data: [],
      error: null,
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    });

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<PokemonListScreen />);
      await Promise.resolve();
    });
    const searchInput = renderer.root.findByProps({
      accessibilityLabel: 'Buscar Pokémon',
    });

    await ReactTestRenderer.act(async () => {
      searchInput.props.onChangeText('xyz');
      await Promise.resolve();
    });

    expect(
      renderer.root.findByProps({
        children: 'Nenhum resultado encontrado.',
      }),
    ).toBeTruthy();
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Tentar novamente' }),
    ).toHaveLength(0);
  });

  it('renders a search error with retry', async () => {
    const refetch = jest.fn();
    mockUsePokemonList.mockReturnValue({
      data: { pages: [] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isError: false,
      isFetchingNextPage: false,
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn(),
    });
    mockUsePokemonSearch.mockReturnValue({
      data: undefined,
      error: new Error('Falha de conexão.'),
      isError: true,
      isLoading: false,
      refetch,
    });

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<PokemonListScreen />);
      await Promise.resolve();
    });
    const searchInput = renderer.root.findByProps({
      accessibilityLabel: 'Buscar Pokémon',
    });

    await ReactTestRenderer.act(async () => {
      searchInput.props.onChangeText('fogo');
      await Promise.resolve();
    });

    const retryButton = renderer.root.findByProps({
      accessibilityLabel: 'Tentar novamente',
    });
    expect(
      renderer.root.findByProps({ children: 'Falha de conexão.' }),
    ).toBeTruthy();
    await ReactTestRenderer.act(async () => retryButton.props.onPress());
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
