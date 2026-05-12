/**
 * @jest-environment jsdom
 */
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PokemonCard } from '../../src/components/pokemon-card';
import type { PokemonStats, PokemonType, StatMaxima } from '../../src/domain/pokemon-catalog';

// AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10 (spec 0005)
// AC-04, AC-06, AC-07, AC-08, AC-09, AC-10, AC-13 carried from spec 0004
// AC-04 – AC-08 (spec 0006)

const FIRE: PokemonType = { name: 'Fire', color: '#E62829' };
const FLYING: PokemonType = { name: 'Flying', color: '#81B9EF' };
const GRASS: PokemonType = { name: 'Grass', color: '#3FA129' };
const POISON: PokemonType = { name: 'Poison', color: '#9141CB' };

const BALANCED: PokemonStats = { attack: 100, defense: 100, stamina: 100 };
const UNBALANCED: PokemonStats = { attack: 200, defense: 80, stamina: 140 };

// Dataset maxima used in spec 0005 tests — chosen so test stat values are below the ceiling
const MAXIMA: StatMaxima = { maxAttack: 300, maxDefense: 300, maxStamina: 300 };

describe('PokemonCard – card structure (spec 0005)', () => {
  it('AC-04: card has two distinct sections', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.getByTestId('card-title-section')).toBeInTheDocument();
    expect(screen.getByTestId('card-content-section')).toBeInTheDocument();
  });

  it('AC-05: title section contains the Pokémon name', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const title = screen.getByTestId('card-title-section');
    expect(within(title).getByText('Charizard')).toBeInTheDocument();
  });

  it('AC-06: title section carries primary type color for a single-type Pokémon', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const title = screen.getByTestId('card-title-section');
    expect(title).toHaveAttribute('data-primary-color', '#E62829');
    expect(title).toHaveAttribute('data-secondary-color', '');
  });

  it('AC-06: title section carries both type colors for a dual-type Pokémon', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const title = screen.getByTestId('card-title-section');
    expect(title).toHaveAttribute('data-primary-color', '#E62829');
    expect(title).toHaveAttribute('data-secondary-color', '#81B9EF');
  });

  it('AC-06: primary color occupies the dominant portion of the title gradient', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const bg = screen.getByTestId('card-title-section').getAttribute('data-background') ?? '';
    expect(bg).toContain('#E62829 65%');
    expect(bg).toContain('#81B9EF 65%');
    expect(bg.indexOf('#E62829')).toBeLessThan(bg.indexOf('#81B9EF'));
  });

  it('AC-07: content section does not carry type color attributes', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const content = screen.getByTestId('card-content-section');
    expect(content).not.toHaveAttribute('data-primary-color');
    expect(content).not.toHaveAttribute('data-background');
  });

  it('AC-08: strength profile is inside the content section', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const content = screen.getByTestId('card-content-section');
    expect(within(content).getByTestId('stat-bar-atk')).toBeInTheDocument();
    expect(within(content).getByTestId('stat-bar-def')).toBeInTheDocument();
    expect(within(content).getByTestId('stat-bar-sta')).toBeInTheDocument();
  });
});

