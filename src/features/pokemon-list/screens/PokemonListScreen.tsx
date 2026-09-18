import React, { useState } from 'react';
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
  const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false);
  const [draftType, setDraftType] = useState<string | null>(null);
  const [draftGeneration, setDraftGeneration] = useState<string | null>(null);
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
        onOpenFilters={() => {
          setDraftType(selectedType);
          setDraftGeneration(selectedGeneration);
          setIsFilterPanelVisible(true);
        }}
        searchTerm={searchTerm}
        selectedGeneration={selectedGeneration}
        selectedType={selectedType}
        isFilterPanelVisible={isFilterPanelVisible}
        draftGeneration={draftGeneration}
        draftType={draftType}
        onDraftGenerationChange={setDraftGeneration}
        onDraftTypeChange={setDraftType}
        onCloseFilters={() => setIsFilterPanelVisible(false)}
        onClearFilters={() => {
          setDraftType(null);
          setDraftGeneration(null);
        }}
        onApplyFilters={() => {
          setSelectedType(draftType);
          setSelectedGeneration(draftGeneration);
          setIsFilterPanelVisible(false);
        }}
      >
        <StatusView label="Carregando Pokémon." loading />
      </ScreenShell>
    );
  }

  if (listQuery.isError) {
    return (
      <ScreenShell
        onChangeSearch={setSearchTerm}
        onOpenFilters={() => {
          setDraftType(selectedType);
          setDraftGeneration(selectedGeneration);
          setIsFilterPanelVisible(true);
        }}
        searchTerm={searchTerm}
        selectedGeneration={selectedGeneration}
        selectedType={selectedType}
        isFilterPanelVisible={isFilterPanelVisible}
        draftGeneration={draftGeneration}
        draftType={draftType}
        onDraftGenerationChange={setDraftGeneration}
        onDraftTypeChange={setDraftType}
        onCloseFilters={() => setIsFilterPanelVisible(false)}
        onClearFilters={() => {
          setDraftType(null);
          setDraftGeneration(null);
        }}
        onApplyFilters={() => {
          setSelectedType(draftType);
          setSelectedGeneration(draftGeneration);
          setIsFilterPanelVisible(false);
        }}
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
      onOpenFilters={() => {
        setDraftType(selectedType);
        setDraftGeneration(selectedGeneration);
        setIsFilterPanelVisible(true);
      }}
      searchTerm={searchTerm}
      selectedGeneration={selectedGeneration}
      selectedType={selectedType}
      isFilterPanelVisible={isFilterPanelVisible}
      draftGeneration={draftGeneration}
      draftType={draftType}
      onDraftGenerationChange={setDraftGeneration}
      onDraftTypeChange={setDraftType}
      onCloseFilters={() => setIsFilterPanelVisible(false)}
      onClearFilters={() => {
        setDraftType(null);
        setDraftGeneration(null);
      }}
      onApplyFilters={() => {
        setSelectedType(draftType);
        setSelectedGeneration(draftGeneration);
        setIsFilterPanelVisible(false);
      }}
    >
      <PokemonResultsList
        emptyActionLabel="Tentar novamente"
        emptyLabel="Nenhum Pokémon encontrado."
        isLoadingMore={listQuery.isFetchingNextPage || listQuery.isRefetching}
        items={items}
        navigation={navigation}
        onEmptyAction={() => listQuery.refetch()}
        onEndReached={() => {
          if (listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
            listQuery.fetchNextPage();
          }
        }}
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
  onOpenFilters?: () => void;
  isFilterPanelVisible?: boolean;
  draftGeneration?: string | null;
  draftType?: string | null;
  onDraftGenerationChange?: (value: string | null) => void;
  onDraftTypeChange?: (value: string | null) => void;
  onCloseFilters?: () => void;
  onClearFilters?: () => void;
  onApplyFilters?: () => void;
  searchTerm: string;
  selectedGeneration?: string | null;
  selectedType?: string | null;
};

function ScreenShell({
  children,
  onChangeSearch,
  onOpenFilters,
  isFilterPanelVisible,
  draftGeneration,
  draftType,
  onDraftGenerationChange,
  onDraftTypeChange,
  onCloseFilters,
  onClearFilters,
  onApplyFilters,
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
      {onOpenFilters ? (
        <PokemonFilterBar
          onOpenFilters={onOpenFilters}
          selectedGeneration={selectedGeneration ?? null}
          selectedType={selectedType ?? null}
        />
      ) : null}
      {children}
      {onOpenFilters && onCloseFilters && onApplyFilters ? (
        <PokemonFilterPanel
          draftGeneration={draftGeneration ?? null}
          draftType={draftType ?? null}
          onApply={onApplyFilters}
          onClear={onClearFilters ?? (() => undefined)}
          onClose={onCloseFilters}
          onSelectGeneration={onDraftGenerationChange ?? (() => undefined)}
          onSelectType={onDraftTypeChange ?? (() => undefined)}
          visible={isFilterPanelVisible ?? false}
        />
      ) : null}
    </View>
  );
}

function PokemonFilterBar({
  onOpenFilters,
  selectedGeneration,
  selectedType,
}: {
  onOpenFilters: () => void;
  selectedGeneration: string | null;
  selectedType: string | null;
}) {
  const selectedTypeLabel = TYPE_FILTERS.find(
    filter => filter.value === selectedType,
  )?.label;
  const selectedGenerationLabel = GENERATION_FILTERS.find(
    filter => filter.value === selectedGeneration,
  )?.label;
  const activeFilters = [selectedTypeLabel, selectedGenerationLabel].filter(
    Boolean,
  );

  return (
    <View style={styles.filterToolbar}>
      <Pressable
        accessibilityLabel="Abrir filtros"
        accessibilityHint="Abre os filtros de tipo e geração."
        accessibilityRole="button"
        onPress={onOpenFilters}
        style={styles.filterButton}
      >
        <Text style={styles.filterButtonText}>Filtros</Text>
      </Pressable>
      <Text accessibilityLiveRegion="polite" style={styles.filterSummary}>
        {activeFilters.length
          ? activeFilters.join(' · ')
          : 'Nenhum filtro ativo'}
      </Text>
    </View>
  );
}

function PokemonFilterPanel({
  draftGeneration,
  draftType,
  onApply,
  onClear,
  onClose,
  onSelectGeneration,
  onSelectType,
  visible,
}: {
  draftGeneration: string | null;
  draftType: string | null;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
  onSelectGeneration: (value: string | null) => void;
  onSelectType: (value: string | null) => void;
  visible: boolean;
}) {
  return (
    <Modal
      accessibilityViewIsModal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.filterPanel}>
          <View style={styles.panelHeader}>
            <Text accessibilityRole="header" style={styles.panelTitle}>
              Filtros
            </Text>
            <Pressable
              accessibilityLabel="Fechar filtros"
              accessibilityRole="button"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.panelContent}>
            <Text style={styles.filterTitle}>Filtrar por tipo</Text>
            <View style={styles.filterRow}>
              {TYPE_FILTERS.map(type => (
                <FilterOption
                  isSelected={draftType === type.value}
                  key={type.value}
                  label={type.label}
                  onPress={() =>
                    onSelectType(draftType === type.value ? null : type.value)
                  }
                  type="tipo"
                />
              ))}
            </View>
            <Text style={styles.filterTitle}>Filtrar por geração</Text>
            <View style={styles.filterRow}>
              {GENERATION_FILTERS.map(generation => (
                <FilterOption
                  isSelected={draftGeneration === generation.value}
                  key={generation.value}
                  label={generation.label}
                  onPress={() =>
                    onSelectGeneration(
                      draftGeneration === generation.value
                        ? null
                        : generation.value,
                    )
                  }
                  type="geração"
                />
              ))}
            </View>
          </ScrollView>
          <View style={styles.panelActions}>
            <Pressable
              accessibilityLabel="Limpar filtros"
              accessibilityRole="button"
              onPress={onClear}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Limpar filtros</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Aplicar filtros"
              accessibilityRole="button"
              onPress={onApply}
              style={styles.applyButton}
            >
              <Text style={styles.applyButtonText}>Aplicar filtros</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FilterOption({
  isSelected,
  label,
  onPress,
  type,
}: {
  isSelected: boolean;
  label: string;
  onPress: () => void;
  type: 'tipo' | 'geração';
}) {
  return (
    <Pressable
      accessibilityHint={
        isSelected
          ? `Remove o filtro de ${type}.`
          : `Aplica o filtro de ${type}.`
      }
      accessibilityLabel={`Filtrar por ${type}: ${label}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={[styles.filterChip, isSelected && styles.filterChipSelected]}
    >
      <Text allowFontScaling style={styles.filterChipText}>
        {label}
      </Text>
    </Pressable>
  );
}

type PokemonResultsListProps = {
  emptyActionLabel?: string;
  emptyLabel: string;
  isLoadingMore?: boolean;
  items: PokemonListItemModel[];
  navigation?: PokemonListNavigation;
  onEmptyAction?: () => void;
  onEndReached?: () => void;
};

function PokemonResultsList({
  emptyActionLabel,
  emptyLabel,
  isLoadingMore = false,
  items,
  navigation,
  onEmptyAction,
  onEndReached,
}: PokemonResultsListProps) {
  return (
    <FlatList
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
        ) : undefined
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
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
    />
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
  filterButton: {
    alignItems: 'center',
    backgroundColor: '#0B7285',
    borderRadius: 6,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 20,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  filterSummary: {
    color: '#486581',
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
  },
  filterTitle: {
    color: '#486581',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  filterToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(16, 42, 67, 0.45)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterPanel: {
    backgroundColor: '#F4F7F9',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    padding: 16,
  },
  panelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  panelTitle: {
    color: '#102A43',
    fontSize: 22,
    fontWeight: '800',
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 8,
  },
  closeButtonText: {
    color: '#0B7285',
    fontSize: 16,
    fontWeight: '700',
  },
  panelContent: {
    paddingBottom: 8,
  },
  panelActions: {
    borderTopColor: '#D9E2EC',
    borderTopWidth: 1,
    gap: 8,
    paddingTop: 12,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#486581',
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: '#102A43',
    fontSize: 16,
    fontWeight: '700',
  },
  applyButton: {
    alignItems: 'center',
    backgroundColor: '#0B7285',
    borderRadius: 6,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 20,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  list: {
    paddingBottom: 24,
    paddingTop: 16,
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
  separator: {
    height: 12,
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
