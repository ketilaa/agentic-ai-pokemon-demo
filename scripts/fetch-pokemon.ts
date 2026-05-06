import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { parsePokemonData } from '../src/domain/pokemon-catalog';

const API_URL =
  'https://pokemon-go-api.github.io/pokemon-go-api/api/pokedex.json';
const OUTPUT_PATH = join(process.cwd(), 'public', 'data', 'pokemon.json');

export async function fetchPokemonData(
  apiUrl: string,
  fetcher: (url: string) => Promise<Response> = (url) => fetch(url)
): Promise<unknown> {
  const response = await fetcher(apiUrl);
  if (!response.ok) {
    throw new Error(
      `API request failed with status ${response.status}: ${response.statusText}`
    );
  }
  return response.json();
}

export function writePokemonFile(data: unknown, outputPath: string): void {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function run(
  apiUrl: string = API_URL,
  outputPath: string = OUTPUT_PATH
): Promise<void> {
  const raw = await fetchPokemonData(apiUrl);
  const catalog = parsePokemonData(raw);
  writePokemonFile(raw, outputPath);
  console.log(`Fetched ${catalog.count} Pokémon entries → ${outputPath}`);
}

// Only execute when this file is the entry point
if (require.main === module) {
  run().catch((err: Error) => {
    console.error('Failed to fetch Pokémon data:', err.message);
    process.exit(1);
  });
}
