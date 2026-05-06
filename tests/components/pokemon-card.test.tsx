/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PokemonCard } from '../../src/components/pokemon-card';

// AC-04: Selecting a Pokémon name displays a card showing that name only

describe('PokemonCard', () => {
  it('AC-04: renders the Pokémon name', () => {
    render(<PokemonCard name="Bulbasaur" />);
    expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
  });

  it('AC-04: renders only the name — no stats, types, or extra data', () => {
    render(<PokemonCard name="Pikachu" />);
    expect(screen.queryByText(/attack/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/type/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/hp/i)).not.toBeInTheDocument();
  });
});
