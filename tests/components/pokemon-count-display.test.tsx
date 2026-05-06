/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PokemonCountDisplay } from '../../src/components/pokemon-count-display';

// AC-04: The landing page contains the total Pokémon count as a visible integer

describe('PokemonCountDisplay', () => {
  it('AC-04: renders the pokemon count as a visible integer', () => {
    render(<PokemonCountDisplay count={905} />);
    expect(screen.getByTestId('pokemon-count')).toHaveTextContent('905');
  });

  it('AC-04: count is displayed in the document body', () => {
    render(<PokemonCountDisplay count={42} />);
    expect(document.body).toHaveTextContent('42');
  });

  it('renders a heading identifying the application', () => {
    render(<PokemonCountDisplay count={1} />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
