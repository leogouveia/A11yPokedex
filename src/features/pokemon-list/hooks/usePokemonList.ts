import { useInfiniteQuery } from '@tanstack/react-query';
import { getPokemonPage } from '../../../data/pokeapi/repositories/pokemonRepository';

export function usePokemonList() {
  return useInfiniteQuery({
    queryKey: ['pokemon-list'],
    queryFn: ({ pageParam }) => getPokemonPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: lastPage => lastPage.nextOffset ?? undefined,
  });
}
