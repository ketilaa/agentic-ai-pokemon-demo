import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import type { PokemonType } from '@/domain/pokemon-catalog';

interface Props {
  name: string;
  primaryType: PokemonType;
  secondaryType: PokemonType | null;
}

function textColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#212121' : '#ffffff';
}

function TypeChip({ type }: { type: PokemonType }) {
  return (
    <Chip
      label={type.name}
      size="small"
      sx={{ backgroundColor: type.color, color: textColor(type.color) }}
    />
  );
}

export function PokemonCard({ name, primaryType, secondaryType }: Props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{name}</Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <TypeChip type={primaryType} />
          {secondaryType && <TypeChip type={secondaryType} />}
        </Box>
      </CardContent>
    </Card>
  );
}
