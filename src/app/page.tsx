import { readFileSync } from 'fs';
import { join } from 'path';
import { parsePokemonData } from '@/domain/pokemon-catalog';
import { PokemonCountDisplay } from '@/components/pokemon-count-display';
import { PokemonExplorer } from '@/components/pokemon-explorer';

// Executed at build time (static export). Reads the JSON written by scripts/fetch-pokemon.ts.
export default function HomePage() {
  const raw: unknown = JSON.parse(
    readFileSync(join(process.cwd(), 'public', 'data', 'pokemon.json'), 'utf-8')
  );
  const catalog = parsePokemonData(raw);
  return (
    <main>
      <PokemonExplorer entries={catalog.entries} />
      <PokemonCountDisplay count={catalog.count} />
    </main>
  );
}
