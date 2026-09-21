import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { RootStackParamList } from '../../../app/AppNavigator';
import type { PokemonListItem as PokemonListItemModel } from '../../../domain/pokemon/models';
import { PokemonSearchInput } from '../../pokemon-search/components/PokemonSearchInput';
import { usePokemonSearch } from '../../pokemon-search/hooks/usePokemonSearch';
import { PokemonListItem } from '../components/PokemonListItem';
import { usePokemonList } from '../hooks/usePokemonList';

type PokemonListNavigation = {
  navigate: (
    screen: 'PokemonDetail',
    params: RootStackParamList['PokemonDetail'],
  ) => void;
};

const TYPE_FILTERS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Fogo', value: 'fire' },
  { label: 'Água', value: 'water' },
  { label: 'Elétrico', value: 'electric' },
  { label: 'Planta', value: 'grass' },
  { label: 'Gelo', value: 'ice' },
  { label: 'Luta', value: 'fighting' },
  { label: 'Veneno', value: 'poison' },
  { label: 'Terra', value: 'ground' },
  { label: 'Voador', value: 'flying' },
  { label: 'Psíquico', value: 'psychic' },
  { label: 'Inseto', value: 'bug' },
  { label: 'Pedra', value: 'rock' },
  { label: 'Fantasma', value: 'ghost' },
  { label: 'Dragão', value: 'dragon' },
  { label: 'Noturno', value: 'dark' },
  { label: 'Metal', value: 'steel' },
  { label: 'Fada', value: 'fairy' },
];

const GENERATION_FILTERS = [
  { label: '1ª Geração', value: '1' },
  { label: '2ª Geração', value: '2' },
  { label: '3ª Geração', value: '3' },
  { label: '4ª Geração', value: '4' },
  { label: '5ª Geração', value: '5' },
  { label: '6ª Geração', value: '6' },
  { label: '7ª Geração', value: '7' },
  { label: '8ª Geração', value: '8' },
  { label: '9ª Geração', value: '9' },
];

const SCROLL_TO_TOP_THRESHOLD = 400;

export function PokemonListScreen({
  navigation,
}: {
  navigation?: PokemonListNavigation;
} = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedGeneration, setSelectedGeneration] = useState<string | null>(
    null,
  );
  const isSearching = searchTerm.trim().length > 0;
  const listQuery = usePokemonList({
    enabled: !isSearching,
    generation: selectedGeneration ?? undefined,
    type: selectedType ?? undefined,
  });
  const searchQuery = usePokemonSearch(searchTerm);

  if (isSearching) {
    return (
      <SearchResults
        error={searchQuery.error}
        isError={searchQuery.isError}
        isLoading={searchQuery.isLoading}
        items={searchQuery.data ?? []}
        navigation={navigation}
        onChangeSearch={setSearchTerm}
        onRetry={() => searchQuery.refetch()}
        searchTerm={searchTerm}
      />
    );
  }

  const items = listQuery.data?.pages.flatMap(page => page.items) ?? [];

  if (listQuery.isLoading) {
    return (
      <ScreenShell
        onChangeSearch={setSearchTerm}
        onSelectGeneration={setSelectedGeneration}
        onSelectType={setSelectedType}
        searchTerm={searchTerm}
        selectedGeneration={selectedGeneration}
        selectedType={selectedType}
      >
        <StatusView label="Carregando Pokémon." loading />
      </ScreenShell>
    );
  }

  if (listQuery.isError && !listQuery.data) {
    return (
      <ScreenShell
        onChangeSearch={setSearchTerm}
        onSelectGeneration={setSelectedGeneration}
        onSelectType={setSelectedType}
        searchTerm={searchTerm}
        selectedGeneration={selectedGeneration}
        selectedType={selectedType}
      >
        <StatusView
          actionLabel="Tentar novamente"
          label={
            listQuery.error instanceof Error
              ? listQuery.error.message
              : 'Não foi possível carregar os Pokémon.'
          }
          onAction={() => listQuery.refetch()}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      onChangeSearch={setSearchTerm}
      onSelectGeneration={setSelectedGeneration}
      onSelectType={setSelectedType}
      searchTerm={searchTerm}
      selectedGeneration={selectedGeneration}
      selectedType={selectedType}
    >
      <PokemonResultsList
        emptyActionLabel="Tentar novamente"
        emptyLabel="Nenhum Pokémon encontrado."
        isFetchNextPageError={listQuery.isFetchNextPageError}
        isLoadingMore={listQuery.isFetchingNextPage || listQuery.isRefetching}
        items={items}
        navigation={navigation}
        onEmptyAction={() => listQuery.refetch()}
        onEndReached={() => {
          if (listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
            listQuery.fetchNextPage();
          }
        }}
        onFetchNextPageErrorAction={() => listQuery.fetchNextPage()}
      />
    </ScreenShell>
  );
}

