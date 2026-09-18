import { useQuery } from '@tanstack/react-query';
import { getPokemonDetail } from '../../../data/pokeapi/repositories/pokemonDetailRepository';

export function usePokemonDetail(pokemonId: number) {
  return useQuery({
    queryKey: ['pokemon-detail', pokemonId],
    queryFn: ({ signal }) => getPokemonDetail(pokemonId, signal),
  });
}
