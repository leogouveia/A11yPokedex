import { useQuery } from '@tanstack/react-query';
import { searchPokemon } from '../../../data/pokeapi/repositories/pokemonRepository';

export function usePokemonSearch(searchTerm: string) {
  const query = searchTerm.trim();

  return useQuery({
    queryKey: ['pokemon-search', query],
    queryFn: ({ signal }) => searchPokemon(query, signal),
    enabled: query.length > 0,
  });
}
