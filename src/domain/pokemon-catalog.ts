export interface PokemonType {
  readonly name: string;
  readonly color: string;
}

export interface PokemonStats {
  readonly attack: number;
  readonly defense: number;
  readonly stamina: number;
}

export interface PokemonEntry {
  readonly name: string;
  readonly primaryType: PokemonType;
  readonly secondaryType: PokemonType | null;
  readonly stats: PokemonStats;
}

export interface PokemonCatalog {
  readonly count: number;
  readonly names: readonly string[];
  readonly entries: readonly PokemonEntry[];
}

// Pokémon GO type colour conventions — authoritative source for all type colors (spec 0004)
export const TYPE_COLORS: Record<string, string> = {
  Bug: '#91A119',
  Dark: '#624D4E',
  Dragon: '#5060E1',
  Electric: '#FAC000',
  Fairy: '#EF70EF',
  Fighting: '#FF8000',
  Fire: '#E62829',
  Flying: '#81B9EF',
  Ghost: '#704170',
  Grass: '#3FA129',
  Ground: '#915121',
  Ice: '#3DCEF3',
  Normal: '#9FA19F',
  Poison: '#9141CB',
  Psychic: '#EF4179',
  Rock: '#AFA981',
  Steel: '#60A1B8',
  Water: '#2980EF',
};

function toType(typeName: string): PokemonType {
  return { name: typeName, color: TYPE_COLORS[typeName] ?? '#888888' };
}

function extractEnglishName(entry: unknown): string | null {
  if (typeof entry !== 'object' || entry === null) return null;
  const namesField = (entry as Record<string, unknown>).names;
  if (typeof namesField !== 'object' || namesField === null) return null;
  const english = (namesField as Record<string, unknown>).English;
  return typeof english === 'string' && english.length > 0 ? english : null;
}

function extractStats(item: unknown): PokemonStats | null {
  if (typeof item !== 'object' || item === null) return null;
  const s = (item as Record<string, unknown>).stats;
  if (typeof s !== 'object' || s === null) return null;
  const { attack, defense, stamina } = s as Record<string, unknown>;
  if (typeof attack !== 'number' || typeof defense !== 'number' || typeof stamina !== 'number') return null;
  return { attack, defense, stamina };
}

function extractTypeName(typeField: unknown): string | null {
  if (typeof typeField !== 'object' || typeField === null) return null;
  const namesField = (typeField as Record<string, unknown>).names;
  if (typeof namesField !== 'object' || namesField === null) return null;
  const english = (namesField as Record<string, unknown>).English;
  return typeof english === 'string' && english.length > 0 ? english : null;
}

export function parsePokemonData(raw: unknown): PokemonCatalog {
  if (!Array.isArray(raw)) {
    throw new Error('Pokémon data must be a JSON array');
  }
  if (raw.length === 0) {
    throw new Error('Pokémon data array must not be empty');
  }

  const names: string[] = [];
  const entries: PokemonEntry[] = [];

  for (const item of raw as unknown[]) {
    const name = extractEnglishName(item);
    if (!name) continue;

    names.push(name);

    const primaryTypeName = extractTypeName((item as Record<string, unknown>).primaryType);
    if (!primaryTypeName) continue;

    const secondaryTypeName = extractTypeName((item as Record<string, unknown>).secondaryType);

    const stats = extractStats(item);
    if (!stats) continue;

    entries.push({
      name,
      primaryType: toType(primaryTypeName),
      secondaryType: secondaryTypeName ? toType(secondaryTypeName) : null,
      stats,
    });
  }

  names.sort((a, b) => a.localeCompare(b));
  entries.sort((a, b) => a.name.localeCompare(b.name));

  return Object.freeze({
    count: raw.length,
    names: Object.freeze(names),
    entries: Object.freeze(entries),
  });
}
