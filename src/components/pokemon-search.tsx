'use client';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

interface Props {
  options: readonly string[];
  onSelect: (name: string | null) => void;
}

export function PokemonSearch({ options, onSelect }: Props) {
  return (
    <Autocomplete
      options={[...options]}
      renderInput={(params) => (
        <TextField {...params} label="Search Pokémon" fullWidth />
      )}
      onChange={(_, value) => onSelect(value)}
      fullWidth
    />
  );
}
