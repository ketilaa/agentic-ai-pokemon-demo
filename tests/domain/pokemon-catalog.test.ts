import { parsePokemonData } from '../../src/domain/pokemon-catalog';

// AC-01: data file contains Pokémon entries (validates the shape expected from the API)
// AC-04: count is derived correctly from the fetched data

describe('parsePokemonData - names (AC-02)', () => {
  it('extracts English names from each entry', () => {
    const raw = [
      { id: 'BULBASAUR', names: { English: 'Bulbasaur', German: 'Bisasam' } },
      { id: 'IVYSAUR', names: { English: 'Ivysaur', German: 'Bisaknosp' } },
    ];
    const catalog = parsePokemonData(raw);
    expect(catalog.names).toContain('Bulbasaur');
    expect(catalog.names).toContain('Ivysaur');
  });

  it('does not include non-English names', () => {
    const raw = [{ id: 'BULBASAUR', names: { English: 'Bulbasaur', German: 'Bisasam' } }];
    const catalog = parsePokemonData(raw);
    expect(catalog.names).not.toContain('Bisasam');
  });

  it('returns names sorted alphabetically', () => {
    const raw = [
      { id: 'VENUSAUR', names: { English: 'Venusaur' } },
      { id: 'BULBASAUR', names: { English: 'Bulbasaur' } },
      { id: 'IVYSAUR', names: { English: 'Ivysaur' } },
    ];
    const catalog = parsePokemonData(raw);
    expect([...catalog.names]).toEqual(['Bulbasaur', 'Ivysaur', 'Venusaur']);
  });

  it('skips entries with no English name but still counts them', () => {
    const raw = [
      { id: 'BULBASAUR', names: { English: 'Bulbasaur' } },
      { id: 'MYSTERY', names: {} },
    ];
    const catalog = parsePokemonData(raw);
    expect(catalog.names).toEqual(['Bulbasaur']);
    expect(catalog.count).toBe(2);
  });

  it('names are immutable', () => {
    const raw = [{ id: 'BULBASAUR', names: { English: 'Bulbasaur' } }];
    const catalog = parsePokemonData(raw);
    expect(() => {
      (catalog.names as string[]).push('Hack');
    }).toThrow();
  });
});

describe('parsePokemonData', () => {
  it('returns the count of entries in the array', () => {
    const raw = [{ id: 'BULBASAUR' }, { id: 'IVYSAUR' }, { id: 'VENUSAUR' }];
    const catalog = parsePokemonData(raw);
    expect(catalog.count).toBe(3);
  });

  it('returns count for a single-entry array', () => {
    const raw = [{ id: 'BULBASAUR' }];
    const catalog = parsePokemonData(raw);
    expect(catalog.count).toBe(1);
  });

  it('throws when raw data is not an array', () => {
    expect(() => parsePokemonData({})).toThrow('Pokémon data must be a JSON array');
    expect(() => parsePokemonData(null)).toThrow('Pokémon data must be a JSON array');
    expect(() => parsePokemonData('string')).toThrow('Pokémon data must be a JSON array');
  });

  it('throws when raw data is an empty array', () => {
    expect(() => parsePokemonData([])).toThrow('Pokémon data array must not be empty');
  });

  it('produces an immutable catalog', () => {
    const catalog = parsePokemonData([{ id: 'BULBASAUR' }]);
    expect(() => {
      (catalog as { count: number }).count = 999;
    }).toThrow();
  });
});
