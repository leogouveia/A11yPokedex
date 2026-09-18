import { useInfiniteQuery } from '@tanstack/react-query';
import { getPokemonPage } from '../../../data/pokeapi/repositories/pokemonRepository';

type UsePokemonListOptions = {
  enabled?: boolean;
  generation?: string;
  type?: string;
};

export function usePokemonList(options?: UsePokemonListOptions) {
  return useInfiniteQuery({
    queryKey: [
      'pokemon-list',
      { generation: options?.generation ?? null, type: options?.type ?? null },
    ],
    queryFn: ({ pageParam }) =>
      getPokemonPage(pageParam, options?.type, options?.generation),
    initialPageParam: 0,
    getNextPageParam: lastPage => lastPage.nextOffset ?? undefined,
    enabled: options?.enabled ?? true,
  });
}
