const API_BASE_URL = 'https://pokeapi.co/api/v2';
const REQUEST_TIMEOUT_MS = 10000;

export class PokeApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PokeApiError';
  }
}

export async function getPokeApi<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new PokeApiError('A PokéAPI não respondeu corretamente.');
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof PokeApiError) {
      throw error;
    }

    throw new PokeApiError(
      'Não foi possível carregar os Pokémon. Verifique sua conexão e tente novamente.',
    );
  } finally {
    clearTimeout(timeout);
  }
}
