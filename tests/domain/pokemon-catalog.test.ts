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

describe('parsePokemonData - statMaxima (spec 0006 AC-01, AC-02, AC-03)', () => {
  it('AC-01: maxAttack equals the highest Attack value in the dataset', () => {
    const raw = [
      makeEntry('A', 'Fire', undefined, { attack: 200, defense: 80, stamina: 100 }),
      makeEntry('B', 'Water', undefined, { attack: 100, defense: 180, stamina: 120 }),
    ];
    expect(parsePokemonData(raw).statMaxima.maxAttack).toBe(200);
  });

  it('AC-02: maxDefense equals the highest Defense value in the dataset', () => {
    const raw = [
      makeEntry('A', 'Fire', undefined, { attack: 200, defense: 80, stamina: 100 }),
      makeEntry('B', 'Water', undefined, { attack: 100, defense: 180, stamina: 120 }),
    ];
    expect(parsePokemonData(raw).statMaxima.maxDefense).toBe(180);
  });

  it('AC-03: maxStamina equals the highest Stamina value in the dataset', () => {
    const raw = [
      makeEntry('A', 'Fire', undefined, { attack: 200, defense: 80, stamina: 100 }),
      makeEntry('B', 'Normal', undefined, { attack: 90, defense: 110, stamina: 250 }),
    ];
    expect(parsePokemonData(raw).statMaxima.maxStamina).toBe(250);
  });

  it('each maximum is computed independently per dimension', () => {
    const raw = [
      makeEntry('A', 'Fire', undefined, { attack: 300, defense: 50, stamina: 100 }),
      makeEntry('B', 'Water', undefined, { attack: 50, defense: 300, stamina: 100 }),
      makeEntry('C', 'Grass', undefined, { attack: 50, defense: 50, stamina: 300 }),
    ];
    const { statMaxima } = parsePokemonData(raw);
    expect(statMaxima.maxAttack).toBe(300);
    expect(statMaxima.maxDefense).toBe(300);
    expect(statMaxima.maxStamina).toBe(300);
  });

  it('statMaxima is immutable', () => {
    const raw = [makeEntry('Bulbasaur', 'Grass', 'Poison')];
    const { statMaxima } = parsePokemonData(raw);
    expect(() => {
      (statMaxima as { maxAttack: number }).maxAttack = 999;
    }).toThrow();
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

const makeEvoEntry = (
  id: string,
  english: string,
  primary: string,
  evolutionIds: string[] = [],
  stats = DEFAULT_STATS
) => ({
  id,
  names: { English: english },
  primaryType: { names: { English: primary } },
  secondaryType: null,
  stats,
  evolutions: evolutionIds.map((eid) => ({ id: eid })),
});

describe('parsePokemonData - evolution chain (spec 0007 AC-01 to AC-06)', () => {
  it('AC-01: each PokemonEntry has evolvesFrom (string|null) and evolvesTo (string[])', () => {
    const raw = [makeEvoEntry('BULBASAUR', 'Bulbasaur', 'Grass')];
    const { entries } = parsePokemonData(raw);
    expect(entries[0]).toHaveProperty('evolvesFrom');
    expect(entries[0]).toHaveProperty('evolvesTo');
    expect(typeof entries[0].evolvesFrom === 'string' || entries[0].evolvesFrom === null).toBe(true);
    expect(Array.isArray(entries[0].evolvesTo)).toBe(true);
  });

  it('AC-02: base-stage Pokémon has evolvesFrom null and evolvesTo with its direct evolution', () => {
    const raw = [
      makeEvoEntry('BULBASAUR', 'Bulbasaur', 'Grass', ['IVYSAUR']),
      makeEvoEntry('IVYSAUR', 'Ivysaur', 'Grass'),
    ];
    const bulbasaur = parsePokemonData(raw).entries.find((e) => e.name === 'Bulbasaur')!;
    expect(bulbasaur.evolvesFrom).toBeNull();
    expect(bulbasaur.evolvesTo).toEqual(['Ivysaur']);
  });

  it('AC-03: mid-stage Pokémon has correct evolvesFrom and evolvesTo', () => {
    const raw = [
      makeEvoEntry('BULBASAUR', 'Bulbasaur', 'Grass', ['IVYSAUR']),
      makeEvoEntry('IVYSAUR', 'Ivysaur', 'Grass', ['VENUSAUR']),
      makeEvoEntry('VENUSAUR', 'Venusaur', 'Grass'),
    ];
    const ivysaur = parsePokemonData(raw).entries.find((e) => e.name === 'Ivysaur')!;
    expect(ivysaur.evolvesFrom).toBe('Bulbasaur');
    expect(ivysaur.evolvesTo).toEqual(['Venusaur']);
  });

  it('AC-04: final-stage Pokémon has evolvesFrom set and evolvesTo empty', () => {
    const raw = [
      makeEvoEntry('BULBASAUR', 'Bulbasaur', 'Grass', ['IVYSAUR']),
      makeEvoEntry('IVYSAUR', 'Ivysaur', 'Grass', ['VENUSAUR']),
      makeEvoEntry('VENUSAUR', 'Venusaur', 'Grass'),
    ];
    const venusaur = parsePokemonData(raw).entries.find((e) => e.name === 'Venusaur')!;
    expect(venusaur.evolvesFrom).toBe('Ivysaur');
    expect(venusaur.evolvesTo).toEqual([]);
  });

  it('AC-05: Pokémon with multiple evolution targets has all successors in evolvesTo', () => {
    const raw = [
      makeEvoEntry('EEVEE', 'Eevee', 'Normal', ['VAPOREON', 'JOLTEON', 'FLAREON']),
      makeEvoEntry('VAPOREON', 'Vaporeon', 'Water'),
      makeEvoEntry('JOLTEON', 'Jolteon', 'Electric'),
      makeEvoEntry('FLAREON', 'Flareon', 'Fire'),
    ];
    const eevee = parsePokemonData(raw).entries.find((e) => e.name === 'Eevee')!;
    expect(eevee.evolvesTo).toHaveLength(3);
    expect(eevee.evolvesTo).toContain('Vaporeon');
    expect(eevee.evolvesTo).toContain('Jolteon');
    expect(eevee.evolvesTo).toContain('Flareon');
  });

  it('AC-06: standalone Pokémon has evolvesFrom null and evolvesTo empty', () => {
    const raw = [makeEvoEntry('SNORLAX', 'Snorlax', 'Normal')];
    const { entries } = parsePokemonData(raw);
    expect(entries[0].evolvesFrom).toBeNull();
    expect(entries[0].evolvesTo).toEqual([]);
  });

  it('evolvesTo preserves dataset order (spec 0007 section 3.1)', () => {
    const raw = [
      makeEvoEntry('EEVEE', 'Eevee', 'Normal', ['VAPOREON', 'JOLTEON', 'FLAREON']),
      makeEvoEntry('VAPOREON', 'Vaporeon', 'Water'),
      makeEvoEntry('JOLTEON', 'Jolteon', 'Electric'),
      makeEvoEntry('FLAREON', 'Flareon', 'Fire'),
    ];
    const eevee = parsePokemonData(raw).entries.find((e) => e.name === 'Eevee')!;
    expect([...eevee.evolvesTo]).toEqual(['Vaporeon', 'Jolteon', 'Flareon']);
  });

  it('silently omits evolution targets absent from the dataset', () => {
    const raw = [makeEvoEntry('BULBASAUR', 'Bulbasaur', 'Grass', ['MISSING_POKEMON'])];
    const { entries } = parsePokemonData(raw);
    expect(entries[0].evolvesTo).toEqual([]);
  });

  it('entries without an id field have evolvesFrom null and evolvesTo empty', () => {
    const raw = [makeEntry('Charmander', 'Fire')];
    const { entries } = parsePokemonData(raw);
    expect(entries[0].evolvesFrom).toBeNull();
    expect(entries[0].evolvesTo).toEqual([]);
  });

  it('de-duplicates evolvesFrom when multiple form entries share the same English name and target', () => {
    const raw = [
      { id: 'DUNSPARCE', names: { English: 'Dunsparce' }, primaryType: { names: { English: 'Normal' } }, secondaryType: null, stats: DEFAULT_STATS, evolutions: [{ id: 'DUDUNSPARCE' }] },
      { id: 'DUNSPARCE_TWO_SEGMENT', names: { English: 'Dunsparce' }, primaryType: { names: { English: 'Normal' } }, secondaryType: null, stats: DEFAULT_STATS, evolutions: [{ id: 'DUDUNSPARCE' }] },
      { id: 'DUDUNSPARCE', names: { English: 'Dudunsparce' }, primaryType: { names: { English: 'Normal' } }, secondaryType: null, stats: DEFAULT_STATS, evolutions: [] },
    ];
    const dudunsparce = parsePokemonData(raw).entries.find((e) => e.name === 'Dudunsparce')!;
    expect(dudunsparce.evolvesFrom).toBe('Dunsparce');
  });
});

describe('parsePokemonData - imageUrl (spec 0009 AC-04 to AC-07)', () => {
  const VALID_IMAGE_URL = 'https://raw.githubusercontent.com/pokemon-go-api/assets/main/Pokemon/pm1.icon.png';

  it('AC-04: each PokemonEntry has an imageUrl field of type string | null', () => {
    const raw = [makeEntry('Bulbasaur', 'Grass', 'Poison')];
    const { entries } = parsePokemonData(raw);
    expect(entries[0]).toHaveProperty('imageUrl');
    const val = entries[0].imageUrl;
    expect(val === null || typeof val === 'string').toBe(true);
  });

  it('AC-05: entry with a raw.githubusercontent.com image URL has a non-null imageUrl equal to that URL', () => {
    const raw = [{ ...makeEntry('Bulbasaur', 'Grass', 'Poison'), assets: { image: VALID_IMAGE_URL } }];
    const { entries } = parsePokemonData(raw);
    expect(entries[0].imageUrl).toBe(VALID_IMAGE_URL);
  });

  it('AC-06: entry with no assets.image field has imageUrl null', () => {
    const raw = [makeEntry('Bulbasaur', 'Grass', 'Poison')];
    const { entries } = parsePokemonData(raw);
    expect(entries[0].imageUrl).toBeNull();
  });

  it('AC-06: entry with assets.image set to null has imageUrl null', () => {
    const raw = [{ ...makeEntry('Bulbasaur', 'Grass', 'Poison'), assets: { image: null } }];
    const { entries } = parsePokemonData(raw);
    expect(entries[0].imageUrl).toBeNull();
  });

  it('AC-07: entry whose assets.image hostname is not raw.githubusercontent.com has imageUrl null', () => {
    const raw = [{ ...makeEntry('Bulbasaur', 'Grass', 'Poison'), assets: { image: 'https://evil.example.com/image.png' } }];
    const { entries } = parsePokemonData(raw);
    expect(entries[0].imageUrl).toBeNull();
  });

  it('AC-07: subdomain-spoofed host (raw.githubusercontent.com.evil.com) has imageUrl null', () => {
    const raw = [{ ...makeEntry('Bulbasaur', 'Grass', 'Poison'), assets: { image: 'https://raw.githubusercontent.com.evil.com/x.png' } }];
    const { entries } = parsePokemonData(raw);
    expect(entries[0].imageUrl).toBeNull();
  });

  it('AC-06: entry with assets.image as a non-string (number) has imageUrl null', () => {
    const raw = [{ ...makeEntry('Bulbasaur', 'Grass', 'Poison'), assets: { image: 42 } }];
    const { entries } = parsePokemonData(raw);
    expect(entries[0].imageUrl).toBeNull();
  });

  it('invalid URL string results in imageUrl null', () => {
    const raw = [{ ...makeEntry('Bulbasaur', 'Grass', 'Poison'), assets: { image: 'not-a-url' } }];
    const { entries } = parsePokemonData(raw);
    expect(entries[0].imageUrl).toBeNull();
  });
});

// Helper for move type tests
function makeMove(typeEnglish: string) {
  return { type: { names: { English: typeEnglish } } };
}

describe('parsePokemonData - move type extraction (spec 0012)', () => {
  it('each PokemonEntry exposes quickMoveTypes and chargedMoveTypes as readonly string arrays', () => {
    const raw = [makeEntry('Bulbasaur', 'Grass', 'Poison')];
    const { entries } = parsePokemonData(raw);
    expect(Array.isArray(entries[0].quickMoveTypes)).toBe(true);
    expect(Array.isArray(entries[0].chargedMoveTypes)).toBe(true);
  });

  it('quickMoveTypes is empty when quickMoves and eliteQuickMoves are absent', () => {
    const raw = [makeEntry('Bulbasaur', 'Grass', 'Poison')];
    expect(parsePokemonData(raw).entries[0].quickMoveTypes).toEqual([]);
  });

  it('chargedMoveTypes is empty when cinematicMoves and eliteCinematicMoves are absent', () => {
    const raw = [makeEntry('Bulbasaur', 'Grass', 'Poison')];
    expect(parsePokemonData(raw).entries[0].chargedMoveTypes).toEqual([]);
  });

  it('quickMoveTypes is empty when quickMoves is an empty array []', () => {
    const raw = [{ ...makeEntry('A', 'Fire'), quickMoves: [], eliteQuickMoves: [] }];
    expect(parsePokemonData(raw).entries[0].quickMoveTypes).toEqual([]);
  });

  it('chargedMoveTypes is empty when cinematicMoves is an empty array []', () => {
    const raw = [{ ...makeEntry('A', 'Fire'), cinematicMoves: [], eliteCinematicMoves: [] }];
    expect(parsePokemonData(raw).entries[0].chargedMoveTypes).toEqual([]);
  });

  it('extracts types from regular quickMoves object', () => {
    const raw = [{
      ...makeEntry('Bulbasaur', 'Grass', 'Poison'),
      quickMoves: { VINE_WHIP_FAST: makeMove('Grass'), TACKLE_FAST: makeMove('Normal') },
      eliteQuickMoves: [],
    }];
    const { quickMoveTypes } = parsePokemonData(raw).entries[0];
    expect(quickMoveTypes).toContain('Grass');
    expect(quickMoveTypes).toContain('Normal');
    expect(quickMoveTypes).toHaveLength(2);
  });

  it('extracts types from eliteQuickMoves object and unions with quickMoves', () => {
    const raw = [{
      ...makeEntry('Charizard', 'Fire', 'Flying'),
      quickMoves: { AIR_SLASH_FAST: makeMove('Flying') },
      eliteQuickMoves: { EMBER_FAST: makeMove('Fire'), WING_ATTACK_FAST: makeMove('Flying') },
    }];
    const { quickMoveTypes } = parsePokemonData(raw).entries[0];
    expect(quickMoveTypes).toContain('Flying');
    expect(quickMoveTypes).toContain('Fire');
    expect(quickMoveTypes).toHaveLength(2);
  });

  it('deduplicates types within quickMoveTypes', () => {
    const raw = [{
      ...makeEntry('A', 'Fire'),
      quickMoves: { M1: makeMove('Fire'), M2: makeMove('Fire'), M3: makeMove('Normal') },
      eliteQuickMoves: [],
    }];
    const { quickMoveTypes } = parsePokemonData(raw).entries[0];
    expect(quickMoveTypes.filter((t) => t === 'Fire')).toHaveLength(1);
    expect(quickMoveTypes).toHaveLength(2);
  });

  it('extracts types from cinematicMoves for chargedMoveTypes', () => {
    const raw = [{
      ...makeEntry('Bulbasaur', 'Grass', 'Poison'),
      quickMoves: [],
      eliteQuickMoves: [],
      cinematicMoves: { POWER_WHIP: makeMove('Grass'), SLUDGE_BOMB: makeMove('Poison') },
      eliteCinematicMoves: [],
    }];
    const { chargedMoveTypes } = parsePokemonData(raw).entries[0];
    expect(chargedMoveTypes).toContain('Grass');
    expect(chargedMoveTypes).toContain('Poison');
    expect(chargedMoveTypes).toHaveLength(2);
  });

  it('unions cinematicMoves and eliteCinematicMoves for chargedMoveTypes', () => {
    const raw = [{
      ...makeEntry('Venusaur', 'Grass', 'Poison'),
      quickMoves: [],
      eliteQuickMoves: [],
      cinematicMoves: { FRENZY_PLANT: makeMove('Grass') },
      eliteCinematicMoves: { PETAL_BLIZZARD: makeMove('Grass'), SLUDGE_BOMB: makeMove('Poison') },
    }];
    const { chargedMoveTypes } = parsePokemonData(raw).entries[0];
    expect(chargedMoveTypes).toContain('Grass');
    expect(chargedMoveTypes).toContain('Poison');
    expect(chargedMoveTypes.filter((t) => t === 'Grass')).toHaveLength(1);
    expect(chargedMoveTypes).toHaveLength(2);
  });

  it('move types are immutable', () => {
    const raw = [{ ...makeEntry('A', 'Fire'), quickMoves: { M: makeMove('Fire') }, eliteQuickMoves: [] }];
    const { entries } = parsePokemonData(raw);
    expect(() => { (entries[0].quickMoveTypes as string[]).push('Hack'); }).toThrow();
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
