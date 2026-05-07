import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

interface Props {
  count: number;
}

export function PokemonCountDisplay({ count }: Props) {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pokémon GO Pokédex
        </Typography>
        <Typography variant="body1">
          Total Pokémon available:{' '}
          <Box component="span" data-testid="pokemon-count">
            {count}
          </Box>
        </Typography>
      </Box>
    </Container>
  );
}
