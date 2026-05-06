interface Props {
  count: number;
}

export function PokemonCountDisplay({ count }: Props) {
  return (
    <main>
      <h1>Pokémon GO Pokédex</h1>
      <p>
        Total Pokémon available:{' '}
        <span data-testid="pokemon-count">{count}</span>
      </p>
    </main>
  );
}
