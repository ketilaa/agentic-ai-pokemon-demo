'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { PokemonSearch } from './pokemon-search';
import { PokemonCard } from './pokemon-card';

interface Props {
  names: readonly string[];
}

export function PokemonExplorer({ names }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 2, mb: 2 }}>
        <PokemonSearch options={names} onSelect={setSelected} />
      </Box>
      {selected !== null && (
        <Box sx={{ mt: 2 }}>
          <PokemonCard name={selected} />
        </Box>
      )}
    </Container>
  );
}
