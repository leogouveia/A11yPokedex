import {
  matchesPokemonName,
  normalizeSearchText,
  parsePokedexNumber,
  resolvePokemonType,
} from '../src/domain/pokemon/search';

describe('pokemon search rules', () => {
  it('normalizes case and diacritics', () => {
    expect(normalizeSearchText('  Água  ')).toBe('agua');
    expect(normalizeSearchText('ELÉTRICO')).toBe('eletrico');
  });

  it('matches Pokémon names without requiring exact case or accents', () => {
    expect(matchesPokemonName('nidoran-f', 'NIDO')).toBe(true);
    expect(matchesPokemonName('flabebe', 'Flabébé')).toBe(true);
    expect(matchesPokemonName('charmander', 'zard')).toBe(false);
  });

  it('parses a positive Pokédex number and rejects invalid values', () => {
    expect(parsePokedexNumber('25')).toBe(25);
    expect(parsePokedexNumber('025')).toBe(25);
    expect(parsePokedexNumber('0')).toBeNull();
    expect(parsePokedexNumber('1a')).toBeNull();
    expect(parsePokedexNumber('bulbasaur')).toBeNull();
  });

  it('resolves Portuguese and English type aliases', () => {
    expect(resolvePokemonType('fogo')).toBe('fire');
    expect(resolvePokemonType('Água')).toBe('water');
    expect(resolvePokemonType('elétrico')).toBe('electric');
    expect(resolvePokemonType('FIRE')).toBe('fire');
    expect(resolvePokemonType('char')).toBeNull();
  });
});
