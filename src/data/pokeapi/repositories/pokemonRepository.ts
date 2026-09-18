import type { PokemonListItem } from '../../../domain/pokemon/models';
import {
  matchesPokemonName,
  parsePokedexNumber,
  resolvePokemonType,
} from '../../../domain/pokemon/search';
import { getPokeApi } from '../client';
import {
  mapPokemonList,
  mapPokemonTypeList,
  type PokeApiGenerationResponse,
  type PokeApiListResponse,
  type PokeApiTypeResponse,
} from '../mappers';

export const POKEMON_PAGE_SIZE = 20;
export const POKEMON_INDEX_LIMIT = 20000;

export type PokemonPage = {
  items: PokemonListItem[];
  nextOffset: number | null;
};

let pokemonNameIndexPromise: Promise<PokemonListItem[]> | null = null;
const filteredPokemonIdsCache = new Map<string, Promise<Set<number>>>();

export async function getPokemonPage(
  offset: number,
  type?: string,
  generation?: string,
): Promise<PokemonPage> {
  const filteredIds = await getFilteredPokemonIds(type, generation);

  if (filteredIds !== null) {
    const orderedIds = Array.from(filteredIds).sort(
      (first, second) => first - second,
    );
    const sliceStart = offset;
    const sliceEnd = sliceStart + POKEMON_PAGE_SIZE;
    const pageIds = orderedIds.slice(sliceStart, sliceEnd);
    const index = await loadPokemonNameIndex();
    const items = index
      .filter(item => pageIds.includes(item.id))
      .sort((first, second) => first.id - second.id);

    return {
      items,
      nextOffset: sliceEnd < orderedIds.length ? sliceEnd : null,
    };
  }

  const response = await getPokeApi<PokeApiListResponse>(
    `/pokemon?offset=${offset}&limit=${POKEMON_PAGE_SIZE}`,
  );

  return {
    items: mapPokemonList(response),
    nextOffset: response.next === null ? null : offset + POKEMON_PAGE_SIZE,
  };
}

export async function searchPokemon(
  query: string,
  signal?: AbortSignal,
): Promise<PokemonListItem[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const pokedexNumber = parsePokedexNumber(trimmedQuery);

  if (pokedexNumber !== null) {
    const index = await loadPokemonNameIndex(signal);
    return index.filter(pokemon => pokemon.id === pokedexNumber);
  }

  const type = resolvePokemonType(trimmedQuery);

  if (type !== null) {
    const response = signal
      ? await getPokeApi<PokeApiTypeResponse>(`/type/${type}`, signal)
      : await getPokeApi<PokeApiTypeResponse>(`/type/${type}`);
    return mapPokemonTypeList(response);
  }

  const index = await loadPokemonNameIndex(signal);
  return index.filter(pokemon =>
    matchesPokemonName(pokemon.name, trimmedQuery),
  );
}

async function getFilteredPokemonIds(
  type?: string,
  generation?: string,
): Promise<Set<number> | null> {
  if (!type && !generation) {
    return null;
  }

  const normalizedType = type ? resolvePokemonType(type) : null;
  const normalizedGeneration = generation
    ? normalizeGenerationValue(generation)
    : null;

  const cacheKey = `${normalizedType ?? 'none'}:${
    normalizedGeneration ?? 'none'
  }`;
  const cached = filteredPokemonIdsCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const filterIds: Set<number>[] = [];

  if (normalizedType) {
    const typeResponse = await getPokeApi<PokeApiTypeResponse>(
      `/type/${normalizedType}`,
    );
    filterIds.push(
      new Set(mapPokemonTypeList(typeResponse).map(item => item.id)),
    );
  }

  if (normalizedGeneration) {
    const generationResponse = await getPokeApi<PokeApiGenerationResponse>(
      `/generation/${normalizedGeneration}`,
    );
    filterIds.push(
      new Set(
        generationResponse.pokemon_species
          .map(species => getPokemonIdFromUrl(species.url))
          .filter((value): value is number => value !== null),
      ),
    );
  }

  if (filterIds.length === 0) {
    return null;
  }

  const computed = filterIds.reduce((combined, current) => {
    const next = new Set<number>();
    for (const id of combined) {
      if (current.has(id)) {
        next.add(id);
      }
    }
    return next;
  }, filterIds[0]);

  const promise = Promise.resolve(computed);
  filteredPokemonIdsCache.set(cacheKey, promise);
  return promise;
}

function normalizeGenerationValue(value: string): string {
  const trimmed = value.trim();
  const digits = trimmed.match(/\d+/)?.[0];

  return digits ?? trimmed.replace(/^generation[-_/\s]?/i, '').trim();
}

function getPokemonIdFromUrl(url: string): number | null {
  const match = url.match(/\/(?:pokemon|pokemon-species)\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function loadPokemonNameIndex(
  signal?: AbortSignal,
): Promise<PokemonListItem[]> {
  if (!pokemonNameIndexPromise) {
    pokemonNameIndexPromise = (
      signal
        ? getPokeApi<PokeApiListResponse>(
            `/pokemon?offset=0&limit=${POKEMON_INDEX_LIMIT}`,
            signal,
          )
        : getPokeApi<PokeApiListResponse>(
            `/pokemon?offset=0&limit=${POKEMON_INDEX_LIMIT}`,
          )
    )
      .then(mapPokemonList)
      .catch(error => {
        pokemonNameIndexPromise = null;
        throw error;
      });
  }

  return pokemonNameIndexPromise;
}

export function resetPokemonRepositoryCache() {
  pokemonNameIndexPromise = null;
  filteredPokemonIdsCache.clear();
}
