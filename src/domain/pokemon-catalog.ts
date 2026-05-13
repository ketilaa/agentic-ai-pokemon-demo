export interface PokemonType {
  readonly name: string;
  readonly color: string;
}

export interface PokemonStats {
  readonly attack: number;
  readonly defense: number;
  readonly stamina: number;
}

export interface MoveEntry {
  readonly name: string;
  readonly typeId: string;
  readonly isElite: boolean;
  readonly isRecommended: boolean;
}

export interface PokemonEntry {
  readonly name: string;
  readonly primaryType: PokemonType;
  readonly secondaryType: PokemonType | null;
  readonly stats: PokemonStats;
  readonly evolvesFrom: string | null;
  readonly evolvesTo: readonly string[];
  readonly imageUrl: string | null;
  readonly quickMoves: readonly MoveEntry[];
  readonly chargedMoves: readonly MoveEntry[];
}

export interface StatMaxima {
  readonly maxAttack: number;
  readonly maxDefense: number;
  readonly maxStamina: number;
}

export interface PokemonCatalog {
  readonly count: number;
  readonly names: readonly string[];
  readonly entries: readonly PokemonEntry[];
  readonly statMaxima: StatMaxima;
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

const PERMITTED_IMAGE_HOST = 'raw.githubusercontent.com';

function extractImageUrl(item: unknown): string | null {
  if (typeof item !== 'object' || item === null) return null;
  const assets = (item as Record<string, unknown>).assets;
  if (typeof assets !== 'object' || assets === null) return null;
  const image = (assets as Record<string, unknown>).image;
  if (typeof image !== 'string') return null;
  try {
    const url = new URL(image);
    return url.hostname === PERMITTED_IMAGE_HOST ? image : null;
  } catch {
    return null;
  }
}

function extractId(item: unknown): string | null {
  if (typeof item !== 'object' || item === null) return null;
  const id = (item as Record<string, unknown>).id;
  return typeof id === 'string' && id.length > 0 ? id : null;
}

function extractEvolutionIds(item: unknown): string[] {
  if (typeof item !== 'object' || item === null) return [];
  const evolutions = (item as Record<string, unknown>).evolutions;
  if (!Array.isArray(evolutions)) return [];
  const ids: string[] = [];
  for (const evo of evolutions) {
    if (typeof evo !== 'object' || evo === null) continue;
    const id = (evo as Record<string, unknown>).id;
    if (typeof id === 'string' && id.length > 0) ids.push(id);
  }
  return ids;
}

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

// Internal-only; _stat carries energy (quick moves) or power (charged moves) for recommendation
// and is consumed here — it never reaches MoveEntry or any component.
interface MoveDraft {
  readonly name: string;
  readonly typeId: string;
  readonly isElite: boolean;
  readonly _stat: number;
}

function extractMovesWithStat(collection: unknown, isElite: boolean, statField: 'energy' | 'power'): MoveDraft[] {
  if (typeof collection !== 'object' || collection === null || Array.isArray(collection)) {
    return [];
  }
  const moves: MoveDraft[] = [];
  for (const move of Object.values(collection as Record<string, unknown>)) {
    const name = extractEnglishName(move);
    const typeId = extractTypeName((move as Record<string, unknown>).type);
    if (!name) {
      console.warn('Move object has no English name; omitting from move list');
      continue;
    }
    if (!typeId) {
      console.warn(`Move "${name}" has no resolvable type; omitting from move list`);
      continue;
    }
    const raw = (move as Record<string, unknown>)[statField];
    if (typeof raw !== 'number') {
      console.warn(`Move "${name}" has no "${statField}" value; defaulting to 0 for recommendation`);
    }
    const _stat = typeof raw === 'number' ? raw : 0;
    moves.push({ name, typeId, isElite, _stat });
  }
  return moves;
}

function mergeMoveEntries(regular: MoveDraft[], elite: MoveDraft[]): readonly MoveDraft[] {
  const seen = new Map<string, MoveDraft>();
  for (const m of regular) seen.set(m.name, m);
  for (const m of elite) seen.set(m.name, m);
  return Object.freeze([...seen.values()]);
}

// Selects the recommended move (highest _stat; alphabetical tiebreaker) and returns frozen MoveEntry[].
function applyRecommended(drafts: readonly MoveDraft[]): readonly MoveEntry[] {
  if (drafts.length === 0) return Object.freeze([]);
  const best = [...drafts].sort((a, b) =>
    b._stat !== a._stat ? b._stat - a._stat : a.name.localeCompare(b.name, 'en')
  )[0];
  return Object.freeze(
    drafts.map((m) =>
      Object.freeze({ name: m.name, typeId: m.typeId, isElite: m.isElite, isRecommended: m.name === best.name })
    )
  );
}

export function parsePokemonData(raw: unknown): PokemonCatalog {
  if (!Array.isArray(raw)) {
    throw new Error('Pokémon data must be a JSON array');
  }
  if (raw.length === 0) {
    throw new Error('Pokémon data array must not be empty');
  }

  // Build id → English name map for resolving evolution targets
  const idToName = new Map<string, string>();
  for (const item of raw as unknown[]) {
    const id = extractId(item);
    const name = extractEnglishName(item);
    if (id && name) idToName.set(id, name);
  }

  // Build reverse evolution map: target id → de-duplicated set of source English names
  const reverseEvoMap = new Map<string, Set<string>>();
  for (const item of raw as unknown[]) {
    const sourceName = extractEnglishName(item);
    if (!sourceName) continue;
    for (const targetId of extractEvolutionIds(item)) {
      if (!reverseEvoMap.has(targetId)) reverseEvoMap.set(targetId, new Set());
      reverseEvoMap.get(targetId)!.add(sourceName);
    }
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

    const id = extractId(item);
    const sourceNames = id ? [...(reverseEvoMap.get(id) ?? [])] : [];
    const evolvesFrom = sourceNames.length > 0 ? sourceNames[0] : null;

    const evolvesTo = Object.freeze(
      extractEvolutionIds(item)
        .map((eid) => idToName.get(eid))
        .filter((n): n is string => n !== undefined)
    );

    const rawItem = item as Record<string, unknown>;
    const quickMoves = applyRecommended(mergeMoveEntries(
      extractMovesWithStat(rawItem.quickMoves, false, 'energy'),
      extractMovesWithStat(rawItem.eliteQuickMoves, true, 'energy'),
    ));
    const chargedMoves = applyRecommended(mergeMoveEntries(
      extractMovesWithStat(rawItem.cinematicMoves, false, 'power'),
      extractMovesWithStat(rawItem.eliteCinematicMoves, true, 'power'),
    ));

    entries.push({
      name,
      primaryType: toType(primaryTypeName),
      secondaryType: secondaryTypeName ? toType(secondaryTypeName) : null,
      stats,
      evolvesFrom,
      evolvesTo,
      imageUrl: extractImageUrl(item),
      quickMoves,
      chargedMoves,
    });
  }

  names.sort((a, b) => a.localeCompare(b));
  entries.sort((a, b) => a.name.localeCompare(b.name));

  const statMaxima = Object.freeze({
    maxAttack: entries.reduce((m, e) => Math.max(m, e.stats.attack), 0),
    maxDefense: entries.reduce((m, e) => Math.max(m, e.stats.defense), 0),
    maxStamina: entries.reduce((m, e) => Math.max(m, e.stats.stamina), 0),
  });

  return Object.freeze({
    count: raw.length,
    names: Object.freeze(names),
    entries: Object.freeze(entries),
    statMaxima,
  });
}
