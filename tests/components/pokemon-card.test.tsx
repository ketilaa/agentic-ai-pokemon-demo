/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PokemonCard } from '../../src/components/pokemon-card';
import type { PokemonType } from '../../src/domain/pokemon-catalog';

// AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-13 (spec 0004)

const FIRE: PokemonType = { name: 'Fire', color: '#E62829' };
const FLYING: PokemonType = { name: 'Flying', color: '#81B9EF' };
const GRASS: PokemonType = { name: 'Grass', color: '#3FA129' };
const POISON: PokemonType = { name: 'Poison', color: '#9141CB' };

describe('PokemonCard', () => {
  it('AC-10: renders the Pokémon name', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} />);
    expect(screen.getByText('Charizard')).toBeInTheDocument();
  });

  it('AC-04: no type name appears on the card', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} />);
    expect(screen.queryByText('Fire')).not.toBeInTheDocument();
    expect(screen.queryByText('Flying')).not.toBeInTheDocument();
  });

  it('AC-04: no label text like "Primary type", "Secondary type", "Type 1", "Type 2"', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} />);
    expect(screen.queryByText(/primary\s*type/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/secondary\s*type/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/type\s*1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/type\s*2/i)).not.toBeInTheDocument();
  });

  it('AC-05: card surface carries the primary type color for a single-type Pokémon', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} />);
    const card = screen.getByTestId('pokemon-card');
    expect(card).toHaveAttribute('data-primary-color', '#E62829');
    expect(card).toHaveAttribute('data-secondary-color', '');
  });

  it('AC-06: card surface carries both type colors for a dual-type Pokémon', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} />);
    const card = screen.getByTestId('pokemon-card');
    expect(card).toHaveAttribute('data-primary-color', '#E62829');
    expect(card).toHaveAttribute('data-secondary-color', '#81B9EF');
  });

  it('AC-09: single-type card has no secondary color on its surface', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} />);
    expect(screen.getByTestId('pokemon-card')).toHaveAttribute('data-secondary-color', '');
  });

  it('AC-07: primary type color occupies the dominant portion of the card surface gradient', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} />);
    const bg = screen.getByTestId('pokemon-card').getAttribute('data-background') ?? '';
    expect(bg).toContain('#E62829 65%');
    expect(bg).toContain('#81B9EF 65%');
    expect(bg.indexOf('#E62829')).toBeLessThan(bg.indexOf('#81B9EF'));
  });

  it('AC-08, AC-13: no standalone swatch, chip, or badge element exists for type indication', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} />);
    expect(screen.queryByTestId('type-swatch-primary')).not.toBeInTheDocument();
    expect(screen.queryByTestId('type-swatch-secondary')).not.toBeInTheDocument();
  });
});
