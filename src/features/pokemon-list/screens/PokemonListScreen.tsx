import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { PokemonListItem as PokemonListItemModel } from '../../../domain/pokemon/models';
import { PokemonSearchInput } from '../../pokemon-search/components/PokemonSearchInput';
import { usePokemonSearch } from '../../pokemon-search/hooks/usePokemonSearch';
import { PokemonListItem } from '../components/PokemonListItem';
import { usePokemonList } from '../hooks/usePokemonList';

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

export function PokemonListScreen() {
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

  if (listQuery.isError) {
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
        isLoadingMore={listQuery.isFetchingNextPage || listQuery.isRefetching}
        items={items}
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
  onChangeSearch: (value: string) => void;
  onRetry: () => void;
  searchTerm: string;
};

function SearchResults({
  error,
  isError,
  isLoading,
  items,
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
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Filtrar por tipo</Text>
      <View style={styles.filterRow}>
        {TYPE_FILTERS.map(type => {
          const isSelected = selectedType === type.value;

          return (
            <Pressable
              accessibilityHint={
                isSelected
                  ? 'Remove o filtro de tipo.'
                  : 'Aplica o filtro de tipo.'
              }
              accessibilityLabel={`Filtrar por tipo: ${type.label.toLowerCase()}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              key={type.value}
              onPress={() => onSelectType(isSelected ? null : type.value)}
              style={[
                styles.filterChip,
                isSelected && styles.filterChipSelected,
              ]}
            >
              <Text style={styles.filterChipText}>{type.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.filterTitle}>Filtrar por geração</Text>
      <View style={styles.filterRow}>
        {GENERATION_FILTERS.map(generation => {
          const isSelected = selectedGeneration === generation.value;

          return (
            <Pressable
              accessibilityHint={
                isSelected
                  ? 'Remove o filtro de geração.'
                  : 'Aplica o filtro de geração.'
              }
              accessibilityLabel={`Filtrar por geração: ${generation.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              key={generation.value}
              onPress={() =>
                onSelectGeneration(isSelected ? null : generation.value)
              }
              style={[
                styles.filterChip,
                isSelected && styles.filterChipSelected,
              ]}
            >
              <Text style={styles.filterChipText}>{generation.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type PokemonResultsListProps = {
  emptyActionLabel?: string;
  emptyLabel: string;
  isLoadingMore?: boolean;
  items: PokemonListItemModel[];
  onEmptyAction?: () => void;
  onEndReached?: () => void;
};

function PokemonResultsList({
  emptyActionLabel,
  emptyLabel,
  isLoadingMore = false,
  items,
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
      renderItem={({ item }) => <PokemonListItem pokemon={item} />}
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
