import { parsePokemonData, TYPE_COLORS } from '../../src/domain/pokemon-catalog';

const DEFAULT_STATS = { attack: 100, defense: 100, stamina: 100 };

const makeEntry = (english: string, primary: string, secondary?: string, stats = DEFAULT_STATS) => ({
  names: { English: english },
  primaryType: { names: { English: primary } },
  secondaryType: secondary ? { names: { English: secondary } } : null,
  stats,
});

const STANDARD_TYPES = [
  'Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting',
  'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice',
  'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Water',
];

describe('TYPE_COLORS - centralized theme (spec 0004 AC-01, AC-02, AC-03)', () => {
  it('AC-01: defines all 18 standard Pokémon types', () => {
    expect(Object.keys(TYPE_COLORS)).toHaveLength(18);
    STANDARD_TYPES.forEach((type) => {
      expect(TYPE_COLORS).toHaveProperty(type);
    });
  });

  it('AC-03: each type maps to a valid hex color string', () => {
    Object.values(TYPE_COLORS).forEach((color) => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('AC-03: type colors match Pokémon GO conventions', () => {
    expect(TYPE_COLORS.Bug).toBe('#91A119');
    expect(TYPE_COLORS.Dark).toBe('#624D4E');
    expect(TYPE_COLORS.Dragon).toBe('#5060E1');
    expect(TYPE_COLORS.Electric).toBe('#FAC000');
    expect(TYPE_COLORS.Fairy).toBe('#EF70EF');
    expect(TYPE_COLORS.Fighting).toBe('#FF8000');
    expect(TYPE_COLORS.Fire).toBe('#E62829');
    expect(TYPE_COLORS.Flying).toBe('#81B9EF');
    expect(TYPE_COLORS.Ghost).toBe('#704170');
    expect(TYPE_COLORS.Grass).toBe('#3FA129');
    expect(TYPE_COLORS.Ground).toBe('#915121');
    expect(TYPE_COLORS.Ice).toBe('#3DCEF3');
    expect(TYPE_COLORS.Normal).toBe('#9FA19F');
    expect(TYPE_COLORS.Poison).toBe('#9141CB');
    expect(TYPE_COLORS.Psychic).toBe('#EF4179');
    expect(TYPE_COLORS.Rock).toBe('#AFA981');
    expect(TYPE_COLORS.Steel).toBe('#60A1B8');
    expect(TYPE_COLORS.Water).toBe('#2980EF');
  });
});

describe('parsePokemonData - stats (spec 0005 AC-01)', () => {
  it('AC-01: exposes attack, defense, and stamina as numeric values on each entry', () => {
    const raw = [makeEntry('Bulbasaur', 'Grass', 'Poison', { attack: 118, defense: 111, stamina: 128 })];
    const { entries } = parsePokemonData(raw);
    expect(entries[0].stats.attack).toBe(118);
    expect(entries[0].stats.defense).toBe(111);
    expect(entries[0].stats.stamina).toBe(128);
  });

  it('AC-01: all three stat fields are present and numeric', () => {
    const raw = [makeEntry('Charmander', 'Fire', undefined, { attack: 116, defense: 93, stamina: 118 })];
    const { entries } = parsePokemonData(raw);
    expect(typeof entries[0].stats.attack).toBe('number');
    expect(typeof entries[0].stats.defense).toBe('number');
    expect(typeof entries[0].stats.stamina).toBe('number');
  });

  it('skips entries with missing stats', () => {
    const raw = [
      makeEntry('Bulbasaur', 'Grass', 'Poison'),
      { names: { English: 'Mystery' }, primaryType: { names: { English: 'Normal' } }, secondaryType: null },
    ];
    const { entries } = parsePokemonData(raw);
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe('Bulbasaur');
  });
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
