'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import type { PokemonEntry, StatMaxima } from '@/domain/pokemon-catalog';
import { PokemonSearch } from './pokemon-search';
import { PokemonCard } from './pokemon-card';

interface Props {
  entries: readonly PokemonEntry[];
  statMaxima: StatMaxima;
}

function PokemonExplorerInner({ entries, statMaxima }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const names = entries.map((e) => e.name);

  const paramName = searchParams.get('pokemon');
  const isValidParam = paramName !== null && entries.some((e) => e.name === paramName);
  const [selected, setSelected] = useState<string | null>(isValidParam ? paramName : null);

  useEffect(() => {
    if (paramName && !isValidParam) {
      router.replace(pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelect(name: string | null) {
    setSelected(name);
    if (name) {
      router.replace(`${pathname}?pokemon=${encodeURIComponent(name)}`);
    } else {
      router.replace(pathname);
    }
  }

  const selectedEntry = selected ? (entries.find((e) => e.name === selected) ?? null) : null;

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 2, mb: 2 }}>
        <PokemonSearch options={names} onSelect={handleSelect} />
      </Box>
      {selectedEntry && (
        <Box sx={{ mt: 2 }}>
          <PokemonCard
            name={selectedEntry.name}
            primaryType={selectedEntry.primaryType}
            secondaryType={selectedEntry.secondaryType}
            stats={selectedEntry.stats}
            statMaxima={statMaxima}
            evolvesFrom={selectedEntry.evolvesFrom}
            evolvesTo={selectedEntry.evolvesTo}
            imageUrl={selectedEntry.imageUrl}
            quickMoves={selectedEntry.quickMoves}
            chargedMoves={selectedEntry.chargedMoves}
            attackerRoles={selectedEntry.attackerRoles}
            defenderTier={selectedEntry.defenderTier}
            onSelect={handleSelect}
          />
        </Box>
      )}
    </Container>
  );
}

export function PokemonExplorer({ entries, statMaxima }: Props) {
  return (
    <Suspense>
      <PokemonExplorerInner entries={entries} statMaxima={statMaxima} />
    </Suspense>
  );
}
