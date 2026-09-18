import { getPokeApi } from '../src/data/pokeapi/client';
import { getPokemonDetail } from '../src/data/pokeapi/repositories/pokemonDetailRepository';

jest.mock('../src/data/pokeapi/client', () => ({
  getPokeApi: jest.fn(),
}));

const mockedGetPokeApi = jest.mocked(getPokeApi);

describe('pokemonDetailRepository', () => {
  it('composes detail, Portuguese description, stats, moves, and evolution chain', async () => {
    mockedGetPokeApi.mockImplementation(async (path: string) => {
      if (path === '/pokemon/1') {
        return {
          abilities: [{ ability: { name: 'overgrow', url: '' } }],
          height: 7,
          id: 1,
          moves: [{ move: { name: 'tackle', url: '' } }],
          name: 'bulbasaur',
          sprites: { other: { 'official-artwork': { front_default: 'art' } } },
          stats: [
            { base_stat: 45, stat: { name: 'hp', url: '' } },
            { base_stat: 49, stat: { name: 'attack', url: '' } },
          ],
          types: [{ type: { name: 'grass', url: '' } }],
          weight: 69,
        };
      }

      if (path === '/pokemon-species/1') {
        return {
          evolution_chain: {
            url: 'https://pokeapi.co/api/v2/evolution-chain/1/',
          },
          flavor_text_entries: [
            {
              flavor_text: 'Uma semente estranha cresce em suas costas.',
              language: { name: 'pt-br', url: '' },
            },
          ],
        };
      }

      return {
        chain: {
          evolves_to: [
            {
              evolves_to: [],
              species: {
                name: 'ivysaur',
                url: 'https://pokeapi.co/api/v2/pokemon-species/2/',
              },
            },
          ],
          species: {
            name: 'bulbasaur',
            url: 'https://pokeapi.co/api/v2/pokemon-species/1/',
          },
        },
      };
    });

    await expect(getPokemonDetail(1)).resolves.toEqual({
      abilities: ['overgrow'],
      description: 'Uma semente estranha cresce em suas costas.',
      evolutions: [
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
      height: 7,
      id: 1,
      imageUrl: 'art',
      moves: ['tackle'],
      name: 'bulbasaur',
      stats: [
        { label: 'HP', value: 45 },
        { label: 'Ataque', value: 49 },
      ],
      types: ['Planta'],
      weight: 69,
    });
  });

  it('uses the explicit fallback when Portuguese description is absent', async () => {
    mockedGetPokeApi.mockResolvedValueOnce({
      abilities: [],
      height: 1,
      id: 1,
      moves: [],
      name: 'bulbasaur',
      sprites: { other: {} },
      stats: [],
      types: [],
      weight: 1,
    });
    mockedGetPokeApi.mockResolvedValueOnce({
      evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/1/' },
      flavor_text_entries: [],
    });
    mockedGetPokeApi.mockResolvedValueOnce({
      chain: {
        evolves_to: [],
        species: { name: 'bulbasaur', url: '/pokemon-species/1/' },
      },
    });

    await expect(getPokemonDetail(1)).resolves.toMatchObject({
      description: 'Não disponível.',
    });
  });
});
