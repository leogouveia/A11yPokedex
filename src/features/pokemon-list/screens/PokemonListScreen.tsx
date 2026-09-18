import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PokemonListItem } from '../components/PokemonListItem';
import { usePokemonList } from '../hooks/usePokemonList';

export function PokemonListScreen() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = usePokemonList();
  const items = data?.pages.flatMap(page => page.items) ?? [];

  if (isLoading) {
    return <StatusView label="Carregando Pokémon." loading />;
  }

  if (isError) {
    return (
      <StatusView
        actionLabel="Tentar novamente"
        label={
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os Pokémon.'
        }
        onAction={() => refetch()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Pokédex
      </Text>
      <Text style={styles.subtitle}>
        Explore os Pokémon por número da Pokédex.
      </Text>
      <FlatList
        contentContainerStyle={
          items.length === 0 ? styles.emptyList : styles.list
        }
        data={items}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={
          items.length === 0 ? (
            <StatusView
              actionLabel="Tentar novamente"
              label="Nenhum Pokémon encontrado."
              onAction={() => refetch()}
            />
          ) : undefined
        }
        ListFooterComponent={
          isFetchingNextPage || isRefetching ? (
            <StatusView compact label="Carregando mais Pokémon." loading />
          ) : undefined
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => <PokemonListItem pokemon={item} />}
        accessibilityLabel="Lista de Pokémon"
        ItemSeparatorComponent={ListItemSeparator}
      />
    </View>
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
