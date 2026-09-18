import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { RootStackParamList } from '../../../app/AppNavigator';
import { usePokemonDetail } from '../hooks/usePokemonDetail';

type Props = NativeStackScreenProps<RootStackParamList, 'PokemonDetail'>;

export function PokemonDetailScreen({ navigation, route }: Props) {
  const query = usePokemonDetail(route.params.pokemonId);

  if (query.isLoading) {
    return <DetailStatus label="Carregando detalhes do Pokémon." loading />;
  }

  if (query.isError || !query.data) {
    return (
      <DetailStatus
        actionLabel="Tentar novamente"
        label={
          query.error instanceof Error
            ? query.error.message
            : 'Não foi possível carregar os detalhes do Pokémon.'
        }
        onAction={() => query.refetch()}
      />
    );
  }

  const detail = query.data;

  return (
    <ScrollView
      accessibilityLabel={`Detalhes de ${formatName(detail.name)}`}
      contentContainerStyle={styles.content}
    >
      <Text accessibilityRole="header" style={styles.title}>
        {formatName(detail.name)}
      </Text>
      <Text style={styles.number}>{`#${String(detail.id).padStart(
        3,
        '0',
      )}`}</Text>
      <Image
        accessibilityElementsHidden
        accessible={false}
        importantForAccessibility="no"
        source={{ uri: detail.imageUrl }}
        style={styles.image}
      />

      <DetailSection title="Tipos">
        <Text style={styles.bodyText}>{formatList(detail.types)}</Text>
      </DetailSection>
      <DetailSection title="Medidas">
        <Text style={styles.bodyText}>{`Altura: ${detail.height / 10} m`}</Text>
        <Text style={styles.bodyText}>{`Peso: ${detail.weight / 10} kg`}</Text>
      </DetailSection>
      <DetailSection title="Estatísticas base">
        {detail.stats.map(stat => (
          <Text key={stat.label} style={styles.bodyText}>
            {`${stat.label}: ${stat.value}`}
          </Text>
        ))}
      </DetailSection>
      <DetailSection title="Habilidades">
        <Text style={styles.bodyText}>{formatList(detail.abilities)}</Text>
      </DetailSection>
      <DetailSection title="Descrição">
        <Text style={styles.bodyText}>{detail.description}</Text>
      </DetailSection>
      <DetailSection title="Movimentos">
        <Text style={styles.bodyText}>{formatList(detail.moves)}</Text>
      </DetailSection>
      <DetailSection title="Cadeia evolutiva">
        <View style={styles.evolutionList}>
          {detail.evolutions.map(evolution => {
            const isCurrent = evolution.id === detail.id;

            return (
              <Pressable
                accessibilityHint={
                  isCurrent
                    ? 'Pokémon atual.'
                    : 'Abre os detalhes deste Pokémon.'
                }
                accessibilityLabel={`${formatName(evolution.name)}, número ${
                  evolution.id
                }`}
                accessibilityRole={isCurrent ? 'text' : 'button'}
                accessibilityState={{ disabled: isCurrent }}
                disabled={isCurrent}
                key={evolution.id}
                onPress={() =>
                  navigation.push('PokemonDetail', { pokemonId: evolution.id })
                }
                style={[
                  styles.evolutionItem,
                  isCurrent && styles.currentEvolution,
                ]}
              >
                <Image
                  accessibilityElementsHidden
                  accessible={false}
                  source={{ uri: evolution.imageUrl }}
                  style={styles.evolutionImage}
                />
                <Text allowFontScaling style={styles.evolutionName}>
                  {formatName(evolution.name)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </DetailSection>
    </ScrollView>
  );
}

function DetailSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function DetailStatus({
  actionLabel,
  label,
  loading,
  onAction,
}: {
  actionLabel?: string;
  label: string;
  loading?: boolean;
  onAction?: () => void;
}) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.status}>
      {loading ? <ActivityIndicator accessibilityLabel={label} /> : null}
      <Text
        accessibilityRole={loading ? 'text' : 'alert'}
        style={styles.bodyText}
      >
        {label}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityHint="Tenta carregar os detalhes novamente."
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          onPress={onAction}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function formatList(values: string[]) {
  return values.length > 0
    ? values.map(formatName).join(', ')
    : 'Não disponível.';
}

function formatName(name: string) {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase());
}

const styles = StyleSheet.create({
  bodyText: {
    color: '#102A43',
    fontSize: 16,
    lineHeight: 24,
  },
  content: {
    backgroundColor: '#F4F7F9',
    padding: 16,
  },
  currentEvolution: {
    borderColor: '#0B7285',
  },
  evolutionImage: {
    height: 56,
    width: 56,
  },
  evolutionItem: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    minHeight: 64,
    padding: 8,
  },
  evolutionList: {
    marginTop: 4,
  },
  evolutionName: {
    color: '#102A43',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  image: {
    height: 180,
    marginBottom: 8,
    marginTop: 8,
    width: 180,
  },
  number: {
    color: '#486581',
    fontSize: 16,
  },
  retryButton: {
    alignItems: 'center',
    borderColor: '#0B7285',
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  retryText: {
    color: '#075985',
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    borderTopColor: '#D9E2EC',
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 12,
  },
  sectionTitle: {
    color: '#102A43',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  status: {
    alignItems: 'center',
    backgroundColor: '#F4F7F9',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#102A43',
    fontSize: 28,
    fontWeight: '700',
  },
});
