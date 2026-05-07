/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PokemonCard } from '../../src/components/pokemon-card';
import type { PokemonType } from '../../src/domain/pokemon-catalog';

// AC-01, AC-02, AC-03, AC-04, AC-05 (spec 0003)

const FIRE: PokemonType = { name: 'Fire', color: '#E62829' };
const FLYING: PokemonType = { name: 'Flying', color: '#81B9EF' };
const GRASS: PokemonType = { name: 'Grass', color: '#3FA129' };

describe('PokemonCard', () => {
  it('AC-05: renders the Pokémon name', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} />);
    expect(screen.getByText('Charizard')).toBeInTheDocument();
  });

  it('AC-01: shows exactly one type indicator for a single-type Pokémon', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} />);
    expect(screen.getByText('Fire')).toBeInTheDocument();
    expect(screen.queryByText('Flying')).not.toBeInTheDocument();
  });

  it('AC-02: shows two type indicators for a dual-type Pokémon', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} />);
    expect(screen.getByText('Fire')).toBeInTheDocument();
    expect(screen.getByText('Flying')).toBeInTheDocument();
  });

  it('AC-03: does not render label text like "Primary type" or "Secondary type"', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} />);
    expect(screen.queryByText(/primary\s*type/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/secondary\s*type/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/type\s*1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/type\s*2/i)).not.toBeInTheDocument();
  });

  it('AC-04: type name is visible as text within each indicator', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={{ name: 'Poison', color: '#9141CB' }} />);
    expect(screen.getByText('Grass')).toBeInTheDocument();
    expect(screen.getByText('Poison')).toBeInTheDocument();
  });

  it('applies the type colour to the chip background', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} />);
    const chip = screen.getByText('Fire').closest('.MuiChip-root');
    expect(chip).toHaveStyle({ backgroundColor: '#E62829' });
  });
});
