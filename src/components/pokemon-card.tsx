import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import type { PokemonStats, PokemonType, StatMaxima } from '@/domain/pokemon-catalog';

interface Props {
  name: string;
  primaryType: PokemonType;
  secondaryType: PokemonType | null;
  stats: PokemonStats;
  statMaxima: StatMaxima;
}

function textColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#212121' : '#ffffff';
}

function StrengthProfile({ stats, maxima }: { stats: PokemonStats; maxima: StatMaxima }) {
  const bars = [
    { label: 'ATK', value: stats.attack, datasetMax: maxima.maxAttack, testId: 'stat-bar-atk' },
    { label: 'DEF', value: stats.defense, datasetMax: maxima.maxDefense, testId: 'stat-bar-def' },
    { label: 'STA', value: stats.stamina, datasetMax: maxima.maxStamina, testId: 'stat-bar-sta' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      {bars.map(({ label, value, datasetMax, testId }) => {
        const pct = datasetMax > 0 ? Math.round((value / datasetMax) * 100) : 0;
        return (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="caption"
              sx={{ width: 28, color: 'text.secondary', flexShrink: 0, fontSize: '0.65rem' }}
            >
              {label}
            </Typography>
            <Box sx={{ flex: 1, bgcolor: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <Box
                data-testid={testId}
                data-stat-value={value}
                data-stat-pct={pct}
                sx={{
                  width: `${pct}%`,
                  height: 6,
                  bgcolor: 'rgba(0,0,0,0.35)',
                  borderRadius: '4px',
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export function PokemonCard({ name, primaryType, secondaryType, stats, statMaxima }: Props) {
  const background = secondaryType
    ? `linear-gradient(135deg, ${primaryType.color} 65%, ${secondaryType.color} 65%)`
    : primaryType.color;

  return (
    <Card data-testid="pokemon-card" sx={{ overflow: 'hidden' }}>
      <Box
        data-testid="card-title-section"
        data-primary-color={primaryType.color}
        data-secondary-color={secondaryType?.color ?? ''}
        data-background={background}
        sx={{ background, px: 2, py: 1.5 }}
      >
        <Typography variant="h6" sx={{ color: textColor(primaryType.color) }}>
          {name}
        </Typography>
      </Box>
      <Box data-testid="card-content-section" sx={{ px: 2, py: 1.5 }}>
        <StrengthProfile stats={stats} maxima={statMaxima} />
      </Box>
    </Card>
  );
}
