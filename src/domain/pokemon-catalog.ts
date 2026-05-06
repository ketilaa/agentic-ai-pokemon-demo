export interface PokemonCatalog {
  readonly count: number;
  readonly names: readonly string[];
}

export function parsePokemonData(raw: unknown): PokemonCatalog {
  if (!Array.isArray(raw)) {
    throw new Error('Pokémon data must be a JSON array');
  }
  if (raw.length === 0) {
    throw new Error('Pokémon data array must not be empty');
  }

  const names = (raw as unknown[])
    .map((entry): string | null => {
      if (typeof entry !== 'object' || entry === null) return null;
      const namesField = (entry as Record<string, unknown>).names;
      if (typeof namesField !== 'object' || namesField === null) return null;
      const english = (namesField as Record<string, unknown>).English;
      return typeof english === 'string' && english.length > 0 ? english : null;
    })
    .filter((name): name is string => name !== null)
    .sort((a, b) => a.localeCompare(b));

  return Object.freeze({
    count: raw.length,
    names: Object.freeze(names),
  });
}
