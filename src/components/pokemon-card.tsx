import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface Props {
  name: string;
}

export function PokemonCard({ name }: Props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{name}</Typography>
      </CardContent>
    </Card>
  );
}
