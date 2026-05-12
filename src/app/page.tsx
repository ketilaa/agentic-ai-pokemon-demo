import { readFileSync } from 'fs';
import { join } from 'path';
import { parsePokemonData } from '@/domain/pokemon-catalog';
import { PokemonExplorer } from '@/components/pokemon-explorer';

export default function HomePage() {
  const raw: unknown = JSON.parse(
    readFileSync(join(process.cwd(), 'public', 'data', 'pokemon.json'), 'utf-8')
  );
  const catalog = parsePokemonData(raw);
  return (
    <main>
      <PokemonExplorer entries={catalog.entries} statMaxima={catalog.statMaxima} />
    </main>
  );
}