type SearchResultsProps = {
  error: unknown;
  isError: boolean;
  isLoading: boolean;
  items: PokemonListItemModel[];
  navigation?: PokemonListNavigation;
  onChangeSearch: (value: string) => void;
  onRetry: () => void;
  searchTerm: string;
};

function SearchResults({
  error,
  isError,
  isLoading,
  items,
  navigation,
  onChangeSearch,
  onRetry,
  searchTerm,
}: SearchResultsProps) {
  return (
    <ScreenShell onChangeSearch={onChangeSearch} searchTerm={searchTerm}>
      {isLoading ? (
        <StatusView label="Buscando Pokémon." loading />
      ) : isError ? (
        <StatusView
          actionLabel="Tentar novamente"
          label={
            error instanceof Error
              ? error.message
              : 'Não foi possível buscar os Pokémon.'
          }
          onAction={onRetry}
        />
      ) : (
        <PokemonResultsList
          emptyLabel="Nenhum resultado encontrado."
          items={items}
          navigation={navigation}
        />
      )}
    </ScreenShell>
  );
}

type ScreenShellProps = {
  children: React.ReactNode;
  onChangeSearch: (value: string) => void;
  onSelectGeneration?: (value: string | null) => void;
  onSelectType?: (value: string | null) => void;
  searchTerm: string;
  selectedGeneration?: string | null;
  selectedType?: string | null;
};

function ScreenShell({
  children,
  onChangeSearch,
  onSelectGeneration,
  onSelectType,
  searchTerm,
  selectedGeneration,
  selectedType,
}: ScreenShellProps) {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Pokédex
      </Text>
      <Text style={styles.subtitle}>
        Explore os Pokémon por número da Pokédex.
      </Text>
      <PokemonSearchInput onChangeText={onChangeSearch} value={searchTerm} />
      {onSelectType && onSelectGeneration ? (
        <PokemonFilterBar
          onSelectGeneration={onSelectGeneration}
          onSelectType={onSelectType}
          selectedGeneration={selectedGeneration ?? null}
          selectedType={selectedType ?? null}
        />
      ) : null}
      {children}
    </View>
  );
}