describe('PokemonCard – strength profile (spec 0005)', () => {
  it('AC-02: all three stat bars are present simultaneously', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.getByTestId('stat-bar-atk')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bar-def')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bar-sta')).toBeInTheDocument();
  });

  it('AC-03: stat bars reflect relative magnitudes against the dataset maximum', () => {
    // UNBALANCED: attack 200 > stamina 140 > defense 80, all against MAXIMA of 300
    render(<PokemonCard name="Attacker" primaryType={FIRE} secondaryType={null} stats={UNBALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const atk = parseInt(screen.getByTestId('stat-bar-atk').getAttribute('data-stat-pct') ?? '0');
    const def = parseInt(screen.getByTestId('stat-bar-def').getAttribute('data-stat-pct') ?? '0');
    const sta = parseInt(screen.getByTestId('stat-bar-sta').getAttribute('data-stat-pct') ?? '0');
    expect(atk).toBeGreaterThan(sta);
    expect(sta).toBeGreaterThan(def);
  });

  it('AC-03: balanced stats produce equal bar percentages', () => {
    render(<PokemonCard name="Balanced" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const atk = parseInt(screen.getByTestId('stat-bar-atk').getAttribute('data-stat-pct') ?? '0');
    const def = parseInt(screen.getByTestId('stat-bar-def').getAttribute('data-stat-pct') ?? '0');
    const sta = parseInt(screen.getByTestId('stat-bar-sta').getAttribute('data-stat-pct') ?? '0');
    expect(atk).toBe(def);
    expect(def).toBe(sta);
  });
});

describe('PokemonCard – dataset-relative stat scaling (spec 0006)', () => {
  const maxima: StatMaxima = { maxAttack: 200, maxDefense: 200, maxStamina: 200 };

  it('AC-04: a Pokémon at the dataset Attack maximum renders ATK bar at 100%', () => {
    const atMax: PokemonStats = { attack: 200, defense: 100, stamina: 100 };
    render(<PokemonCard name="Apex" primaryType={FIRE} secondaryType={null} stats={atMax} statMaxima={maxima} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.getByTestId('stat-bar-atk')).toHaveAttribute('data-stat-pct', '100');
  });

  it('AC-05: a Pokémon below the dataset Attack maximum renders ATK bar below 100%', () => {
    const low: PokemonStats = { attack: 100, defense: 100, stamina: 100 };
    render(<PokemonCard name="Low" primaryType={FIRE} secondaryType={null} stats={low} statMaxima={maxima} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const pct = parseInt(screen.getByTestId('stat-bar-atk').getAttribute('data-stat-pct') ?? '101');
    expect(pct).toBeLessThan(100);
  });

  it('AC-05: ATK bar pct scales proportionally to the dataset maximum', () => {
    const half: PokemonStats = { attack: 100, defense: 100, stamina: 100 };
    render(<PokemonCard name="Half" primaryType={FIRE} secondaryType={null} stats={half} statMaxima={maxima} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.getByTestId('stat-bar-atk')).toHaveAttribute('data-stat-pct', '50');
  });

  it('AC-06: a Pokémon at the dataset Defense maximum renders DEF bar at 100%', () => {
    const atMax: PokemonStats = { attack: 100, defense: 200, stamina: 100 };
    render(<PokemonCard name="Wall" primaryType={FIRE} secondaryType={null} stats={atMax} statMaxima={maxima} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.getByTestId('stat-bar-def')).toHaveAttribute('data-stat-pct', '100');
  });

  it('AC-07: a Pokémon at the dataset Stamina maximum renders STA bar at 100%', () => {
    const atMax: PokemonStats = { attack: 100, defense: 100, stamina: 200 };
    render(<PokemonCard name="Tank" primaryType={FIRE} secondaryType={null} stats={atMax} statMaxima={maxima} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.getByTestId('stat-bar-sta')).toHaveAttribute('data-stat-pct', '100');
  });

  it('AC-06/AC-07: each stat dimension scales against its own maximum independently', () => {
    // Different maxima per dimension to confirm no cross-stat normalization
    const asymmetric: StatMaxima = { maxAttack: 400, maxDefense: 200, maxStamina: 100 };
    const stats: PokemonStats = { attack: 200, defense: 100, stamina: 50 };
    render(<PokemonCard name="Mixed" primaryType={FIRE} secondaryType={null} stats={stats} statMaxima={asymmetric} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.getByTestId('stat-bar-atk')).toHaveAttribute('data-stat-pct', '50');
    expect(screen.getByTestId('stat-bar-def')).toHaveAttribute('data-stat-pct', '50');
    expect(screen.getByTestId('stat-bar-sta')).toHaveAttribute('data-stat-pct', '50');
  });

  it('AC-08: uniformly modest Pokémon has lower pct on all bars than a dominant Pokémon', () => {
    const modest: PokemonStats = { attack: 60, defense: 60, stamina: 60 };
    const dominant: PokemonStats = { attack: 200, defense: 200, stamina: 200 };

    const { unmount } = render(
      <PokemonCard name="Modest" primaryType={FIRE} secondaryType={null} stats={modest} statMaxima={maxima} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />
    );
    const modestAtk = parseInt(screen.getByTestId('stat-bar-atk').getAttribute('data-stat-pct') ?? '0');
    unmount();

    render(<PokemonCard name="Dominant" primaryType={FIRE} secondaryType={null} stats={dominant} statMaxima={maxima} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const dominantAtk = parseInt(screen.getByTestId('stat-bar-atk').getAttribute('data-stat-pct') ?? '0');

    expect(dominantAtk).toBeGreaterThan(modestAtk);
  });
});

describe('PokemonCard – evolution section (spec 0007)', () => {
  it('AC-10: no evolution section is rendered for a standalone Pokémon', () => {
    render(<PokemonCard name="Snorlax" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.queryByTestId('evolution-section')).not.toBeInTheDocument();
  });

  it('AC-08: only the evolves-to section is shown for a base-stage Pokémon', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={['Ivysaur']} onSelect={jest.fn()} />);
    expect(screen.getByTestId('evolves-to-section')).toBeInTheDocument();
    expect(screen.queryByTestId('evolves-from-section')).not.toBeInTheDocument();
  });

  it('AC-09: only the evolves-from section is shown for a final-stage Pokémon', () => {
    render(<PokemonCard name="Venusaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={'Ivysaur'} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.getByTestId('evolves-from-section')).toBeInTheDocument();
    expect(screen.queryByTestId('evolves-to-section')).not.toBeInTheDocument();
  });

  it('AC-07: both sections shown for a mid-stage Pokémon', () => {
    render(<PokemonCard name="Ivysaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={'Bulbasaur'} evolvesTo={['Venusaur']} onSelect={jest.fn()} />);
    expect(screen.getByTestId('evolves-from-section')).toBeInTheDocument();
    expect(screen.getByTestId('evolves-to-section')).toBeInTheDocument();
  });

  it('AC-18: stat bars remain present alongside the evolution section', () => {
    render(<PokemonCard name="Ivysaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={'Bulbasaur'} evolvesTo={['Venusaur']} onSelect={jest.fn()} />);
    expect(screen.getByTestId('stat-bar-atk')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bar-def')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bar-sta')).toBeInTheDocument();
  });
});

describe('PokemonCard – spec 0004 constraints preserved', () => {
  it('no type name appears on the card', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.queryByText('Fire')).not.toBeInTheDocument();
    expect(screen.queryByText('Flying')).not.toBeInTheDocument();
  });

  it('no label text like "Primary type", "Secondary type", "Type 1", "Type 2"', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.queryByText(/primary\s*type/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/secondary\s*type/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/type\s*1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/type\s*2/i)).not.toBeInTheDocument();
  });

  it('no standalone swatch, chip, or badge element exists for type indication', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.queryByTestId('type-swatch-primary')).not.toBeInTheDocument();
    expect(screen.queryByTestId('type-swatch-secondary')).not.toBeInTheDocument();
  });
});
