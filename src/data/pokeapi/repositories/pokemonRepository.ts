import type { PokemonListItem } from '../../../domain/pokemon/models';
import { getPokeApi } from '../client';
import { mapPokemonList, type PokeApiListResponse } from '../mappers';

export const POKEMON_PAGE_SIZE = 20;

export type PokemonPage = {
  items: PokemonListItem[];
  nextOffset: number | null;
};

export async function getPokemonPage(offset: number): Promise<PokemonPage> {
  const response = await getPokeApi<PokeApiListResponse>(
    `/pokemon?offset=${offset}&limit=${POKEMON_PAGE_SIZE}`,
  );

  return {
    items: mapPokemonList(response),
    nextOffset: response.next === null ? null : offset + POKEMON_PAGE_SIZE,
  };
}
