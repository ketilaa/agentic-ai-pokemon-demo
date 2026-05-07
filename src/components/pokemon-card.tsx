import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
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

export function PokemonCard({ name, primaryType, secondaryType }: Props) {
  const background = secondaryType
    ? `linear-gradient(135deg, ${primaryType.color} 65%, ${secondaryType.color} 65%)`
    : primaryType.color;

  return (
    <Card
      data-testid="pokemon-card"
      data-primary-color={primaryType.color}
      data-secondary-color={secondaryType?.color ?? ''}
      data-background={background}
      sx={{ background }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ color: textColor(primaryType.color) }}>
          {name}
        </Typography>
      </CardContent>
    </Card>
  );
}
