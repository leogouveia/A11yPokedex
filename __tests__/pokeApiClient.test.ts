import { getPokeApi, PokeApiError } from '../src/data/pokeapi/client';

describe('getPokeApi', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('normalizes an unsuccessful HTTP response', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: false } as Response);

    await expect(getPokeApi('/pokemon')).rejects.toEqual(
      new PokeApiError('A PokéAPI não respondeu corretamente.'),
    );
  });

  it('normalizes a network failure', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('Network down'));

    await expect(getPokeApi('/pokemon')).rejects.toEqual(
      new PokeApiError(
        'Não foi possível carregar os Pokémon. Verifique sua conexão e tente novamente.',
      ),
    );
  });
});
