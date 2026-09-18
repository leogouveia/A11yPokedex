import { getPokeApi } from '../src/data/pokeapi/client';
import {
  getPokemonPage,
  POKEMON_PAGE_SIZE,
} from '../src/data/pokeapi/repositories/pokemonRepository';

jest.mock('../src/data/pokeapi/client', () => ({
  getPokeApi: jest.fn(),
}));

const mockedGetPokeApi = jest.mocked(getPokeApi);

describe('pokemonRepository', () => {
  beforeEach(() => {
    mockedGetPokeApi.mockReset();
  });

  it('maps a page to sorted domain items and the next offset', async () => {
    mockedGetPokeApi.mockResolvedValue({
      count: 2,
      next: `https://pokeapi.co/api/v2/pokemon?offset=${POKEMON_PAGE_SIZE}&limit=${POKEMON_PAGE_SIZE}`,
      results: [
        { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
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
    expect(mockedGetPokeApi).toHaveBeenCalledWith('/pokemon?offset=0&limit=20');
  });

  it('marks the last page without a next offset', async () => {
    mockedGetPokeApi.mockResolvedValue({
      count: 1,
      next: null,
      results: [{ name: 'mew', url: 'https://pokeapi.co/api/v2/pokemon/151/' }],
    });

    await expect(getPokemonPage(140)).resolves.toMatchObject({
      nextOffset: null,
    });
  });
});
