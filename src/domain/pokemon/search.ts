const POKEMON_TYPE_ALIASES: Record<string, string> = {
  aco: 'steel',
  agua: 'water',
  bug: 'bug',
  dark: 'dark',
  dragao: 'dragon',
  dragon: 'dragon',
  electric: 'electric',
  eletrico: 'electric',
  fada: 'fairy',
  fairy: 'fairy',
  fantasma: 'ghost',
  fighting: 'fighting',
  fire: 'fire',
  flying: 'flying',
  fogo: 'fire',
  gelo: 'ice',
  ghost: 'ghost',
  grama: 'grass',
  grass: 'grass',
  ground: 'ground',
  ice: 'ice',
  inseto: 'bug',
  luta: 'fighting',
  lutador: 'fighting',
  normal: 'normal',
  noturno: 'dark',
  pedra: 'rock',
  planta: 'grass',
  poison: 'poison',
  psychic: 'psychic',
  psiquico: 'psychic',
  rock: 'rock',
  sombrio: 'dark',
  steel: 'steel',
  terra: 'ground',
  veneno: 'poison',
  voador: 'flying',
  water: 'water',
};

export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function parsePokedexNumber(value: string): number | null {
  const trimmed = value.trim();

  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  const id = Number(trimmed);

  if (!Number.isInteger(id) || id < 1) {
    return null;
  }

  return id;
}

export function resolvePokemonType(value: string): string | null {
  return POKEMON_TYPE_ALIASES[normalizeSearchText(value)] ?? null;
}

export function matchesPokemonName(name: string, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return false;
  }

  return normalizeSearchText(name).includes(normalizedQuery);
}
