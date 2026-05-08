'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import type { PokemonEntry, StatMaxima } from '@/domain/pokemon-catalog';
import { PokemonSearch } from './pokemon-search';
import { PokemonCard } from './pokemon-card';

interface Props {
  entries: readonly PokemonEntry[];
  statMaxima: StatMaxima;
}

export function PokemonExplorer({ entries, statMaxima }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const names = entries.map((e) => e.name);
  const selectedEntry = selected ? (entries.find((e) => e.name === selected) ?? null) : null;

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 2, mb: 2 }}>
        <PokemonSearch options={names} onSelect={setSelected} />
      </Box>
      {selectedEntry && (
        <Box sx={{ mt: 2 }}>
          <PokemonCard
            name={selectedEntry.name}
            primaryType={selectedEntry.primaryType}
            secondaryType={selectedEntry.secondaryType}
            stats={selectedEntry.stats}
            statMaxima={statMaxima}
          />
        </Box>
      )}
    </Container>
  );
}
