import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { PokemonType } from '@/domain/pokemon-catalog';

interface Props {
  name: string;
  primaryType: PokemonType;
  secondaryType: PokemonType | null;
}

function TypeSwatch({ color, variant }: { color: string; variant: 'primary' | 'secondary' }) {
  return (
    <Box
      data-testid={`type-swatch-${variant}`}
      sx={{
        width: variant === 'primary' ? '32px' : '20px',
        height: variant === 'primary' ? '32px' : '20px',
        borderRadius: '50%',
        backgroundColor: color,
        border: '2px solid rgba(0,0,0,0.12)',
        flexShrink: 0,
      }}
    />
  );
}

export function PokemonCard({ name, primaryType, secondaryType }: Props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{name}</Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
          <TypeSwatch color={primaryType.color} variant="primary" />
          {secondaryType && <TypeSwatch color={secondaryType.color} variant="secondary" />}
        </Box>
      </CardContent>
    </Card>
  );
}
