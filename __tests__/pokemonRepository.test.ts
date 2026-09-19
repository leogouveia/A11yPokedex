import { getPokeApi } from '../src/data/pokeapi/client';
import {
  getPokemonPage,
  POKEMON_INDEX_LIMIT,
  POKEMON_PAGE_SIZE,
  resetPokemonRepositoryCache,
  searchPokemon,
} from '../src/data/pokeapi/repositories/pokemonRepository';

jest.mock('../src/data/pokeapi/client', () => ({
  getPokeApi: jest.fn(),
}));

const mockedGetPokeApi = jest.mocked(getPokeApi);

describe('pokemonRepository', () => {
  beforeEach(() => {
    mockedGetPokeApi.mockReset();
    resetPokemonRepositoryCache();
  });

  it('maps a page to sorted domain items and the next offset', async () => {
    mockedGetPokeApi.mockResolvedValue({
      count: 2,
      next: `https://pokeapi.co/api/v2/pokemon-species?offset=${POKEMON_PAGE_SIZE}&limit=${POKEMON_PAGE_SIZE}`,
      results: [
        {
          name: 'ivysaur',
          url: 'https://pokeapi.co/api/v2/pokemon-species/2/',
        },
        {
          name: 'bulbasaur',
          url: 'https://pokeapi.co/api/v2/pokemon-species/1/',
        },
      ],
    });

    await expect(getPokemonPage(0)).resolves.toEqual({
      items: [
        {
          id: 1,
          imageUrl:
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
          name: 'bulbasaur',
        },
        {
          id: 2,
          imageUrl:
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png',
          name: 'ivysaur',
        },
      ],
      nextOffset: 20,
    });
    expect(mockedGetPokeApi).toHaveBeenCalledWith(
      '/pokemon-species?offset=0&limit=20',
    );
  });

  it('marks the last page without a next offset', async () => {
    mockedGetPokeApi.mockResolvedValue({
      count: 1,
      next: null,
      results: [
        {
          name: 'mew',
          url: 'https://pokeapi.co/api/v2/pokemon-species/151/',
        },
      ],
    });

    await expect(getPokemonPage(140)).resolves.toMatchObject({
      nextOffset: null,
    });
  });

  it('searches Pokémon by partial name without requiring exact case', async () => {
    mockedGetPokeApi.mockResolvedValue({
      count: 3,
      next: null,
      results: [
        {
          name: 'bulbasaur',
          url: 'https://pokeapi.co/api/v2/pokemon-species/1/',
        },
        {
          name: 'charmander',
          url: 'https://pokeapi.co/api/v2/pokemon-species/4/',
        },
        {
          name: 'charizard',
          url: 'https://pokeapi.co/api/v2/pokemon-species/6/',
        },
      ],
    });

    await expect(searchPokemon('CHAR')).resolves.toEqual([
      {
        id: 4,
        imageUrl:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
        name: 'charmander',
      },
      {
        id: 6,
        imageUrl:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
        name: 'charizard',
      },
    ]);
    expect(mockedGetPokeApi).toHaveBeenCalledWith(
      `/pokemon-species?offset=0&limit=${POKEMON_INDEX_LIMIT}`,
    );
  });

  it('searches Pokémon by Pokédex number', async () => {
    mockedGetPokeApi.mockResolvedValue({
      count: 2,
      next: null,
      results: [
        {
          name: 'bulbasaur',
          url: 'https://pokeapi.co/api/v2/pokemon-species/1/',
        },
        {
          name: 'pikachu',
          url: 'https://pokeapi.co/api/v2/pokemon-species/25/',
        },
      ],
    });

    await expect(searchPokemon('025')).resolves.toEqual([
      {
        id: 25,
        imageUrl:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        name: 'pikachu',
      },
    ]);
  });

  it('searches Pokémon by type using the type endpoint', async () => {
    mockedGetPokeApi.mockResolvedValue({
      pokemon: [
        {
          pokemon: {
            name: 'charmander',
            url: 'https://pokeapi.co/api/v2/pokemon/4/',
          },
        },
        {
          pokemon: {
            name: 'vulpix',
            url: 'https://pokeapi.co/api/v2/pokemon/37/',
          },
        },
      ],
    });

    await expect(searchPokemon('fogo')).resolves.toEqual([
      {
        id: 4,
        imageUrl:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
        name: 'charmander',
      },
      {
        id: 37,
        imageUrl:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/37.png',
        name: 'vulpix',
      },
    ]);
    expect(mockedGetPokeApi).toHaveBeenCalledWith('/type/fire');
  });

  it('intersects type and generation filters on the Pokémon list', async () => {
    mockedGetPokeApi.mockImplementation(async (url: string) => {
      if (url === '/type/fire') {
        return {
          pokemon: [
            {
              pokemon: {
                name: 'charmander',
                url: 'https://pokeapi.co/api/v2/pokemon/4/',
              },
            },
            {
              pokemon: {
                name: 'charizard',
                url: 'https://pokeapi.co/api/v2/pokemon/6/',
              },
            },
            {
              pokemon: {
                name: 'vulpix',
                url: 'https://pokeapi.co/api/v2/pokemon/37/',
              },
            },
          ],
        };
      }

      if (url === '/generation/1') {
        return {
          pokemon_species: [
            {
              name: 'bulbasaur',
              url: 'https://pokeapi.co/api/v2/pokemon-species/1/',
            },
            {
              name: 'charmander',
              url: 'https://pokeapi.co/api/v2/pokemon-species/4/',
            },
            {
              name: 'squirtle',
              url: 'https://pokeapi.co/api/v2/pokemon-species/7/',
            },
          ],
        };
      }

      if (url === '/pokemon/4' || url === '/pokemon/6') {
        return { is_default: true };
      }

      if (url === '/pokemon/37') {
        return { is_default: false };
      }

      if (url === `/pokemon-species?offset=0&limit=${POKEMON_INDEX_LIMIT}`) {
        return {
          count: 10,
          next: null,
          results: [
            {
              name: 'bulbasaur',
              url: 'https://pokeapi.co/api/v2/pokemon-species/1/',
            },
            {
              name: 'charmander',
              url: 'https://pokeapi.co/api/v2/pokemon-species/4/',
            },
            {
              name: 'charizard',
              url: 'https://pokeapi.co/api/v2/pokemon-species/6/',
            },
            {
              name: 'squirtle',
              url: 'https://pokeapi.co/api/v2/pokemon-species/7/',
            },
            {
              name: 'vulpix',
              url: 'https://pokeapi.co/api/v2/pokemon-species/37/',
            },
          ],
        };
      }

      throw new Error(`Unexpected URL: ${url}`);
    });

    await expect(getPokemonPage(0, 'fire', '1')).resolves.toEqual({
      items: [
        {
          id: 4,
          imageUrl:
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
          name: 'charmander',
        },
      ],
      nextOffset: null,
    });
  });

  it('returns an empty list when the search has no matches', async () => {
    mockedGetPokeApi.mockResolvedValue({
      count: 1,
      next: null,
      results: [
        {
          name: 'bulbasaur',
          url: 'https://pokeapi.co/api/v2/pokemon-species/1/',
        },
      ],
    });

    await expect(searchPokemon('xyz')).resolves.toEqual([]);
  });
});
