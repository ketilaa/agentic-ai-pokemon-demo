import { parsePokemonData } from '../../src/domain/pokemon-catalog';

const makeEntry = (english: string, primary: string, secondary?: string) => ({
  names: { English: english },
  primaryType: { names: { English: primary } },
  secondaryType: secondary ? { names: { English: secondary } } : null,
});

describe('parsePokemonData - names', () => {
  it('extracts English names from each entry', () => {
    const raw = [
      makeEntry('Bulbasaur', 'Grass', 'Poison'),
      makeEntry('Ivysaur', 'Grass', 'Poison'),
    ];
    const catalog = parsePokemonData(raw);
    expect(catalog.names).toContain('Bulbasaur');
    expect(catalog.names).toContain('Ivysaur');
  });

  it('does not include non-English names', () => {
    const raw = [{ names: { English: 'Bulbasaur', German: 'Bisasam' }, primaryType: { names: { English: 'Grass' } }, secondaryType: null }];
    const catalog = parsePokemonData(raw);
    expect(catalog.names).not.toContain('Bisasam');
  });

  it('returns names sorted alphabetically', () => {
    const raw = [
      makeEntry('Venusaur', 'Grass', 'Poison'),
      makeEntry('Bulbasaur', 'Grass', 'Poison'),
      makeEntry('Ivysaur', 'Grass', 'Poison'),
    ];
    const catalog = parsePokemonData(raw);
    expect([...catalog.names]).toEqual(['Bulbasaur', 'Ivysaur', 'Venusaur']);
  });

  it('skips entries with no English name but still counts them', () => {
    const raw = [
      makeEntry('Bulbasaur', 'Grass', 'Poison'),
      { names: {} },
    ];
    const catalog = parsePokemonData(raw);
    expect(catalog.names).toEqual(['Bulbasaur']);
    expect(catalog.count).toBe(2);
  });

  it('names are immutable', () => {
    const raw = [makeEntry('Bulbasaur', 'Grass', 'Poison')];
    const catalog = parsePokemonData(raw);
    expect(() => {
      (catalog.names as string[]).push('Hack');
    }).toThrow();
  });
});

describe('parsePokemonData - entries', () => {
  it('includes entries with both name and primaryType', () => {
    const raw = [makeEntry('Charmander', 'Fire')];
    const { entries } = parsePokemonData(raw);
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe('Charmander');
  });

  it('sets primaryType name and colour', () => {
    const raw = [makeEntry('Charmander', 'Fire')];
    const { entries } = parsePokemonData(raw);
    expect(entries[0].primaryType.name).toBe('Fire');
    expect(entries[0].primaryType.color).toBe('#E62829');
  });

  it('sets secondaryType for dual-type Pokémon', () => {
    const raw = [makeEntry('Bulbasaur', 'Grass', 'Poison')];
    const { entries } = parsePokemonData(raw);
    expect(entries[0].secondaryType).not.toBeNull();
    expect(entries[0].secondaryType!.name).toBe('Poison');
    expect(entries[0].secondaryType!.color).toBe('#9141CB');
  });

  it('sets secondaryType to null for single-type Pokémon', () => {
    const raw = [makeEntry('Charmander', 'Fire')];
    const { entries } = parsePokemonData(raw);
    expect(entries[0].secondaryType).toBeNull();
  });

  it('skips entries missing primaryType', () => {
    const raw = [
      makeEntry('Bulbasaur', 'Grass', 'Poison'),
      { names: { English: 'Mystery' }, primaryType: null, secondaryType: null },
    ];
    const { entries } = parsePokemonData(raw);
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe('Bulbasaur');
  });

  it('returns entries sorted alphabetically', () => {
    const raw = [
      makeEntry('Venusaur', 'Grass', 'Poison'),
      makeEntry('Bulbasaur', 'Grass', 'Poison'),
    ];
    const { entries } = parsePokemonData(raw);
    expect(entries.map((e) => e.name)).toEqual(['Bulbasaur', 'Venusaur']);
  });

  it('falls back to #888888 for an unrecognised type', () => {
    const raw = [makeEntry('Unknown', 'Spectral')];
    const { entries } = parsePokemonData(raw);
    expect(entries[0].primaryType.color).toBe('#888888');
  });
});

describe('parsePokemonData - count and errors', () => {
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
