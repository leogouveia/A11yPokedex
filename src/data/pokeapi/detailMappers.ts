import type {
  PokemonDetail,
  PokemonEvolutionItem,
  PokemonStat,
} from '../../domain/pokemon/detailModels';

type NamedApiResource = {
  name: string;
  url: string;
};

export type PokeApiPokemonResponse = {
  abilities: Array<{ ability: NamedApiResource }>;
  height: number;
  id: number;
  moves: Array<{
    move: NamedApiResource;
    version_group_details?: Array<{
      move_learn_method: NamedApiResource;
    }>;
  }>;
  name: string;
  sprites: {
    other?: {
      'official-artwork'?: {
        front_default: string | null;
      };
    };
  };
  stats: Array<{ base_stat: number; stat: NamedApiResource }>;
  types: Array<{ type: NamedApiResource }>;
  weight: number;
};

export type PokeApiSpeciesResponse = {
  evolution_chain: { url: string };
  flavor_text_entries: Array<{
    flavor_text: string;
    language: NamedApiResource;
  }>;
};

export type PokeApiEvolutionChainResponse = {
  chain: PokeApiEvolutionNode;
};

type PokeApiEvolutionNode = {
  evolves_to: PokeApiEvolutionNode[];
  species: NamedApiResource;
};

const STAT_LABELS: Record<string, string> = {
  attack: 'Ataque',
  defense: 'Defesa',
  hp: 'HP',
  'special-attack': 'Ataque especial',
  'special-defense': 'Defesa especial',
  speed: 'Velocidade',
};

const TYPE_LABELS: Record<string, string> = {
  bug: 'Inseto',
  dark: 'Noturno',
  dragon: 'Dragão',
  electric: 'Elétrico',
  fairy: 'Fada',
  fighting: 'Luta',
  fire: 'Fogo',
  flying: 'Voador',
  ghost: 'Fantasma',
  grass: 'Planta',
  ground: 'Terra',
  ice: 'Gelo',
  normal: 'Normal',
  poison: 'Veneno',
  psychic: 'Psíquico',
  rock: 'Pedra',
  steel: 'Metal',
  water: 'Água',
};

export function mapPokemonDetail(
  pokemon: PokeApiPokemonResponse,
  species: PokeApiSpeciesResponse,
  evolutions: PokemonEvolutionItem[],
): PokemonDetail {
  return {
    abilities: pokemon.abilities.map(entry => entry.ability.name),
    description: getPortugueseDescription(species),
    evolutions,
    height: pokemon.height,
    id: pokemon.id,
    imageUrl:
      pokemon.sprites.other?.['official-artwork']?.front_default ??
      getArtworkUrl(pokemon.id),
    moves: pokemon.moves
      .filter(entry =>
        entry.version_group_details?.some(
          detail => detail.move_learn_method.name === 'level-up',
        ),
      )
      .map(entry => entry.move.name),
    name: pokemon.name,
    stats: pokemon.stats.map(mapStat),
    types: pokemon.types.map(
      entry => TYPE_LABELS[entry.type.name] ?? entry.type.name,
    ),
    weight: pokemon.weight,
  };
}

export function mapEvolutionChain(
  response: PokeApiEvolutionChainResponse,
): PokemonEvolutionItem[] {
  const items: PokemonEvolutionItem[] = [];

  function visit(node: PokeApiEvolutionNode) {
    const id = getResourceId(node.species.url);

    if (id !== null) {
      items.push({
        id,
        imageUrl: getArtworkUrl(id),
        name: node.species.name,
      });
    }

    node.evolves_to.forEach(visit);
  }

  visit(response.chain);
  return items;
}

function mapStat(entry: {
  base_stat: number;
  stat: NamedApiResource;
}): PokemonStat {
  return {
    label: STAT_LABELS[entry.stat.name] ?? entry.stat.name,
    value: entry.base_stat,
  };
}

function getPortugueseDescription(species: PokeApiSpeciesResponse): string {
  const portugueseEntry = species.flavor_text_entries.find(
    entry => entry.language.name === 'pt-br' || entry.language.name === 'pt',
  );

  return (portugueseEntry?.flavor_text ?? 'Não disponível.')
    .replace(/[\n\f]+/g, ' ')
    .trim();
}

function getArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function getResourceId(url: string): number | null {
  const id = Number(url.match(/\/(?:pokemon|pokemon-species)\/(\d+)\/?$/)?.[1]);
  return Number.isInteger(id) && id > 0 ? id : null;
}
