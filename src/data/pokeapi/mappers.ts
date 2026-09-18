import type { PokemonListItem } from '../../domain/pokemon/models';

type PokeApiListEntry = {
  name: string;
  url: string;
};

export type PokeApiListResponse = {
  count: number;
  next: string | null;
  results: PokeApiListEntry[];
};

export function mapPokemonListItem(entry: PokeApiListEntry): PokemonListItem {
  const id = Number(entry.url.match(/\/pokemon\/(\d+)\/?$/)?.[1]);

  if (!Number.isInteger(id) || id < 1) {
    throw new Error(`URL inválida para o Pokémon ${entry.name}.`);
  }

  return {
    id,
    name: entry.name,
    imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
  };
}

export function mapPokemonList(
  response: PokeApiListResponse,
): PokemonListItem[] {
  return response.results
    .map(mapPokemonListItem)
    .sort((first, second) => first.id - second.id);
}