function PokemonFilterBar({
  onSelectGeneration,
  onSelectType,
  selectedGeneration,
  selectedType,
}: {
  onSelectGeneration: (value: string | null) => void;
  onSelectType: (value: string | null) => void;
  selectedGeneration: string | null;
  selectedType: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftType, setDraftType] = useState(selectedType);
  const [draftGeneration, setDraftGeneration] = useState(selectedGeneration);

  function openPanel() {
    setDraftType(selectedType);
    setDraftGeneration(selectedGeneration);
    setIsOpen(true);
  }

  function cancelChanges() {
    setDraftType(selectedType);
    setDraftGeneration(selectedGeneration);
    setIsOpen(false);
  }

  function applyChanges() {
    onSelectType(draftType);
    onSelectGeneration(draftGeneration);
    setIsOpen(false);
  }

  const activeFilters = [
    TYPE_FILTERS.find(filter => filter.value === selectedType)?.label,
    GENERATION_FILTERS.find(filter => filter.value === selectedGeneration)?.label,
  ].filter(Boolean);
  const activeFilterCount =
    Number(Boolean(selectedType)) + Number(Boolean(selectedGeneration));

  return (
    <View style={styles.filterSection}>
      <Pressable
        accessibilityHint="Abre as opções de tipo e geração."
        accessibilityLabel="Abrir filtros"
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityValue={{
          text:
            activeFilterCount === 0
              ? 'Nenhum filtro ativo'
              : `${activeFilterCount} filtro${activeFilterCount === 1 ? '' : 's'} ativo${activeFilterCount === 1 ? '' : 's'}`,
        }}
        onPress={openPanel}
        style={styles.filterTrigger}
      >
        <Text allowFontScaling style={styles.filterTriggerText}>
          {activeFilterCount > 0 ? `Filtros (${activeFilterCount})` : 'Filtros'}
        </Text>
        <Text allowFontScaling style={styles.filterSummary}>
          {activeFilters.length > 0
            ? activeFilters.join(' • ')
            : 'Nenhum filtro aplicado'}
        </Text>
      </Pressable>

      <Modal
        accessibilityViewIsModal
        animationType="slide"
        onRequestClose={cancelChanges}
        transparent
        visible={isOpen}
      >
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.filterPanel}>
            <Text accessibilityRole="header" style={styles.panelTitle}>
              Filtros
            </Text>
            <ScrollView contentContainerStyle={styles.panelContent}>
              <Text style={styles.filterTitle}>Filtrar por tipo</Text>
              <View style={styles.filterRow}>
                {TYPE_FILTERS.map(type => {
                  const isSelected = draftType === type.value;

                  return (
                    <Pressable
                      accessibilityHint={
                        isSelected
                          ? 'Remove o filtro de tipo.'
                          : 'Seleciona o filtro de tipo.'
                      }
                      accessibilityLabel={`Filtrar por tipo: ${type.label.toLowerCase()}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      key={type.value}
                      onPress={() =>
                        setDraftType(isSelected ? null : type.value)
                      }
                      style={[
                        styles.filterChip,
                        isSelected && styles.filterChipSelected,
                      ]}
                    >
                      <Text allowFontScaling style={styles.filterChipText}>
                        {type.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.filterTitle}>Filtrar por geração</Text>
              <View style={styles.filterRow}>
                {GENERATION_FILTERS.map(generation => {
                  const isSelected = draftGeneration === generation.value;

                  return (
                    <Pressable
                      accessibilityHint={
                        isSelected
                          ? 'Remove o filtro de geração.'
                          : 'Seleciona o filtro de geração.'
                      }
                      accessibilityLabel={`Filtrar por geração: ${generation.label}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      key={generation.value}
                      onPress={() =>
                        setDraftGeneration(
                          isSelected ? null : generation.value,
                        )
                      }
                      style={[
                        styles.filterChip,
                        isSelected && styles.filterChipSelected,
                      ]}
                    >
                      <Text allowFontScaling style={styles.filterChipText}>
                        {generation.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            <View style={styles.panelActions}>
              <Pressable
                accessibilityLabel="Limpar filtros"
                accessibilityRole="button"
                onPress={() => {
                  setDraftType(null);
                  setDraftGeneration(null);
                }}
                style={styles.secondaryAction}
              >
                <Text style={styles.secondaryActionText}>Limpar</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Cancelar filtros"
                accessibilityRole="button"
                onPress={cancelChanges}
                style={styles.secondaryAction}
              >
                <Text style={styles.secondaryActionText}>Cancelar</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Aplicar filtros"
                accessibilityRole="button"
                onPress={applyChanges}
                style={styles.primaryAction}
              >
                <Text style={styles.primaryActionText}>Aplicar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

type PokemonResultsListProps = {
  emptyActionLabel?: string;
  emptyLabel: string;
  isFetchNextPageError?: boolean;
  isLoadingMore?: boolean;
  items: PokemonListItemModel[];
  navigation?: PokemonListNavigation;
  onEmptyAction?: () => void;
  onEndReached?: () => void;
  onFetchNextPageErrorAction?: () => void;
};

function PokemonResultsList({
  emptyActionLabel,
  emptyLabel,
  isFetchNextPageError = false,
  isLoadingMore = false,
  items,
  navigation,
  onEmptyAction,
  onEndReached,
  onFetchNextPageErrorAction,
}: PokemonResultsListProps) {
  const listRef = useRef<FlatList<PokemonListItemModel> | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  return (
    <>
      <FlatList
        ref={listRef}
        accessibilityLabel="Lista de Pokémon"
        contentContainerStyle={
          items.length === 0 ? styles.emptyList : styles.list
        }
        data={items}
        ItemSeparatorComponent={ListItemSeparator}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={
          items.length === 0 ? (
            <StatusView
              actionLabel={emptyActionLabel}
              label={emptyLabel}
              onAction={onEmptyAction}
            />
          ) : undefined
        }
        ListFooterComponent={
          isLoadingMore ? (
            <StatusView compact label="Carregando mais Pokémon." loading />
          ) : isFetchNextPageError ? (
            <StatusView
              actionLabel="Tentar novamente"
              compact
              label="Não foi possível carregar mais Pokémon. Tente novamente."
              onAction={onFetchNextPageErrorAction}
            />
          ) : undefined
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        onScroll={({ nativeEvent }) =>
          setShowScrollToTop(
            nativeEvent.contentOffset.y >= SCROLL_TO_TOP_THRESHOLD,
          )
        }
        renderItem={({ item }) => (
          <PokemonListItem
            onPress={
              navigation
                ? () =>
                    navigation.navigate('PokemonDetail', { pokemonId: item.id })
                : undefined
            }
            pokemon={item}
          />
        )}
        scrollEventThrottle={16}
      />
      {showScrollToTop ? (
        <Pressable
          accessibilityHint="Volta a lista para o início."
          accessibilityLabel="Voltar ao topo"
          accessibilityRole="button"
          onPress={() =>
            listRef.current?.scrollToOffset({ offset: 0, animated: true })
          }
          style={styles.scrollToTopButton}
        >
          <Text allowFontScaling style={styles.scrollToTopText}>
            Voltar ao topo
          </Text>
        </Pressable>
      ) : null}
    </>
  );
}

function ListItemSeparator() {
  return <View style={styles.separator} />;
}

type StatusViewProps = {
  actionLabel?: string;
  compact?: boolean;
  label: string;
  loading?: boolean;
  onAction?: () => void;
};

function StatusView({
  actionLabel,
  compact,
  label,
  loading,
  onAction,
}: StatusViewProps) {
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole={loading ? 'progressbar' : 'text'}
      style={[styles.status, compact && styles.compactStatus]}
    >
      {loading ? (
        <ActivityIndicator accessibilityLabel={label} color="#0B7285" />
      ) : null}
      <Text allowFontScaling style={styles.statusText}>
        {label}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityHint="Refaz o carregamento dos Pokémon."
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={styles.retryButton}
        >
          <Text allowFontScaling style={styles.retryText}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  compactStatus: {
    minHeight: 64,
  },
  container: {
    backgroundColor: '#F4F7F9',
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#486581',
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    marginTop: 8,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipSelected: {
    backgroundColor: '#D6F0F5',
    borderColor: '#0B7285',
  },
  filterChipText: {
    color: '#102A43',
    fontSize: 14,
    fontWeight: '600',
  },
  filterSummary: {
    color: '#486581',
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
  },
  filterTrigger: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#486581',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterTriggerText: {
    color: '#102A43',
    fontSize: 16,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterTitle: {
    color: '#486581',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  list: {
    paddingBottom: 24,
    paddingTop: 16,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(16, 42, 67, 0.45)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  panelActions: {
    borderTopColor: '#D9E2EC',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 16,
  },
  panelContent: {
    paddingBottom: 16,
  },
  panelTitle: {
    color: '#102A43',
    fontSize: 22,
    fontWeight: '700',
    padding: 16,
  },
  filterPanel: {
    backgroundColor: '#F4F7F9',
    maxHeight: '85%',
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#0B7285',
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: '#0B7285',
    borderRadius: 6,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 48,
    paddingHorizontal: 20,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryAction: {
    alignItems: 'center',
    borderColor: '#486581',
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  secondaryActionText: {
    color: '#102A43',
    fontSize: 16,
    fontWeight: '700',
  },
  separator: {
    height: 12,
  },
  scrollToTopButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#0B7285',
    borderRadius: 6,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 20,
  },
  scrollToTopText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  status: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 160,
    padding: 24,
  },
  statusText: {
    color: '#243B53',
    fontSize: 17,
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#486581',
    fontSize: 16,
    paddingBottom: 4,
    paddingTop: 4,
  },
  title: {
    color: '#102A43',
    fontSize: 30,
    fontWeight: '800',
    paddingTop: 16,
  },
});
