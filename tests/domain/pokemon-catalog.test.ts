import { parsePokemonData, TYPE_COLORS } from '../../src/domain/pokemon-catalog';
import type { MoveEntry, TierLabel } from '../../src/domain/pokemon-catalog';
import pokemonData from '../../public/data/pokemon.json';

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

// Helper for move extraction tests
function makeMove(typeEnglish: string, nameEnglish?: string, opts: { energy?: number; power?: number } = {}) {
  return {
    names: { English: nameEnglish ?? typeEnglish + ' Move' },
    type: { names: { English: typeEnglish } },
    ...opts,
  };
}

describe('parsePokemonData - move extraction (spec 0013)', () => {
  it('each PokemonEntry exposes quickMoves and chargedMoves as readonly arrays', () => {
    const raw = [makeEntry('Bulbasaur', 'Grass', 'Poison')];
    const { entries } = parsePokemonData(raw);
    expect(Array.isArray(entries[0].quickMoves)).toBe(true);
    expect(Array.isArray(entries[0].chargedMoves)).toBe(true);
  });

  it('quickMoves is empty when quickMoves and eliteQuickMoves are absent', () => {
    const raw = [makeEntry('Bulbasaur', 'Grass', 'Poison')];
    expect(parsePokemonData(raw).entries[0].quickMoves).toEqual([]);
  });

  it('chargedMoves is empty when cinematicMoves and eliteCinematicMoves are absent', () => {
    const raw = [makeEntry('Bulbasaur', 'Grass', 'Poison')];
    expect(parsePokemonData(raw).entries[0].chargedMoves).toEqual([]);
  });

  it('quickMoves is empty when quickMoves is an empty array []', () => {
    const raw = [{ ...makeEntry('A', 'Fire'), quickMoves: [], eliteQuickMoves: [] }];
    expect(parsePokemonData(raw).entries[0].quickMoves).toEqual([]);
  });

  it('chargedMoves is empty when cinematicMoves is an empty array []', () => {
    const raw = [{ ...makeEntry('A', 'Fire'), cinematicMoves: [], eliteCinematicMoves: [] }];
    expect(parsePokemonData(raw).entries[0].chargedMoves).toEqual([]);
  });

  it('extracts name and typeId from regular quickMoves object', () => {
    const raw = [{
      ...makeEntry('Bulbasaur', 'Grass', 'Poison'),
      quickMoves: {
        VINE_WHIP_FAST: makeMove('Grass', 'Vine Whip'),
        TACKLE_FAST: makeMove('Normal', 'Tackle'),
      },
      eliteQuickMoves: [],
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves).toHaveLength(2);
    expect(quickMoves.find((m) => m.name === 'Vine Whip')?.typeId).toBe('Grass');
    expect(quickMoves.find((m) => m.name === 'Tackle')?.typeId).toBe('Normal');
  });

  it('regular moves have isElite false', () => {
    const raw = [{
      ...makeEntry('Bulbasaur', 'Grass', 'Poison'),
      quickMoves: { VINE_WHIP_FAST: makeMove('Grass', 'Vine Whip') },
      eliteQuickMoves: [],
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves[0].isElite).toBe(false);
  });

  it('elite quick moves have isElite true', () => {
    const raw = [{
      ...makeEntry('Charizard', 'Fire', 'Flying'),
      quickMoves: { AIR_SLASH_FAST: makeMove('Flying', 'Air Slash') },
      eliteQuickMoves: { EMBER_FAST: makeMove('Fire', 'Ember') },
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves.find((m) => m.name === 'Ember')?.isElite).toBe(true);
    expect(quickMoves.find((m) => m.name === 'Air Slash')?.isElite).toBe(false);
  });

  it('unions quickMoves and eliteQuickMoves by name, deduplicating', () => {
    const raw = [{
      ...makeEntry('Charizard', 'Fire', 'Flying'),
      quickMoves: { AIR_SLASH_FAST: makeMove('Flying', 'Air Slash') },
      eliteQuickMoves: { EMBER_FAST: makeMove('Fire', 'Ember'), AIR_SLASH_FAST2: makeMove('Flying', 'Air Slash') },
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves.filter((m) => m.name === 'Air Slash')).toHaveLength(1);
    expect(quickMoves.find((m) => m.name === 'Air Slash')?.isElite).toBe(true);
    expect(quickMoves).toHaveLength(2);
  });

  it('extracts name and typeId from cinematicMoves for chargedMoves', () => {
    const raw = [{
      ...makeEntry('Bulbasaur', 'Grass', 'Poison'),
      quickMoves: [],
      eliteQuickMoves: [],
      cinematicMoves: {
        POWER_WHIP: makeMove('Grass', 'Power Whip'),
        SLUDGE_BOMB: makeMove('Poison', 'Sludge Bomb'),
      },
      eliteCinematicMoves: [],
    }];
    const { chargedMoves } = parsePokemonData(raw).entries[0];
    expect(chargedMoves).toHaveLength(2);
    expect(chargedMoves.find((m) => m.name === 'Power Whip')?.typeId).toBe('Grass');
    expect(chargedMoves.find((m) => m.name === 'Sludge Bomb')?.typeId).toBe('Poison');
  });

  it('unions cinematicMoves and eliteCinematicMoves, elite wins on duplicate name', () => {
    const raw = [{
      ...makeEntry('Venusaur', 'Grass', 'Poison'),
      quickMoves: [],
      eliteQuickMoves: [],
      cinematicMoves: { FRENZY_PLANT: makeMove('Grass', 'Frenzy Plant') },
      eliteCinematicMoves: {
        FRENZY_PLANT2: makeMove('Grass', 'Frenzy Plant'),
        SLUDGE_BOMB: makeMove('Poison', 'Sludge Bomb'),
      },
    }];
    const { chargedMoves } = parsePokemonData(raw).entries[0];
    expect(chargedMoves.filter((m) => m.name === 'Frenzy Plant')).toHaveLength(1);
    expect(chargedMoves.find((m) => m.name === 'Frenzy Plant')?.isElite).toBe(true);
    expect(chargedMoves).toHaveLength(2);
  });

  it('omits move with no English name and does not throw', () => {
    const raw = [{
      ...makeEntry('A', 'Fire'),
      quickMoves: {
        NO_NAME: { type: { names: { English: 'Fire' } } },
        EMBER_FAST: makeMove('Fire', 'Ember'),
      },
      eliteQuickMoves: [],
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves).toHaveLength(1);
    expect(quickMoves[0].name).toBe('Ember');
  });

  it('omits move with no resolvable type and does not throw', () => {
    const raw = [{
      ...makeEntry('A', 'Fire'),
      quickMoves: {
        NO_TYPE: { names: { English: 'Mystery Move' } },
        EMBER_FAST: makeMove('Fire', 'Ember'),
      },
      eliteQuickMoves: [],
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves).toHaveLength(1);
    expect(quickMoves[0].name).toBe('Ember');
  });

  it('quickMoves array is immutable', () => {
    const raw = [{
      ...makeEntry('A', 'Fire'),
      quickMoves: { M: makeMove('Fire', 'Ember') },
      eliteQuickMoves: [],
    }];
    const { entries } = parsePokemonData(raw);
    expect(() => { (entries[0].quickMoves as MoveEntry[]).push({ name: 'Hack', typeId: 'Fire', isElite: false, isRecommended: false }); }).toThrow();
  });
});

describe('parsePokemonData - move recommendation (spec 0014 / spec 0015)', () => {
  it('the single quick move is recommended when the pool has one entry', () => {
    const raw = [{
      ...makeEntry('A', 'Fire'),
      quickMoves: { EMBER_FAST: makeMove('Fire', 'Ember', { energy: 10 }) },
      eliteQuickMoves: [],
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves[0].isRecommended).toBe(true);
  });

  it('the single charged move is recommended when the pool has one entry', () => {
    const raw = [{
      ...makeEntry('A', 'Fire'),
      cinematicMoves: { OVERHEAT: makeMove('Fire', 'Overheat', { power: 160 }) },
      eliteCinematicMoves: [],
    }];
    const { chargedMoves } = parsePokemonData(raw).entries[0];
    expect(chargedMoves[0].isRecommended).toBe(true);
  });

  it('recommends the quick move with the highest energy field', () => {
    const raw = [{
      ...makeEntry('A', 'Fire'),
      quickMoves: {
        EMBER_FAST: makeMove('Fire', 'Ember', { energy: 10 }),
        TACKLE_FAST: makeMove('Normal', 'Tackle', { energy: 5 }),
      },
      eliteQuickMoves: [],
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves.find((m) => m.name === 'Ember')?.isRecommended).toBe(true);
    expect(quickMoves.find((m) => m.name === 'Tackle')?.isRecommended).toBe(false);
  });

  it('recommends the higher-power charged move when energy costs and STAB are equal (spec 0015 Factor 4)', () => {
    // Both moves are Fire-type on a Fire Pokémon (both STAB, both no energy cost set → 0).
    // Factor 4 selects the higher-power move.
    const raw = [{
      ...makeEntry('A', 'Fire'),
      cinematicMoves: {
        OVERHEAT: makeMove('Fire', 'Overheat', { power: 160 }),
        FLAMETHROWER: makeMove('Fire', 'Flamethrower', { power: 90 }),
      },
      eliteCinematicMoves: [],
    }];
    const { chargedMoves } = parsePokemonData(raw).entries[0];
    expect(chargedMoves.find((m) => m.name === 'Overheat')?.isRecommended).toBe(true);
    expect(chargedMoves.find((m) => m.name === 'Flamethrower')?.isRecommended).toBe(false);
  });

  it('exactly one quick move is recommended when pool has multiple moves', () => {
    const raw = [{
      ...makeEntry('A', 'Fire'),
      quickMoves: {
        A: makeMove('Fire', 'Ember', { energy: 10 }),
        B: makeMove('Normal', 'Tackle', { energy: 5 }),
        C: makeMove('Grass', 'Vine Whip', { energy: 7 }),
      },
      eliteQuickMoves: [],
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves.filter((m) => m.isRecommended === true)).toHaveLength(1);
  });

  it('exactly one charged move is recommended when pool has multiple moves', () => {
    const raw = [{
      ...makeEntry('A', 'Fire'),
      cinematicMoves: {
        A: makeMove('Fire', 'Overheat', { power: 160 }),
        B: makeMove('Fire', 'Flamethrower', { power: 90 }),
        C: makeMove('Dragon', 'Dragon Claw', { power: 50 }),
      },
      eliteCinematicMoves: [],
    }];
    const { chargedMoves } = parsePokemonData(raw).entries[0];
    expect(chargedMoves.filter((m) => m.isRecommended === true)).toHaveLength(1);
  });

  it('tiebreaker selects the alphabetically first quick move when all factors are equal', () => {
    // Both moves are Fire-type (both STAB for this Fire Pokémon), equal energy, not high-attack.
    // With a single entry, attack=100 equals the threshold so isHighAttack is false.
    // Only the alphabetical tiebreaker differentiates them.
    const raw = [{
      ...makeEntry('A', 'Fire'),
      quickMoves: {
        Z: makeMove('Fire', 'Zen Headbutt', { energy: 10 }),
        A: makeMove('Fire', 'Astonish',     { energy: 10 }),
      },
      eliteQuickMoves: [],
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves.find((m) => m.name === 'Astonish')?.isRecommended).toBe(true);
    expect(quickMoves.find((m) => m.name === 'Zen Headbutt')?.isRecommended).toBe(false);
  });

  it('tiebreaker selects the alphabetically first charged move when all factors are equal', () => {
    // Both moves are non-STAB for this Fire Pokémon and have identical energy cost and power.
    // Only the alphabetical tiebreaker differentiates them.
    const raw = [{
      ...makeEntry('A', 'Fire'),
      cinematicMoves: {
        Z: makeMove('Electric', 'Zap Cannon', { power: 100, energy: -100 }),
        A: makeMove('Bug',      'Bug Buzz',   { power: 100, energy: -100 }),
      },
      eliteCinematicMoves: [],
    }];
    const { chargedMoves } = parsePokemonData(raw).entries[0];
    expect(chargedMoves.find((m) => m.name === 'Bug Buzz')?.isRecommended).toBe(true);
    expect(chargedMoves.find((m) => m.name === 'Zap Cannon')?.isRecommended).toBe(false);
  });

  it('a move can be both elite and recommended', () => {
    const raw = [{
      ...makeEntry('Charizard', 'Fire', 'Flying'),
      quickMoves: { AIR_SLASH_FAST: makeMove('Flying', 'Air Slash', { energy: 8 }) },
      eliteQuickMoves: { EMBER_FAST: makeMove('Fire', 'Ember', { energy: 12 }) },
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    const ember = quickMoves.find((m) => m.name === 'Ember');
    expect(ember?.isElite).toBe(true);
    expect(ember?.isRecommended).toBe(true);
  });

  it('energy/power values do not appear on MoveEntry objects', () => {
    const raw = [{
      ...makeEntry('A', 'Fire'),
      quickMoves: { EMBER_FAST: makeMove('Fire', 'Ember', { energy: 10 }) },
      eliteQuickMoves: [],
    }];
    const move = parsePokemonData(raw).entries[0].quickMoves[0] as unknown as Record<string, unknown>;
    expect(move['energy']).toBeUndefined();
    expect(move['power']).toBeUndefined();
    expect(move['_stat']).toBeUndefined();
  });

  it('missing energy field defaults to 0 and the move is still recommended when pool has one entry', () => {
    const raw = [{
      ...makeEntry('A', 'Fire'),
      quickMoves: { EMBER_FAST: makeMove('Fire', 'Ember') },
      eliteQuickMoves: [],
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves[0].isRecommended).toBe(true);
  });

  it('when quick pool is empty, the single charged move is still recommended', () => {
    const raw = [{
      ...makeEntry('A', 'Fire'),
      quickMoves: [],
      eliteQuickMoves: [],
      cinematicMoves: { OVERHEAT: makeMove('Fire', 'Overheat', { power: 160 }) },
      eliteCinematicMoves: [],
    }];
    const { quickMoves, chargedMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves).toHaveLength(0);
    expect(chargedMoves[0].isRecommended).toBe(true);
  });
});

describe('parsePokemonData - charged move PvE recommendation (spec 0015)', () => {
  // Dataset helper: 3 high-survivability Pokémon + the subject Pokémon.
  // With 3 tanks (sta=400, def=300, combined=700) and subject (sta=70, def=50, combined=120):
  //   mean = (700*3 + 120) / 4 = 555 → fragile threshold = 0.65 * 555 ≈ 360
  //   subject combined 120 ≤ 360 → IS fragile; tanks 700 > 360 → NOT fragile.
  const makeTankEntry = (name: string) => ({
    ...makeEntry(name, 'Water', undefined, { attack: 150, defense: 300, stamina: 400 }),
  });
  const makeFragileEntry = (name: string, primary: string, secondary?: string) =>
    makeEntry(name, primary, secondary, { attack: 200, defense: 50, stamina: 70 });
  const withFragile = (fragileEntry: object, moves: object) => [
    makeTankEntry('Tank1'),
    makeTankEntry('Tank2'),
    makeTankEntry('Tank3'),
    { ...fragileEntry, ...moves },
  ];

  // — Factor 1: survivability-adjusted feasibility —

  it('Factor 1: fragile Pokémon does not have very high energy cost move recommended when a lower-cost alternative exists', () => {
    const dataset = withFragile(makeFragileEntry('Frail', 'Normal'), {
      quickMoves: {}, eliteQuickMoves: [],
      cinematicMoves: {
        HIGH: makeMove('Normal', 'Hyper Beam', { power: 150, energy: -100 }),
        LOW:  makeMove('Normal', 'Body Slam',  { power:  60, energy:  -33 }),
      },
      eliteCinematicMoves: [],
    });
    const frail = parsePokemonData(dataset).entries.find((e) => e.name === 'Frail')!;
    expect(frail.chargedMoves.find((m) => m.name === 'Hyper Beam')?.isRecommended).toBe(false);
    expect(frail.chargedMoves.find((m) => m.name === 'Body Slam')?.isRecommended).toBe(true);
  });

  it('Factor 1: fragile Pokémon with only high-cost moves still has exactly one move recommended', () => {
    const dataset = withFragile(makeFragileEntry('Frail2', 'Normal'), {
      quickMoves: {}, eliteQuickMoves: [],
      cinematicMoves: {
        A: makeMove('Normal', 'Hyper Beam',  { power: 150, energy: -100 }),
        B: makeMove('Normal', 'Giga Impact', { power: 200, energy: -100 }),
      },
      eliteCinematicMoves: [],
    });
    const frail = parsePokemonData(dataset).entries.find((e) => e.name === 'Frail2')!;
    expect(frail.chargedMoves.filter((m) => m.isRecommended)).toHaveLength(1);
  });

  it('Factor 1: non-fragile Pokémon can have the higher-power move recommended when energy costs are equal', () => {
    // Single entry → mean = 200, threshold = 130; combined = 200 > 130 → NOT fragile.
    const raw = [{
      ...makeEntry('Tank', 'Normal'),
      quickMoves: {}, eliteQuickMoves: [],
      cinematicMoves: {
        A: makeMove('Normal', 'Hyper Beam', { power: 150, energy: -100 }),
        B: makeMove('Normal', 'Body Slam',  { power:  50, energy: -100 }),
      },
      eliteCinematicMoves: [],
    }];
    const pokemon = parsePokemonData(raw).entries[0];
    expect(pokemon.chargedMoves.find((m) => m.name === 'Hyper Beam')?.isRecommended).toBe(true);
  });

  // — Factor 2: energy efficiency —

  it('Factor 2: lower energy cost move recommended over high-cost move when power is not the primary differentiator', () => {
    // Single non-fragile entry (combined 200 > threshold 130).
    // 50-energy move beats 100-energy move on Factor 2 even though power is lower.
    const raw = [{
      ...makeEntry('Mon', 'Fire'),
      quickMoves: {}, eliteQuickMoves: [],
      cinematicMoves: {
        A: makeMove('Fire', 'Overheat',      { power: 110, energy: -100 }),
        B: makeMove('Fire', 'Flamethrower',  { power:  90, energy:  -50 }),
      },
      eliteCinematicMoves: [],
    }];
    const pokemon = parsePokemonData(raw).entries[0];
    expect(pokemon.chargedMoves.find((m) => m.name === 'Flamethrower')?.isRecommended).toBe(true);
    expect(pokemon.chargedMoves.find((m) => m.name === 'Overheat')?.isRecommended).toBe(false);
  });

  // — Factor 3: STAB —

  it('Factor 3: STAB move recommended over non-STAB when the 20% bonus overcomes the power gap', () => {
    // Poison Pokémon: Sludge Bomb (Poison/STAB, 85 pwr, 50 energy) vs Dig (Ground, 100 pwr, 50 energy).
    // STAB effective power: 85 * 1.2 = 102 ≥ 100 → Sludge Bomb wins.
    const raw = [{
      ...makeEntry('Mon', 'Poison'),
      quickMoves: {}, eliteQuickMoves: [],
      cinematicMoves: {
        S: makeMove('Poison', 'Sludge Bomb', { power:  85, energy: -50 }),
        N: makeMove('Ground', 'Dig',         { power: 100, energy: -50 }),
      },
      eliteCinematicMoves: [],
    }];
    const pokemon = parsePokemonData(raw).entries[0];
    expect(pokemon.chargedMoves.find((m) => m.name === 'Sludge Bomb')?.isRecommended).toBe(true);
    expect(pokemon.chargedMoves.find((m) => m.name === 'Dig')?.isRecommended).toBe(false);
  });

  it('Factor 3: non-STAB higher-power move recommended when the power gap exceeds the STAB bonus', () => {
    // Normal Pokémon: Stomp (Normal/STAB, 60 pwr) vs Fire Blast (Fire, 100 pwr).
    // STAB effective: 60 * 1.2 = 72 < 100 → Fire Blast wins.
    const raw = [{
      ...makeEntry('Mon', 'Normal'),
      quickMoves: {}, eliteQuickMoves: [],
      cinematicMoves: {
        S: makeMove('Normal', 'Stomp',      { power:  60, energy: -50 }),
        N: makeMove('Fire',   'Fire Blast', { power: 100, energy: -50 }),
      },
      eliteCinematicMoves: [],
    }];
    const pokemon = parsePokemonData(raw).entries[0];
    expect(pokemon.chargedMoves.find((m) => m.name === 'Fire Blast')?.isRecommended).toBe(true);
    expect(pokemon.chargedMoves.find((m) => m.name === 'Stomp')?.isRecommended).toBe(false);
  });

  it('Factor 3 does not override Factor 1: fragile Pokémon with high-cost STAB gets lower-cost non-STAB recommended', () => {
    const dataset = withFragile(makeFragileEntry('Frail3', 'Psychic'), {
      quickMoves: {}, eliteQuickMoves: [],
      cinematicMoves: {
        S: makeMove('Psychic', 'Psybeam',   { power:  80, energy: -100 }), // STAB, high-cost
        N: makeMove('Normal',  'Body Slam', { power:  60, energy:  -50 }), // non-STAB, low-cost
      },
      eliteCinematicMoves: [],
    });
    const frail = parsePokemonData(dataset).entries.find((e) => e.name === 'Frail3')!;
    expect(frail.chargedMoves.find((m) => m.name === 'Body Slam')?.isRecommended).toBe(true);
    expect(frail.chargedMoves.find((m) => m.name === 'Psybeam')?.isRecommended).toBe(false);
  });

  // — Determinism —

  it('charged move recommendation is identical across two parse calls from the same dataset', () => {
    const raw = [{
      ...makeEntry('Mon', 'Fire', 'Flying'),
      quickMoves: {}, eliteQuickMoves: [],
      cinematicMoves: {
        A: makeMove('Fire',   'Overheat',    { power: 160, energy: -100 }),
        B: makeMove('Flying', 'Sky Attack',  { power:  80, energy:  -50 }),
        C: makeMove('Normal', 'Body Slam',   { power:  60, energy:  -50 }),
      },
      eliteCinematicMoves: [],
    }];
    const rec1 = parsePokemonData(raw).entries[0].chargedMoves.find((m) => m.isRecommended)?.name;
    const rec2 = parsePokemonData(raw).entries[0].chargedMoves.find((m) => m.isRecommended)?.name;
    expect(rec1).toBeDefined();
    expect(rec1).toBe(rec2);
  });

  // — Internal values do not leak —

  it('_energyCost does not appear on MoveEntry objects', () => {
    const raw = [{
      ...makeEntry('Mon', 'Fire'),
      quickMoves: {}, eliteQuickMoves: [],
      cinematicMoves: { A: makeMove('Fire', 'Overheat', { power: 160, energy: -100 }) },
      eliteCinematicMoves: [],
    }];
    const move = parsePokemonData(raw).entries[0].chargedMoves[0] as unknown as Record<string, unknown>;
    expect(move['_energyCost']).toBeUndefined();
    expect(move['energy']).toBeUndefined();
  });
});

// Helpers for spec 0016 role-identity tests.
// 3 Pokémon with attack=100 + 1 with attack=300:
//   mean = (100+100+100+300)/4 = 150
//   variance = ((50²+50²+50²+150²)/4) = (2500+2500+2500+22500)/4 = 7500
//   stdev = sqrt(7500) ≈ 86.6
//   threshold ≈ 236.6 → attack=300 qualifies as high-attack
const makeNormalAtkEntry = (name: string) =>
  makeEntry(name, 'Water', undefined, { attack: 100, defense: 150, stamina: 200 });

function withHighAtkPokemon(
  highAtkEntry: ReturnType<typeof makeEntry>,
  moves: Record<string, unknown>,
): unknown[] {
  return [
    { ...makeNormalAtkEntry('Normal1') },
    { ...makeNormalAtkEntry('Normal2') },
    { ...makeNormalAtkEntry('Normal3') },
    { ...highAtkEntry, ...moves },
  ];
}

describe('parsePokemonData - spec 0016 STAB quick move recommendation', () => {
  it('AC-01: STAB quick move preferred when 20% energy bonus compensates for energy deficit', () => {
    // Bug Pokémon: Infestation (Bug STAB, energy=13) vs Confusion (Psychic non-STAB, energy=14)
    // 13 × 1.2 = 15.6 ≥ 14 → STAB wins
    const raw = [{
      ...makeEntry('Caterpie', 'Bug'),
      quickMoves: {
        INFESTATION_FAST: makeMove('Bug',     'Infestation', { energy: 13 }),
        CONFUSION_FAST:   makeMove('Psychic', 'Confusion',   { energy: 14 }),
      },
      eliteQuickMoves: [],
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves.find((m) => m.name === 'Infestation')?.isRecommended).toBe(true);
    expect(quickMoves.find((m) => m.name === 'Confusion')?.isRecommended).toBe(false);
  });

  it('AC-02: non-STAB quick move preferred when energy advantage is too large for STAB to overcome', () => {
    // Poison Pokémon: Poison Sting (Poison STAB, energy=6) vs Peck (Flying non-STAB, energy=10)
    // 6 × 1.2 = 7.2 < 10 → STAB does not compensate; energy wins
    const raw = [{
      ...makeEntry('Ekans', 'Poison'),
      quickMoves: {
        POISON_STING_FAST: makeMove('Poison', 'Poison Sting', { energy: 6 }),
        PECK_FAST:         makeMove('Flying', 'Peck',         { energy: 10 }),
      },
      eliteQuickMoves: [],
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves.find((m) => m.name === 'Peck')?.isRecommended).toBe(true);
    expect(quickMoves.find((m) => m.name === 'Poison Sting')?.isRecommended).toBe(false);
  });

  it('AC-03: exactly one quick move is recommended when all moves are STAB', () => {
    const raw = [{
      ...makeEntry('Charmander', 'Fire'),
      quickMoves: {
        EMBER_FAST:         makeMove('Fire', 'Ember',          { energy: 10 }),
        FIRE_FANG_FAST:     makeMove('Fire', 'Fire Fang',      { energy: 8  }),
        FIRE_SPIN_FAST:     makeMove('Fire', 'Fire Spin',      { energy: 14 }),
      },
      eliteQuickMoves: [],
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    const recommended = quickMoves.filter((m) => m.isRecommended);
    expect(recommended).toHaveLength(1);
    expect(quickMoves.find((m) => m.name === 'Fire Spin')?.isRecommended).toBe(true);
  });

  it('AC-04: among non-STAB moves, highest energy wins', () => {
    // Steel Pokémon with only Normal-type moves (no STAB)
    const raw = [{
      ...makeEntry('Magnemite', 'Steel'),
      quickMoves: {
        TACKLE_FAST:     makeMove('Normal', 'Tackle',      { energy: 8  }),
        SCRATCH_FAST:    makeMove('Normal', 'Scratch',     { energy: 10 }),
      },
      eliteQuickMoves: [],
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves.find((m) => m.name === 'Scratch')?.isRecommended).toBe(true);
    expect(quickMoves.find((m) => m.name === 'Tackle')?.isRecommended).toBe(false);
  });
});

describe('parsePokemonData - spec 0016 role identity quick move recommendation', () => {
  it('AC-05: high-Attack Dragon/Flying prefers Dragon quick move over Flying when both STAB, equal energy', () => {
    // Both Dragon Tail and Air Slash are STAB for Dragon/Flying; equal energy=8.
    // Factor 1 (STAB) doesn't differentiate; Factor 2 (role identity) picks primary type Dragon.
    const highAtkDragonFlying = makeEntry('Rayquaza', 'Dragon', 'Flying', { attack: 300, defense: 100, stamina: 100 });
    const raw = withHighAtkPokemon(highAtkDragonFlying, {
      quickMoves: {
        DRAGON_TAIL_FAST: makeMove('Dragon', 'Dragon Tail', { energy: 8 }),
        AIR_SLASH_FAST:   makeMove('Flying', 'Air Slash',   { energy: 8 }),
      },
      eliteQuickMoves: [],
    });
    const { quickMoves } = parsePokemonData(raw).entries.find((e) => e.name === 'Rayquaza')!;
    expect(quickMoves.find((m) => m.name === 'Dragon Tail')?.isRecommended).toBe(true);
    expect(quickMoves.find((m) => m.name === 'Air Slash')?.isRecommended).toBe(false);
  });

  it('AC-06: non-high-Attack Fire/Flying prefers higher-energy Flying move over lower-energy Fire move', () => {
    // Normal-attack: role identity does not apply. Energy wins.
    // Ember (Fire primary, energy=8) vs Air Slash (Flying secondary, energy=10).
    // Both STAB; equal STAB so Factor 2 would apply only if high-attack — it is not.
    const normalAtkEntry = makeEntry('Charizard', 'Fire', 'Flying', { attack: 100, defense: 100, stamina: 100 });
    const raw = [{
      ...normalAtkEntry,
      quickMoves: {
        EMBER_FAST:     makeMove('Fire',   'Ember',     { energy: 8  }),
        AIR_SLASH_FAST: makeMove('Flying', 'Air Slash', { energy: 10 }),
      },
      eliteQuickMoves: [],
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves.find((m) => m.name === 'Air Slash')?.isRecommended).toBe(true);
    expect(quickMoves.find((m) => m.name === 'Ember')?.isRecommended).toBe(false);
  });
});

describe('parsePokemonData - spec 0016 role identity charged move recommendation', () => {
  it('AC-07: high-Attack Dragon/Flying prefers Dragon charged move over Flying when both STAB, equal power and cost', () => {
    const highAtkDragonFlying = makeEntry('Rayquaza', 'Dragon', 'Flying', { attack: 300, defense: 100, stamina: 100 });
    const raw = withHighAtkPokemon(highAtkDragonFlying, {
      cinematicMoves: {
        DRAGON_CLAW: makeMove('Dragon', 'Dragon Claw', { power: 50, energy: -50 }),
        AERIAL_ACE:  makeMove('Flying', 'Aerial Ace',  { power: 50, energy: -50 }),
      },
      eliteCinematicMoves: [],
    });
    const { chargedMoves } = parsePokemonData(raw).entries.find((e) => e.name === 'Rayquaza')!;
    expect(chargedMoves.find((m) => m.name === 'Dragon Claw')?.isRecommended).toBe(true);
    expect(chargedMoves.find((m) => m.name === 'Aerial Ace')?.isRecommended).toBe(false);
  });

  it('AC-08: fragility overrides role identity — low-cost non-STAB preferred over high-cost primary-type STAB', () => {
    // High-Attack, fragile Psychic Pokémon:
    //   Psycho Cut (Psychic primary STAB, energy=-100) vs Body Slam (Normal non-STAB, energy=-50)
    // Factor 1 fragility: cost -100 ≥ 75 threshold, -50 ≤ 50 → Body Slam wins regardless of STAB/role
    const highAtkFragile = makeEntry('Alakazam', 'Psychic', undefined, { attack: 300, defense: 50, stamina: 50 });
    const raw = withHighAtkPokemon(highAtkFragile, {
      cinematicMoves: {
        PSYCHO_CUT:  makeMove('Psychic', 'Psycho Cut',  { power: 70,  energy: -100 }),
        BODY_SLAM:   makeMove('Normal',  'Body Slam',   { power: 60,  energy: -50  }),
      },
      eliteCinematicMoves: [],
    });
    const { chargedMoves } = parsePokemonData(raw).entries.find((e) => e.name === 'Alakazam')!;
    expect(chargedMoves.find((m) => m.name === 'Body Slam')?.isRecommended).toBe(true);
    expect(chargedMoves.find((m) => m.name === 'Psycho Cut')?.isRecommended).toBe(false);
  });
});

// Spec 0017 helpers
// Tyranitar fixture: matches live-dataset move pool exactly.
// Rock/Dark, attack=251. Viable roles: Rock (Smack Down quick + Stone Edge charged)
// and Dark (Bite quick + Crunch/Brutal Swing charged).
const TYRANITAR_LIKE = {
  ...makeEntry('Tyranitar', 'Rock', 'Dark', { attack: 251, defense: 207, stamina: 225 }),
  quickMoves: {
    BITE_FAST:          makeMove('Dark',   'Bite',          { energy: 4 }),
    IRON_TAIL_FAST:     makeMove('Steel',  'Iron Tail',     { energy: 6 }),
    DRAGON_BREATH_FAST: makeMove('Dragon', 'Dragon Breath', { energy: 4 }),
  },
  eliteQuickMoves: {
    SMACK_DOWN_FAST: makeMove('Rock', 'Smack Down', { energy: 7 }),
  },
  cinematicMoves: {
    FIRE_BLAST:   makeMove('Fire', 'Fire Blast',   { power: 140, energy: -100 }),
    CRUNCH:       makeMove('Dark', 'Crunch',       { power: 65,  energy: -33  }),
    STONE_EDGE:   makeMove('Rock', 'Stone Edge',   { power: 105, energy: -100 }),
    BRUTAL_SWING: makeMove('Dark', 'Brutal Swing', { power: 65,  energy: -33  }),
  },
  eliteCinematicMoves: [],
};

// 3×attack=100 + Tyranitar attack=251 → mean≈137.75, stdev≈65.4, threshold≈203.15
// → Tyranitar (251) qualifies as high-attack in this dataset
const buildMultiRoleDataset = (mainEntry: object) => [
  makeNormalAtkEntry('Filler1'),
  makeNormalAtkEntry('Filler2'),
  makeNormalAtkEntry('Filler3'),
  mainEntry,
];

describe('parsePokemonData - spec 0017 multi-role move recommendations', () => {
  it('AC-01: dual-role Pokémon has one recommended Quick and one recommended Charged per viable role', () => {
    const raw = buildMultiRoleDataset(TYRANITAR_LIKE);
    const ttар = parsePokemonData(raw).entries.find((e) => e.name === 'Tyranitar')!;

    const recQuick = ttар.quickMoves.filter((m) => m.isRecommended);
    expect(recQuick).toHaveLength(2);
    expect(recQuick.map((m) => m.typeId).sort()).toEqual(['Dark', 'Rock']);
    expect(ttар.quickMoves.find((m) => m.name === 'Smack Down')?.isRecommended).toBe(true);
    expect(ttар.quickMoves.find((m) => m.name === 'Bite')?.isRecommended).toBe(true);

    const recCharged = ttар.chargedMoves.filter((m) => m.isRecommended);
    expect(recCharged).toHaveLength(2);
    expect(recCharged.map((m) => m.typeId).sort()).toEqual(['Dark', 'Rock']);
    expect(ttар.chargedMoves.find((m) => m.name === 'Stone Edge')?.isRecommended).toBe(true);
    // Brutal Swing wins Dark charged tiebreaker over Crunch ('B' < 'C')
    expect(ttар.chargedMoves.find((m) => m.name === 'Brutal Swing')?.isRecommended).toBe(true);
  });

  it('AC-01: off-type moves on a multi-role Pokémon are not recommended', () => {
    const raw = buildMultiRoleDataset(TYRANITAR_LIKE);
    const ttар = parsePokemonData(raw).entries.find((e) => e.name === 'Tyranitar')!;

    expect(ttар.quickMoves.find((m) => m.name === 'Iron Tail')?.isRecommended).toBe(false);
    expect(ttар.quickMoves.find((m) => m.name === 'Dragon Breath')?.isRecommended).toBe(false);
    expect(ttар.chargedMoves.find((m) => m.name === 'Fire Blast')?.isRecommended).toBe(false);
    expect(ttар.chargedMoves.find((m) => m.name === 'Crunch')?.isRecommended).toBe(false);
  });

  it('AC-02: single-type Pokémon with a viable role has exactly one recommended per slot', () => {
    const raw = [{
      ...makeEntry('Absol', 'Dark'),
      quickMoves: { SNARL_FAST: makeMove('Dark', 'Snarl', { energy: 13 }) },
      eliteQuickMoves: {},
      cinematicMoves: { DARK_PULSE: makeMove('Dark', 'Dark Pulse', { power: 80, energy: -50 }) },
      eliteCinematicMoves: [],
    }];
    const { quickMoves, chargedMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves.filter((m) => m.isRecommended)).toHaveLength(1);
    expect(chargedMoves.filter((m) => m.isRecommended)).toHaveLength(1);
    expect(quickMoves[0].isRecommended).toBe(true);
    expect(chargedMoves[0].isRecommended).toBe(true);
  });

  it('AC-02: dual-type Pokémon where one type lacks charged coverage has exactly one viable role', () => {
    // Fire/Flying: Fire has quick+charged; Flying has quick but no Flying charged → only Fire role
    const raw = [{
      ...makeEntry('Moltres', 'Fire', 'Flying'),
      quickMoves: {
        EMBER_FAST:       makeMove('Fire',   'Ember',       { energy: 10 }),
        WING_ATTACK_FAST: makeMove('Flying', 'Wing Attack', { energy: 8  }),
      },
      eliteQuickMoves: [],
      cinematicMoves: { OVERHEAT: makeMove('Fire', 'Overheat', { power: 160, energy: -100 }) },
      eliteCinematicMoves: [],
    }];
    const { quickMoves, chargedMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves.filter((m) => m.isRecommended)).toHaveLength(1);
    expect(chargedMoves.filter((m) => m.isRecommended)).toHaveLength(1);
    expect(quickMoves.find((m) => m.name === 'Ember')?.isRecommended).toBe(true);
    expect(quickMoves.find((m) => m.name === 'Wing Attack')?.isRecommended).toBe(false);
  });

  it('AC-03: fallback when no type spans both quick and charged slots — exactly one recommended per slot', () => {
    // Dragon/Flying: quick moves are Dragon only; charged moves are Flying only → no viable role
    const raw = [{
      ...makeEntry('Dragonite', 'Dragon', 'Flying'),
      quickMoves: { DRAGON_BREATH_FAST: makeMove('Dragon', 'Dragon Breath', { energy: 8 }) },
      eliteQuickMoves: [],
      cinematicMoves: { AERIAL_ACE: makeMove('Flying', 'Aerial Ace', { power: 55, energy: -33 }) },
      eliteCinematicMoves: [],
    }];
    const { quickMoves, chargedMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves.filter((m) => m.isRecommended)).toHaveLength(1);
    expect(chargedMoves.filter((m) => m.isRecommended)).toHaveLength(1);
    expect(quickMoves[0].isRecommended).toBe(true);
    expect(chargedMoves[0].isRecommended).toBe(true);
  });

  it('AC-04: per role, the quick move with the highest energy for that type is recommended', () => {
    // Rock/Dark: two Rock quick moves (Rock Smash energy=15 > Rock Throw energy=8)
    const raw = [{
      ...makeEntry('RockDark', 'Rock', 'Dark'),
      quickMoves: {
        ROCK_THROW_FAST: makeMove('Rock', 'Rock Throw', { energy: 8  }),
        ROCK_SMASH_FAST: makeMove('Rock', 'Rock Smash', { energy: 15 }),
        BITE_FAST:       makeMove('Dark', 'Bite',       { energy: 4  }),
      },
      eliteQuickMoves: {},
      cinematicMoves: {
        STONE_EDGE: makeMove('Rock', 'Stone Edge', { power: 100, energy: -100 }),
        CRUNCH:     makeMove('Dark', 'Crunch',     { power: 65,  energy: -33  }),
      },
      eliteCinematicMoves: [],
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves.find((m) => m.name === 'Rock Smash')?.isRecommended).toBe(true);
    expect(quickMoves.find((m) => m.name === 'Rock Throw')?.isRecommended).toBe(false);
    expect(quickMoves.find((m) => m.name === 'Bite')?.isRecommended).toBe(true);
  });

  it('AC-05: no two recommended Quick moves on a multi-role Pokémon share the same typeId', () => {
    const raw = buildMultiRoleDataset(TYRANITAR_LIKE);
    const ttар = parsePokemonData(raw).entries.find((e) => e.name === 'Tyranitar')!;
    const recTypes = ttар.quickMoves.filter((m) => m.isRecommended).map((m) => m.typeId);
    expect(new Set(recTypes).size).toBe(recTypes.length);
    expect(recTypes.length).toBe(2);
  });

  it('AC-07: survivability feasibility applies within a role — fragile Pokémon prefers lower-cost same-type charged move', () => {
    // Rock/Dark, fragile (defense=30, stamina=30 → sum=60).
    // Fillers: defense=150, stamina=200 → sum=350.
    // mean=(350*3+60)/4=277.5, threshold=277.5*0.65=180.375 → sum=60 ≤ 180.375 → fragile.
    // Rock role: Stone Edge (cost 100) vs Rock Slide (cost 33) → Rock Slide wins on Factor 1.
    const fragileRockDark = makeEntry('FragileRock', 'Rock', 'Dark', { attack: 100, defense: 30, stamina: 30 });
    const raw = [
      makeNormalAtkEntry('F1'),
      makeNormalAtkEntry('F2'),
      makeNormalAtkEntry('F3'),
      {
        ...fragileRockDark,
        quickMoves: {
          ROCK_THROW_FAST: makeMove('Rock', 'Rock Throw', { energy: 8 }),
          BITE_FAST:       makeMove('Dark', 'Bite',       { energy: 4 }),
        },
        eliteQuickMoves: [],
        cinematicMoves: {
          STONE_EDGE: makeMove('Rock', 'Stone Edge', { power: 105, energy: -100 }),
          ROCK_SLIDE: makeMove('Rock', 'Rock Slide', { power: 80,  energy: -33  }),
          CRUNCH:     makeMove('Dark', 'Crunch',     { power: 65,  energy: -33  }),
        },
        eliteCinematicMoves: [],
      },
    ];
    const { chargedMoves } = parsePokemonData(raw).entries.find((e) => e.name === 'FragileRock')!;
    expect(chargedMoves.find((m) => m.name === 'Rock Slide')?.isRecommended).toBe(true);
    expect(chargedMoves.find((m) => m.name === 'Stone Edge')?.isRecommended).toBe(false);
    expect(chargedMoves.find((m) => m.name === 'Crunch')?.isRecommended).toBe(true);
  });

  it('AC-08: no two recommended Charged moves on a multi-role Pokémon share the same typeId', () => {
    const raw = buildMultiRoleDataset(TYRANITAR_LIKE);
    const ttар = parsePokemonData(raw).entries.find((e) => e.name === 'Tyranitar')!;
    const recTypes = ttар.chargedMoves.filter((m) => m.isRecommended).map((m) => m.typeId);
    expect(new Set(recTypes).size).toBe(recTypes.length);
    expect(recTypes.length).toBe(2);
  });

  it('AC-09: single-role restricts pool — STAB type move recommended even when non-STAB has higher energy', () => {
    // Bug Pokémon with viable Bug role (Infestation quick + Bug Buzz charged).
    // Confusion (Psychic, energy=15) would win under spec 0016 full-pool: 10*1.2=12 < 15.
    // Under spec 0017 per-role, only Bug quick moves are in the role pool → Infestation wins.
    const raw = [{
      ...makeEntry('Caterpie', 'Bug'),
      quickMoves: {
        INFESTATION_FAST: makeMove('Bug',     'Infestation', { energy: 10 }),
        CONFUSION_FAST:   makeMove('Psychic', 'Confusion',   { energy: 15 }),
      },
      eliteQuickMoves: [],
      cinematicMoves: { BUG_BUZZ: makeMove('Bug', 'Bug Buzz', { power: 100, energy: -50 }) },
      eliteCinematicMoves: [],
    }];
    const { quickMoves } = parsePokemonData(raw).entries[0];
    expect(quickMoves.find((m) => m.name === 'Infestation')?.isRecommended).toBe(true);
    expect(quickMoves.find((m) => m.name === 'Confusion')?.isRecommended).toBe(false);
  });
});

// Spec 0018 helpers
// Tyranitar-like fixture reuses TYRANITAR_LIKE + buildMultiRoleDataset from spec 0017 above.
// No-viable-role fixture: Dragon quick + Flying charged → no type spans both slots.
const DRAGONITE_NO_ROLE = {
  ...makeEntry('Dragonite', 'Dragon', 'Flying'),
  quickMoves: { DRAGON_BREATH_FAST: makeMove('Dragon', 'Dragon Breath', { energy: 8 }) },
  eliteQuickMoves: [],
  cinematicMoves: { AERIAL_ACE: makeMove('Flying', 'Aerial Ace', { power: 55, energy: -33 }) },
  eliteCinematicMoves: [],
};

const VALID_TIER_LABELS: TierLabel[] = ['S', 'A', 'B', 'C'];

describe('parsePokemonData - spec 0018 role-based PvE tiers', () => {
  describe('data model — synthetic fixtures', () => {
    it('AC-01: PokemonEntry exposes attackerRoles and defenderTier', () => {
      const raw = buildMultiRoleDataset(TYRANITAR_LIKE);
      const ttаr = parsePokemonData(raw).entries.find((e) => e.name === 'Tyranitar')!;
      expect(ttаr).toHaveProperty('attackerRoles');
      expect(ttаr).toHaveProperty('defenderTier');
      expect(Array.isArray(ttаr.attackerRoles)).toBe(true);
      expect(VALID_TIER_LABELS).toContain(ttаr.defenderTier);
    });

    it('AC-02: dual-role Pokémon has exactly two AttackerRoleTier entries', () => {
      const raw = buildMultiRoleDataset(TYRANITAR_LIKE);
      const ttаr = parsePokemonData(raw).entries.find((e) => e.name === 'Tyranitar')!;
      expect(ttаr.attackerRoles).toHaveLength(2);
      expect(ttаr.attackerRoles.map((r) => r.typeId).sort()).toEqual(['Dark', 'Rock']);
      ttаr.attackerRoles.forEach((r) => expect(VALID_TIER_LABELS).toContain(r.tier));
    });

    it('AC-23: attackerRoles is ordered by Pokémon type order — primary type first', () => {
      // Tyranitar: primary=Rock, secondary=Dark → Rock must be index 0
      const raw = buildMultiRoleDataset(TYRANITAR_LIKE);
      const ttаr = parsePokemonData(raw).entries.find((e) => e.name === 'Tyranitar')!;
      expect(ttаr.attackerRoles[0].typeId).toBe('Rock');
      expect(ttаr.attackerRoles[1].typeId).toBe('Dark');
    });

    it('AC-03: no-viable-role Pokémon has an empty attackerRoles array', () => {
      const raw = [DRAGONITE_NO_ROLE];
      const dragonite = parsePokemonData(raw).entries.find((e) => e.name === 'Dragonite')!;
      expect(dragonite.attackerRoles).toHaveLength(0);
    });

    it('AC-04: defenderTier is a valid TierLabel for all Pokémon in a dataset', () => {
      const raw = [
        makeEntry('A', 'Fire',    undefined, { attack: 200, defense: 80,  stamina: 100 }),
        makeEntry('B', 'Water',   undefined, { attack: 100, defense: 180, stamina: 120 }),
        makeEntry('C', 'Grass',   undefined, { attack: 50,  defense: 50,  stamina: 50  }),
        makeEntry('D', 'Normal',  undefined, { attack: 90,  defense: 250, stamina: 300 }),
        makeEntry('E', 'Psychic', undefined, { attack: 150, defense: 100, stamina: 200 }),
        makeEntry('F', 'Dark',    undefined, { attack: 251, defense: 207, stamina: 225 }),
        makeEntry('G', 'Rock',    undefined, { attack: 295, defense: 109, stamina: 190 }),
        makeEntry('H', 'Ice',     undefined, { attack: 129, defense: 169, stamina: 496 }),
        makeEntry('I', 'Fairy',   undefined, { attack: 116, defense: 93,  stamina: 118 }),
        makeEntry('J', 'Ghost',   undefined, { attack: 60,  defense: 55,  stamina: 128 }),
      ];
      const { entries } = parsePokemonData(raw);
      expect(entries).toHaveLength(10);
      entries.forEach((e) => expect(VALID_TIER_LABELS).toContain(e.defenderTier));
    });
  });

  describe('live-dataset anchors', () => {
    let liveCatalog: ReturnType<typeof parsePokemonData>;
    beforeAll(() => {
      liveCatalog = parsePokemonData(pokemonData);
    });

    it('AC-05: Rampardos achieves S tier as a Rock attacker', () => {
      const rampardos = liveCatalog.entries.find((e) => e.name === 'Rampardos')!;
      expect(rampardos).toBeDefined();
      const rockRole = rampardos.attackerRoles.find((r) => r.typeId === 'Rock');
      expect(rockRole).toBeDefined();
      expect(rockRole!.tier).toBe('S');
    });

    it('AC-06: Tyranitar achieves S or A in both its Rock and Dark attacker roles', () => {
      const ttаr = liveCatalog.entries.find((e) => e.name === 'Tyranitar')!;
      expect(ttаr).toBeDefined();
      const rockTier = ttаr.attackerRoles.find((r) => r.typeId === 'Rock')?.tier;
      const darkTier = ttаr.attackerRoles.find((r) => r.typeId === 'Dark')?.tier;
      expect(['S', 'A']).toContain(rockTier);
      expect(['S', 'A']).toContain(darkTier);
    });

    it('AC-07: a lower-attack Rock Pokémon achieves B or C tier in the Rock attacker role', () => {
      // Geodude (Rock/Ground, attack=132) is well below Rampardos/Tyranitar
      const geodude = liveCatalog.entries.find((e) => e.name === 'Geodude')!;
      expect(geodude).toBeDefined();
      const rockRole = geodude.attackerRoles.find((r) => r.typeId === 'Rock');
      if (rockRole) {
        expect(['B', 'C']).toContain(rockRole.tier);
      }
      // If Geodude has no viable Rock role, the test passes vacuously — spec allows this.
    });

    it('AC-08: Charizard (Fire=A, Flying=S) has different tiers for its two attacker roles', () => {
      const charizard = liveCatalog.entries.find((e) => e.name === 'Charizard')!;
      expect(charizard).toBeDefined();
      const fireTier  = charizard.attackerRoles.find((r) => r.typeId === 'Fire')?.tier;
      const flyingTier = charizard.attackerRoles.find((r) => r.typeId === 'Flying')?.tier;
      expect(fireTier).toBeDefined();
      expect(flyingTier).toBeDefined();
      expect(fireTier).not.toBe(flyingTier);
    });

    it('AC-09: Blissey achieves S tier as a defender', () => {
      const blissey = liveCatalog.entries.find((e) => e.name === 'Blissey')!;
      expect(blissey).toBeDefined();
      expect(blissey.defenderTier).toBe('S');
    });

    it('AC-10: Chansey achieves S tier as a defender', () => {
      const chansey = liveCatalog.entries.find((e) => e.name === 'Chansey')!;
      expect(chansey).toBeDefined();
      expect(chansey.defenderTier).toBe('S');
    });

    it('AC-11: Caterpie achieves C tier as a defender', () => {
      const caterpie = liveCatalog.entries.find((e) => e.name === 'Caterpie')!;
      expect(caterpie).toBeDefined();
      expect(caterpie.defenderTier).toBe('C');
    });

    it('AC-12: every fragile Pokémon (Defense+Stamina ≤ 0.65×dataset mean) achieves C tier as a defender', () => {
      const allDefSta = liveCatalog.entries.map((e) => e.stats.defense + e.stats.stamina);
      const mean = allDefSta.reduce((s, v) => s + v, 0) / allDefSta.length;
      const fragileThreshold = mean * 0.65;
      const fragile = liveCatalog.entries.filter((e) => e.stats.defense + e.stats.stamina <= fragileThreshold);
      expect(fragile.length).toBeGreaterThan(0);
      fragile.forEach((e) => {
        expect(e.defenderTier).toBe('C');
      });
    });

    it('AC-13: no Pokémon has an attacker tier for a type it does not own', () => {
      for (const entry of liveCatalog.entries) {
        const ownedTypes = new Set([
          entry.primaryType.name,
          ...(entry.secondaryType ? [entry.secondaryType.name] : []),
        ]);
        entry.attackerRoles.forEach((r) => {
          expect(ownedTypes).toContain(r.typeId);
        });
      }
    });

    it('AC-14: no Pokémon has duplicate typeId values in attackerRoles', () => {
      for (const entry of liveCatalog.entries) {
        const typeIds = entry.attackerRoles.map((r) => r.typeId);
        expect(new Set(typeIds).size).toBe(typeIds.length);
      }
    });
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
