import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { AttackerRoleTier, MoveEntry, PokemonStats, PokemonType, StatMaxima, TierLabel } from '@/domain/pokemon-catalog';
import { TYPE_COLORS } from '@/domain/pokemon-catalog';

interface Props {
  name: string;
  primaryType: PokemonType;
  secondaryType: PokemonType | null;
  stats: PokemonStats;
  statMaxima: StatMaxima;
  evolvesFrom: string | null;
  evolvesTo: readonly string[];
  imageUrl?: string | null;
  quickMoves?: readonly MoveEntry[];
  chargedMoves?: readonly MoveEntry[];
  attackerRoles?: readonly AttackerRoleTier[];
  defenderTier?: TierLabel;
  onSelect: (name: string) => void;
}

const HEADER_TINT_OPACITY = 0.3;
const MAX_CARD_WIDTH = 480;

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

function MoveGroup({
  moves,
  groupTestId,
  labelTestId,
  label,
}: {
  moves: readonly MoveEntry[];
  groupTestId: string;
  labelTestId: string;
  label: string;
}) {
  if (moves.length === 0) return null;
  return (
    <>
      <Typography
        data-testid={labelTestId}
        variant="caption"
        sx={{ color: 'text.secondary', lineHeight: 1, fontSize: '0.6rem' }}
      >
        {label}
      </Typography>
      <Box data-testid={groupTestId} sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {moves.map((move) => {
          const color = TYPE_COLORS[move.typeId] ?? '#888888';
          return (
            <Box
              key={move.name}
              component="span"
              data-testid="move-item"
              data-move-name={move.name}
              data-move-type={move.typeId}
              data-is-elite={String(move.isElite)}
              data-is-recommended={String(move.isRecommended)}
              sx={{
                display: 'inline-block',
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                bgcolor: alpha(color, 0.15),
                fontSize: '0.7rem',
                fontStyle: move.isElite ? 'italic' : 'normal',
                fontWeight: move.isRecommended ? 700 : 400,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {move.name}
            </Box>
          );
        })}
      </Box>
    </>
  );
}

function RoleTierSection({
  attackerRoles,
  defenderTier,
}: {
  attackerRoles: readonly AttackerRoleTier[];
  defenderTier: TierLabel;
}) {
  return (
    <Box
      data-testid="role-tier-section"
      sx={{ mt: 1, mb: 0.25, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}
    >
      {attackerRoles.map((role) => {
        const color = TYPE_COLORS[role.typeId] ?? '#888888';
        return (
          <Box
            key={role.typeId}
            component="span"
            data-role="attacker"
            data-type-id={role.typeId}
            data-tier={role.tier}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20,
              borderRadius: '3px',
              bgcolor: alpha(color, 0.8),
              fontSize: '0.6rem',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1,
            }}
          >
            {role.tier}
          </Box>
        );
      })}
      <Box
        component="span"
        data-role="defender"
        data-tier={defenderTier}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          borderRadius: '3px',
          bgcolor: 'rgba(90,90,90,0.45)',
          fontSize: '0.6rem',
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1,
        }}
      >
        {defenderTier}
      </Box>
    </Box>
  );
}

function MoveSection({
  quickMoves,
  chargedMoves,
}: {
  quickMoves: readonly MoveEntry[];
  chargedMoves: readonly MoveEntry[];
}) {
  if (quickMoves.length === 0 && chargedMoves.length === 0) return null;
  return (
    <Box data-testid="move-section" sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <MoveGroup
        moves={quickMoves}
        groupTestId="quick-moves-group"
        labelTestId="quick-moves-label"
        label="Quick moves"
      />
      <MoveGroup
        moves={chargedMoves}
        groupTestId="charged-moves-group"
        labelTestId="charged-moves-label"
        label="Charged moves"
      />
    </Box>
  );
}

export function PokemonCard({ name, primaryType, secondaryType, stats, statMaxima, evolvesFrom, evolvesTo, imageUrl = null, quickMoves = [], chargedMoves = [], attackerRoles = [], defenderTier = 'C', onSelect }: Props) {
  return (
    <Card
      data-testid="pokemon-card"
      data-border-primary-color={primaryType.color}
      data-border-secondary-color={secondaryType?.color ?? ''}
      data-border-primary-sides="4"
      data-border-secondary-sides={secondaryType ? '1' : '0'}
      data-tint-color={primaryType.color}
      data-tint-opacity={0}
      data-max-width={MAX_CARD_WIDTH}
      sx={{
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        maxWidth: MAX_CARD_WIDTH,
        mx: 'auto',
        border: `3px solid ${primaryType.color}`,
        ...(secondaryType && {
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: secondaryType.color,
            pointerEvents: 'none',
          },
        }),
      }}
    >
      <Box
        data-testid="card-header"
        data-header-tint-color={primaryType.color}
        data-header-tint-opacity={HEADER_TINT_OPACITY}
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: alpha(primaryType.color, HEADER_TINT_OPACITY),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="h6" data-name-color-source="theme" sx={{ color: 'text.primary' }}>
          {name}
        </Typography>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            data-testid="pokemon-image"
            data-image-crop="none"
            width={64}
            height={64}
            style={{ display: 'block', width: 64, height: 64, objectFit: 'contain', pointerEvents: 'none', flexShrink: 0 }}
          />
        )}
      </Box>
      <Box data-testid="card-content-section" data-content-tint-opacity={0} sx={{ px: 2, py: 1.5 }}>
        <StrengthProfile stats={stats} maxima={statMaxima} />
        <RoleTierSection attackerRoles={attackerRoles} defenderTier={defenderTier} />
        <MoveSection quickMoves={quickMoves} chargedMoves={chargedMoves} />
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
