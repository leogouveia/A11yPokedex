export type PokemonStat = {
  label: string;
  value: number;
};

export type PokemonEvolutionItem = {
  id: number;
  name: string;
  imageUrl: string;
};

export type PokemonDetail = {
  abilities: string[];
  description: string;
  evolutions: PokemonEvolutionItem[];
  height: number;
  id: number;
  imageUrl: string;
  moves: string[];
  name: string;
  stats: PokemonStat[];
  types: string[];
  weight: number;
};
