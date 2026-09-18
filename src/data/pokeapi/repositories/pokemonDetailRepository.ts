import type { PokemonDetail } from '../../../domain/pokemon/detailModels';
import { getPokeApi } from '../client';
import {
  mapEvolutionChain,
  mapPokemonDetail,
  type PokeApiEvolutionChainResponse,
  type PokeApiPokemonResponse,
  type PokeApiSpeciesResponse,
} from '../detailMappers';

export async function getPokemonDetail(
  pokemonId: number,
  signal?: AbortSignal,
): Promise<PokemonDetail> {
  const [pokemon, species] = await Promise.all([
    getPokeApi<PokeApiPokemonResponse>(`/pokemon/${pokemonId}`, signal),
    getPokeApi<PokeApiSpeciesResponse>(`/pokemon-species/${pokemonId}`, signal),
  ]);
  const evolutionChainId = species.evolution_chain.url.match(
    /\/evolution-chain\/(\d+)\/?$/,
  )?.[1];

  if (!evolutionChainId) {
    throw new Error('Não foi possível identificar a cadeia evolutiva.');
  }

  const evolutionChain = await getPokeApi<PokeApiEvolutionChainResponse>(
    `/evolution-chain/${evolutionChainId}`,
    signal,
  );

  return mapPokemonDetail(pokemon, species, mapEvolutionChain(evolutionChain));
}
