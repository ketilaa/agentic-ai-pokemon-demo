import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { PokemonStats, PokemonType, StatMaxima } from '@/domain/pokemon-catalog';

interface Props {
  name: string;
  primaryType: PokemonType;
  secondaryType: PokemonType | null;
  stats: PokemonStats;
  statMaxima: StatMaxima;
  evolvesFrom: string | null;
  evolvesTo: readonly string[];
  onSelect: (name: string) => void;
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
        const pct = datasetMax > 0 ? Math.floor((value / datasetMax) * 100) : 0;
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

export function PokemonCard({ name, primaryType, secondaryType, stats, statMaxima, evolvesFrom, evolvesTo, onSelect }: Props) {
  const borderSx = secondaryType
    ? { border: `3px solid ${primaryType.color}`, borderLeft: `6px solid ${secondaryType.color}` }
    : { border: `3px solid ${primaryType.color}` };

  return (
    <Card
      data-testid="pokemon-card"
      data-border-primary-color={primaryType.color}
      data-border-secondary-color={secondaryType?.color ?? ''}
      data-tint-color={primaryType.color}
      sx={{ overflow: 'hidden', bgcolor: alpha(primaryType.color, 0.08), ...borderSx }}
    >
      <Box
        data-testid="card-title-section"
        sx={{ px: 2, py: 1.5 }}
      >
        <Typography variant="h6" sx={{ color: 'text.primary' }}>
          {name}
        </Typography>
      </Box>
      <Box data-testid="card-content-section" sx={{ px: 2, py: 1.5 }}>
        <StrengthProfile stats={stats} maxima={statMaxima} />
        {(evolvesFrom !== null || evolvesTo.length > 0) && (
          <Box data-testid="evolution-section" sx={{ mt: 1.5 }}>
            {evolvesFrom !== null && (
              <Box data-testid="evolves-from-section" sx={{ mb: evolvesTo.length > 0 ? 1 : 0 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Evolves from
                </Typography>
                <Chip
                  label={evolvesFrom}
                  size="small"
                  clickable
                  onClick={() => onSelect(evolvesFrom)}
                />
              </Box>
            )}
            {evolvesTo.length > 0 && (
              <Box data-testid="evolves-to-section">
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Evolves to
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {evolvesTo.map((evoName) => (
                    <Chip
                      key={evoName}
                      label={evoName}
                      size="small"
                      clickable
                      onClick={() => onSelect(evoName)}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Card>
  );
}
