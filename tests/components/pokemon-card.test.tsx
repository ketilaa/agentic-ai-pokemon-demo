/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PokemonCard } from '../../src/components/pokemon-card';
import type { PokemonType } from '../../src/domain/pokemon-catalog';

// AC-04, AC-05, AC-06, AC-07, AC-08, AC-10 (spec 0004)

const FIRE: PokemonType = { name: 'Fire', color: '#E62829' };
const FLYING: PokemonType = { name: 'Flying', color: '#81B9EF' };
const GRASS: PokemonType = { name: 'Grass', color: '#3FA129' };
const POISON: PokemonType = { name: 'Poison', color: '#9141CB' };

describe('PokemonCard', () => {
  it('AC-08: renders the Pokémon name', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} />);
    expect(screen.getByText('Charizard')).toBeInTheDocument();
  });

  it('AC-05: shows exactly one type swatch for a single-type Pokémon', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} />);
    expect(screen.getByTestId('type-swatch-primary')).toBeInTheDocument();
    expect(screen.queryByTestId('type-swatch-secondary')).not.toBeInTheDocument();
  });

  it('AC-06: shows two type swatches for a dual-type Pokémon', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} />);
    expect(screen.getByTestId('type-swatch-primary')).toBeInTheDocument();
    expect(screen.getByTestId('type-swatch-secondary')).toBeInTheDocument();
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

  it('AC-07: primary swatch is larger than secondary swatch', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} />);
    expect(screen.getByTestId('type-swatch-primary')).toHaveStyle({ width: '32px', height: '32px' });
    expect(screen.getByTestId('type-swatch-secondary')).toHaveStyle({ width: '20px', height: '20px' });
  });

  it('applies the primary type colour to the primary swatch', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} />);
    expect(screen.getByTestId('type-swatch-primary')).toHaveStyle({ backgroundColor: '#E62829' });
  });

  it('applies the secondary type colour to the secondary swatch', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} />);
    expect(screen.getByTestId('type-swatch-secondary')).toHaveStyle({ backgroundColor: '#9141CB' });
  });
});
