/**
 * @jest-environment jsdom
 */
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PokemonCard } from '../../src/components/pokemon-card';
import type { PokemonStats, PokemonType } from '../../src/domain/pokemon-catalog';

// AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10 (spec 0005)
// AC-04, AC-06, AC-07, AC-08, AC-09, AC-10, AC-13 carried from spec 0004

const FIRE: PokemonType = { name: 'Fire', color: '#E62829' };
const FLYING: PokemonType = { name: 'Flying', color: '#81B9EF' };
const GRASS: PokemonType = { name: 'Grass', color: '#3FA129' };
const POISON: PokemonType = { name: 'Poison', color: '#9141CB' };

const BALANCED: PokemonStats = { attack: 100, defense: 100, stamina: 100 };
const UNBALANCED: PokemonStats = { attack: 200, defense: 80, stamina: 140 };

describe('PokemonCard – card structure (spec 0005)', () => {
  it('AC-04: card has two distinct sections', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} />);
    expect(screen.getByTestId('card-title-section')).toBeInTheDocument();
    expect(screen.getByTestId('card-content-section')).toBeInTheDocument();
  });

  it('AC-05: title section contains the Pokémon name', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} />);
    const title = screen.getByTestId('card-title-section');
    expect(within(title).getByText('Charizard')).toBeInTheDocument();
  });

  it('AC-06: title section carries primary type color for a single-type Pokémon', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} stats={BALANCED} />);
    const title = screen.getByTestId('card-title-section');
    expect(title).toHaveAttribute('data-primary-color', '#E62829');
    expect(title).toHaveAttribute('data-secondary-color', '');
  });

  it('AC-06: title section carries both type colors for a dual-type Pokémon', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} />);
    const title = screen.getByTestId('card-title-section');
    expect(title).toHaveAttribute('data-primary-color', '#E62829');
    expect(title).toHaveAttribute('data-secondary-color', '#81B9EF');
  });

  it('AC-06: primary color occupies the dominant portion of the title gradient', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} />);
    const bg = screen.getByTestId('card-title-section').getAttribute('data-background') ?? '';
    expect(bg).toContain('#E62829 65%');
    expect(bg).toContain('#81B9EF 65%');
    expect(bg.indexOf('#E62829')).toBeLessThan(bg.indexOf('#81B9EF'));
  });

  it('AC-07: content section does not carry type color attributes', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} />);
    const content = screen.getByTestId('card-content-section');
    expect(content).not.toHaveAttribute('data-primary-color');
    expect(content).not.toHaveAttribute('data-background');
  });

  it('AC-08: strength profile is inside the content section', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={null} stats={BALANCED} />);
    const content = screen.getByTestId('card-content-section');
    expect(within(content).getByTestId('stat-bar-atk')).toBeInTheDocument();
    expect(within(content).getByTestId('stat-bar-def')).toBeInTheDocument();
    expect(within(content).getByTestId('stat-bar-sta')).toBeInTheDocument();
  });
});

describe('PokemonCard – strength profile (spec 0005)', () => {
  it('AC-02: all three stat bars are present simultaneously', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} stats={BALANCED} />);
    expect(screen.getByTestId('stat-bar-atk')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bar-def')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bar-sta')).toBeInTheDocument();
  });

  it('AC-03: stat bars reflect relative magnitudes within the Pokémon own profile', () => {
    // UNBALANCED: attack 200 > stamina 140 > defense 80
    render(<PokemonCard name="Attacker" primaryType={FIRE} secondaryType={null} stats={UNBALANCED} />);
    const atk = parseInt(screen.getByTestId('stat-bar-atk').getAttribute('data-stat-value') ?? '0');
    const def = parseInt(screen.getByTestId('stat-bar-def').getAttribute('data-stat-value') ?? '0');
    const sta = parseInt(screen.getByTestId('stat-bar-sta').getAttribute('data-stat-value') ?? '0');
    expect(atk).toBeGreaterThan(sta);
    expect(sta).toBeGreaterThan(def);
  });

  it('AC-03: balanced stats produce equal bar values', () => {
    render(<PokemonCard name="Balanced" primaryType={FIRE} secondaryType={null} stats={BALANCED} />);
    const atk = parseInt(screen.getByTestId('stat-bar-atk').getAttribute('data-stat-value') ?? '0');
    const def = parseInt(screen.getByTestId('stat-bar-def').getAttribute('data-stat-value') ?? '0');
    const sta = parseInt(screen.getByTestId('stat-bar-sta').getAttribute('data-stat-value') ?? '0');
    expect(atk).toBe(def);
    expect(def).toBe(sta);
  });
});

describe('PokemonCard – spec 0004 constraints preserved', () => {
  it('no type name appears on the card', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} />);
    expect(screen.queryByText('Fire')).not.toBeInTheDocument();
    expect(screen.queryByText('Flying')).not.toBeInTheDocument();
  });

  it('no label text like "Primary type", "Secondary type", "Type 1", "Type 2"', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} />);
    expect(screen.queryByText(/primary\s*type/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/secondary\s*type/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/type\s*1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/type\s*2/i)).not.toBeInTheDocument();
  });

  it('no standalone swatch, chip, or badge element exists for type indication', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} />);
    expect(screen.queryByTestId('type-swatch-primary')).not.toBeInTheDocument();
    expect(screen.queryByTestId('type-swatch-secondary')).not.toBeInTheDocument();
  });
});
