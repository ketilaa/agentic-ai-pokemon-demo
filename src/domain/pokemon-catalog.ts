export interface PokemonCatalog {
  readonly count: number;
}

export function parsePokemonData(raw: unknown): PokemonCatalog {
  if (!Array.isArray(raw)) {
    throw new Error('Pokémon data must be a JSON array');
  }
  if (raw.length === 0) {
    throw new Error('Pokémon data array must not be empty');
  }
  return Object.freeze({ count: raw.length });
}
