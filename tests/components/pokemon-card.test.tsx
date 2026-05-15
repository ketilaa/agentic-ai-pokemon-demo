/**
 * @jest-environment jsdom
 */
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PokemonCard } from '../../src/components/pokemon-card';
import type { AttackerRoleTier, MoveEntry, PokemonStats, PokemonType, StatMaxima, TierLabel } from '../../src/domain/pokemon-catalog';
import { TYPE_COLORS } from '../../src/domain/pokemon-catalog';

// spec 0005: AC-02–AC-10
// spec 0006: AC-04–AC-08
// spec 0007: AC-07–AC-10, AC-18
// spec 0008 automated: AC-01, AC-02, AC-03 (updated: card-level tint now 0), AC-04, AC-05, AC-06, AC-07,
//   AC-08, AC-09, AC-11, AC-13, AC-15, AC-16, AC-19 (updated: card-header testid)
// spec 0008 manual QA only: AC-10 (centralized theme — verified via constants matching TYPE_COLORS),
//   AC-12 (375 px viewport), AC-14 (visual cohesion), AC-17 (next build), AC-18 (network)
// spec 0009: AC-08, AC-09, AC-11, AC-12
// spec 0010 automated: AC-01–AC-06, AC-11–AC-14, AC-15, AC-16, AC-20
// spec 0010 AC-19: inverted by spec 0011 — see spec 0011 AC-01 below
// spec 0010 manual QA only: AC-17 (name legibility for dark types), AC-18 (stat bar visual contrast)
// spec 0011 automated: AC-01, AC-02, AC-03, AC-05, AC-11 (image check), AC-12
// spec 0011 manual QA only: AC-09, AC-10 (visual legibility), AC-13 (375px viewport), AC-14 (desktop max width)

// Color constants must match TYPE_COLORS in pokemon-catalog.ts (AC-10 proxy)
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
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-content-section')).toBeInTheDocument();
  });

  it('AC-05: header section contains the Pokémon name', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const header = screen.getByTestId('card-header');
    expect(within(header).getByText('Charizard')).toBeInTheDocument();
  });

  it('AC-06: card container carries primary type color for a single-type Pokémon', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const card = screen.getByTestId('pokemon-card');
    expect(card).toHaveAttribute('data-border-primary-color', '#E62829');
    expect(card).toHaveAttribute('data-border-secondary-color', '');
  });

  it('AC-06: card container carries both type colors for a dual-type Pokémon', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const card = screen.getByTestId('pokemon-card');
    expect(card).toHaveAttribute('data-border-primary-color', '#E62829');
    expect(card).toHaveAttribute('data-border-secondary-color', '#81B9EF');
  });

  // 0005-AC-07: prefixed to disambiguate from spec 0008 AC-07
  it('0005-AC-07: content section does not carry type color attributes', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const content = screen.getByTestId('card-content-section');
    expect(content).not.toHaveAttribute('data-border-primary-color');
    expect(content).not.toHaveAttribute('data-tint-color');
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

describe('PokemonCard – type visual language (spec 0008)', () => {
  // AC-12 (375 px viewport rendering) and AC-14 (dual-type visual cohesion) require
  // manual visual QA — they cannot be verified in a jsdom environment.
  // AC-03 updated (spec 0010): card-level tint is now 0; tint has moved to card-header.

  it('AC-01: card border carries the primary type color', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.getByTestId('pokemon-card')).toHaveAttribute('data-border-primary-color', '#E62829');
  });

  it('AC-02: card exposes a tint color derived from the primary type', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.getByTestId('pokemon-card')).toHaveAttribute('data-tint-color', '#E62829');
  });

  it('AC-03: card container tint opacity is 0 (tint retired to card-header in spec 0010)', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const opacity = parseFloat(screen.getByTestId('pokemon-card').getAttribute('data-tint-opacity') ?? '1');
    expect(opacity).toBe(0);
  });

  it('AC-04/AC-06: primary border covers more sides than secondary for a dual-type Pokémon', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const card = screen.getByTestId('pokemon-card');
    expect(card).toHaveAttribute('data-border-primary-color', '#E62829');
    expect(card).toHaveAttribute('data-border-secondary-color', '#81B9EF');
    const primarySides = parseInt(card.getAttribute('data-border-primary-sides') ?? '0');
    const secondarySides = parseInt(card.getAttribute('data-border-secondary-sides') ?? '0');
    expect(primarySides).toBeGreaterThan(secondarySides);
  });

  it('AC-05: tint color is primary type only for a dual-type Pokémon', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const card = screen.getByTestId('pokemon-card');
    expect(card).toHaveAttribute('data-tint-color', '#E62829');
    expect(card.getAttribute('data-tint-color')).not.toBe('#81B9EF');
  });

  it('AC-07: no standalone type indicator exists on the card', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.queryByTestId('type-swatch-primary')).not.toBeInTheDocument();
    expect(screen.queryByTestId('type-swatch-secondary')).not.toBeInTheDocument();
    expect(screen.queryByTestId(/type-indicator|type-badge|type-legend/)).not.toBeInTheDocument();
  });

  it('AC-08: no type name or label appears on the card', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.queryByText('Fire')).not.toBeInTheDocument();
    expect(screen.queryByText('Flying')).not.toBeInTheDocument();
    expect(screen.queryByText(/^type$/i)).not.toBeInTheDocument();
  });

  it('AC-09: no legend, tooltip, or explanatory annotation for type color is present', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(screen.queryByTestId(/type-legend|type-annotation|type-explanation/)).not.toBeInTheDocument();
  });

  it('AC-11: Pokémon name uses a theme color token, not a type-derived color', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.getByText('Charmander')).toHaveAttribute('data-name-color-source', 'theme');
  });

  it('AC-13: single-type card has no secondary border color or secondary border sides', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const card = screen.getByTestId('pokemon-card');
    expect(card).toHaveAttribute('data-border-secondary-color', '');
    expect(card).toHaveAttribute('data-border-secondary-sides', '0');
  });

  it('AC-15/AC-16: stat bars and evolution section remain present with new visual treatment', () => {
    render(<PokemonCard name="Ivysaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom="Bulbasaur" evolvesTo={['Venusaur']} onSelect={jest.fn()} />);
    expect(screen.getByTestId('stat-bar-atk')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bar-def')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bar-sta')).toBeInTheDocument();
    expect(screen.getByTestId('evolution-section')).toBeInTheDocument();
  });

  it('AC-19: card container has no data-background attribute; card-header has no data-background attribute', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const card = screen.getByTestId('pokemon-card');
    expect(card).not.toHaveAttribute('data-background');
    expect(screen.getByTestId('card-header')).not.toHaveAttribute('data-background');
  });
});

describe('PokemonCard – image (spec 0009 AC-08, AC-09, AC-12)', () => {
  const IMAGE_URL = 'https://raw.githubusercontent.com/pokemon-go-api/assets/main/Pokemon/pm1.icon.png';

  it('AC-08: when imageUrl is non-null, card renders an image element with the correct src', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} imageUrl={IMAGE_URL} onSelect={jest.fn()} />);
    const img = screen.getByTestId('pokemon-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', IMAGE_URL);
  });

  it('AC-09: when imageUrl is null, no image element is rendered', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} imageUrl={null} onSelect={jest.fn()} />);
    expect(screen.queryByTestId('pokemon-image')).not.toBeInTheDocument();
  });

  it('AC-09: when imageUrl is omitted, no image element is rendered', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.queryByTestId('pokemon-image')).not.toBeInTheDocument();
  });

  it('AC-12: image element has no click handler and is aria-hidden (decorative)', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} imageUrl={IMAGE_URL} onSelect={jest.fn()} />);
    const img = screen.getByTestId('pokemon-image');
    expect(img).toHaveAttribute('aria-hidden', 'true');
    expect(img).toHaveAttribute('alt', '');
  });

  it('AC-11: name and stat bars remain present when image is displayed', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} imageUrl={IMAGE_URL} onSelect={jest.fn()} />);
    expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bar-atk')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bar-def')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bar-sta')).toBeInTheDocument();
  });

  it('AC-11: evolution chain navigation remains present when image is displayed', () => {
    render(<PokemonCard name="Ivysaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom="Bulbasaur" evolvesTo={['Venusaur']} imageUrl={IMAGE_URL} onSelect={jest.fn()} />);
    expect(screen.getByTestId('evolution-section')).toBeInTheDocument();
    expect(screen.getByTestId('evolves-from-section')).toBeInTheDocument();
    expect(screen.getByTestId('evolves-to-section')).toBeInTheDocument();
  });
});

describe('PokemonCard – typed visual identity (spec 0010)', () => {
  // AC-17 (name legibility for dark types) and AC-18 (stat bar visual contrast)
  // require manual QA — they cannot be verified in a jsdom environment.

  const IMAGE_URL = 'https://raw.githubusercontent.com/pokemon-go-api/assets/main/Pokemon/pm1.icon.png';

  it('AC-01: card has a card-header region containing the Pokémon name', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(within(screen.getByTestId('card-header')).getByText('Charizard')).toBeInTheDocument();
  });

  it('AC-02: card-content-section contains all three stat bars', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const content = screen.getByTestId('card-content-section');
    expect(within(content).getByTestId('stat-bar-atk')).toBeInTheDocument();
    expect(within(content).getByTestId('stat-bar-def')).toBeInTheDocument();
    expect(within(content).getByTestId('stat-bar-sta')).toBeInTheDocument();
  });

  it('AC-03: Pokémon name does not appear in the content region', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const content = screen.getByTestId('card-content-section');
    expect(within(content).queryByText('Charizard')).not.toBeInTheDocument();
  });

  it('AC-04: card-header carries data-header-tint-color equal to primary type color', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.getByTestId('card-header')).toHaveAttribute('data-header-tint-color', '#E62829');
  });

  it('AC-04: header tint color reflects the primary type for a dual-type Pokémon', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.getByTestId('card-header')).toHaveAttribute('data-header-tint-color', '#E62829');
  });

  it('AC-05: header tint opacity is below saturation threshold (< 0.5)', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const opacity = parseFloat(screen.getByTestId('card-header').getAttribute('data-header-tint-opacity') ?? '1');
    expect(opacity).toBeLessThan(0.5);
  });

  it('AC-06: header tint opacity exceeds visibility threshold (> 0.15)', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const opacity = parseFloat(screen.getByTestId('card-header').getAttribute('data-header-tint-opacity') ?? '0');
    expect(opacity).toBeGreaterThan(0.15);
  });

  it('AC-11: card container carries no type-derived background (data-tint-opacity is 0)', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const opacity = parseFloat(screen.getByTestId('pokemon-card').getAttribute('data-tint-opacity') ?? '1');
    expect(opacity).toBe(0);
  });

  it('AC-12: content region carries no type-derived tint (data-content-tint-opacity is 0)', () => {
    render(<PokemonCard name="Charmander" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const opacity = parseFloat(screen.getByTestId('card-content-section').getAttribute('data-content-tint-opacity') ?? '1');
    expect(opacity).toBe(0);
  });

  it('AC-13: stat bars are present inside the content region', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const content = screen.getByTestId('card-content-section');
    expect(within(content).getByTestId('stat-bar-atk')).toBeInTheDocument();
    expect(within(content).getByTestId('stat-bar-def')).toBeInTheDocument();
    expect(within(content).getByTestId('stat-bar-sta')).toBeInTheDocument();
  });

  it('AC-14: evolution chain navigation is present inside the content region', () => {
    render(<PokemonCard name="Ivysaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom="Bulbasaur" evolvesTo={['Venusaur']} onSelect={jest.fn()} />);
    const content = screen.getByTestId('card-content-section');
    expect(within(content).getByTestId('evolves-from-section')).toBeInTheDocument();
    expect(within(content).getByTestId('evolves-to-section')).toBeInTheDocument();
  });

  it('AC-15: no type name appears anywhere on the card', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.queryByText('Fire')).not.toBeInTheDocument();
    expect(screen.queryByText('Flying')).not.toBeInTheDocument();
  });

  it('AC-16: no standalone type indicator is rendered on the card', () => {
    render(<PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    expect(screen.queryByTestId(/type-badge|type-chip|type-swatch|type-dot/)).not.toBeInTheDocument();
  });

  it('AC-19 (superseded by spec 0011 AC-01): image is now inside card-header — see spec 0011 tests', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} imageUrl={IMAGE_URL} onSelect={jest.fn()} />);
    expect(screen.getByTestId('pokemon-image')).toBeInTheDocument();
    expect(within(screen.getByTestId('card-header')).getByTestId('pokemon-image')).toBeInTheDocument();
  });

  it('AC-20: no image element is rendered when imageUrl is null', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} imageUrl={null} onSelect={jest.fn()} />);
    expect(screen.queryByTestId('pokemon-image')).not.toBeInTheDocument();
  });
});

describe('PokemonCard – header image and responsive width (spec 0011)', () => {
  const IMAGE_URL = 'https://raw.githubusercontent.com/pokemon-go-api/assets/main/Pokemon/pm1.icon.png';

  it('AC-01: when imageUrl is non-null, pokemon-image is a descendant of card-header', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} imageUrl={IMAGE_URL} onSelect={jest.fn()} />);
    expect(within(screen.getByTestId('card-header')).getByTestId('pokemon-image')).toBeInTheDocument();
  });

  it('AC-02: when imageUrl is non-null, no image element is inside card-content-section', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} imageUrl={IMAGE_URL} onSelect={jest.fn()} />);
    expect(within(screen.getByTestId('card-content-section')).queryByRole('img')).not.toBeInTheDocument();
  });

  it('AC-03: no image element is a sibling preceding card-header', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} imageUrl={IMAGE_URL} onSelect={jest.fn()} />);
    const header = screen.getByTestId('card-header');
    const card = screen.getByTestId('pokemon-card');
    const childrenBeforeHeader = Array.from(card.children).slice(0, Array.from(card.children).indexOf(header));
    const imgBeforeHeader = childrenBeforeHeader.some((el) => el.tagName === 'IMG' || el.querySelector('img'));
    expect(imgBeforeHeader).toBe(false);
  });

  it('AC-04: when imageUrl is null, no image element is rendered anywhere on the card', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} imageUrl={null} onSelect={jest.fn()} />);
    expect(screen.queryByTestId('pokemon-image')).not.toBeInTheDocument();
    expect(screen.getByTestId('card-header').querySelector('img')).toBeNull();
  });

  it('AC-05: image carries aria-hidden="true" and data-image-crop="none"', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} imageUrl={IMAGE_URL} onSelect={jest.fn()} />);
    const img = screen.getByTestId('pokemon-image');
    expect(img).toHaveAttribute('aria-hidden', 'true');
    expect(img).toHaveAttribute('data-image-crop', 'none');
  });

  it('AC-11: content section carries no image element when imageUrl is non-null', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} imageUrl={IMAGE_URL} onSelect={jest.fn()} />);
    const content = screen.getByTestId('card-content-section');
    expect(content.querySelector('img')).toBeNull();
    const opacity = parseFloat(content.getAttribute('data-content-tint-opacity') ?? '1');
    expect(opacity).toBe(0);
  });

  it('AC-12: card container carries data-max-width with a finite positive integer value', () => {
    render(<PokemonCard name="Bulbasaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA} evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />);
    const card = screen.getByTestId('pokemon-card');
    const maxWidth = parseInt(card.getAttribute('data-max-width') ?? '0');
    expect(maxWidth).toBeGreaterThan(0);
    expect(Number.isFinite(maxWidth)).toBe(true);
  });
});

describe('PokemonCard – move list (spec 0013)', () => {
  // AC-20 (visual group distinguishability), AC-21 (elite legibility), AC-24 (label hierarchy),
  // AC-27 (stat bar dominance), AC-28 (375px overflow), and AC-30 (next build) require manual QA.

  const QUICK_MOVES: MoveEntry[] = [
    { name: 'Air Slash', typeId: 'Flying', isElite: false, isRecommended: true },
    { name: 'Ember', typeId: 'Fire', isElite: true, isRecommended: false },
  ];
  const CHARGED_MOVES: MoveEntry[] = [
    { name: 'Flamethrower', typeId: 'Fire', isElite: false, isRecommended: false },
    { name: 'Dragon Claw', typeId: 'Dragon', isElite: false, isRecommended: false },
    { name: 'Overheat', typeId: 'Fire', isElite: true, isRecommended: true },
  ];

  // AC-01: move-section inside card-content-section
  it('AC-01: move-section is present inside card-content-section when Pokémon has moves', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    const content = screen.getByTestId('card-content-section');
    expect(within(content).getByTestId('move-section')).toBeInTheDocument();
  });

  // AC-02: move-section not inside card-header
  it('AC-02: move-section is not inside card-header', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    expect(within(screen.getByTestId('card-header')).queryByTestId('move-section')).not.toBeInTheDocument();
  });

  // AC-03: move-section follows stat-bar-sta in DOM order
  it('AC-03: move-section appears after stat-bar-sta in document order', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    const content = screen.getByTestId('card-content-section');
    const allNodes = Array.from(content.querySelectorAll('[data-testid]'));
    const staIdx = allNodes.findIndex((n) => n.getAttribute('data-testid') === 'stat-bar-sta');
    const sectionIdx = allNodes.findIndex((n) => n.getAttribute('data-testid') === 'move-section');
    expect(sectionIdx).toBeGreaterThan(staIdx);
  });

  // AC-04: move-section absent when both pools empty (test fixture)
  it('AC-04: move-section is absent when both quick and charged move pools are empty', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={[]} chargedMoves={[]} onSelect={jest.fn()} />
    );
    expect(screen.queryByTestId('move-section')).not.toBeInTheDocument();
  });

  it('AC-04: move-section is absent when move props are omitted', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} onSelect={jest.fn()} />
    );
    expect(screen.queryByTestId('move-section')).not.toBeInTheDocument();
  });

  // AC-05: move-type-section (iteration 12 element) is retired
  it('AC-05: no element with testid move-type-section is present on the card', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    expect(screen.queryByTestId('move-type-section')).not.toBeInTheDocument();
  });

  // AC-06: quick-moves-group present inside move-section
  it('AC-06: quick-moves-group is present inside move-section when Pokémon has quick moves', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={[]} onSelect={jest.fn()} />
    );
    expect(within(screen.getByTestId('move-section')).getByTestId('quick-moves-group')).toBeInTheDocument();
  });

  // AC-07: one move-item per unique quick move
  it('AC-07: quick-moves-group contains exactly one move-item per unique quick move', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={[]} onSelect={jest.fn()} />
    );
    const items = within(screen.getByTestId('quick-moves-group')).getAllByTestId('move-item');
    expect(items).toHaveLength(QUICK_MOVES.length);
  });

  // AC-08: each move-item in quick-moves-group has correct data-move-name
  it('AC-08: each move-item in quick-moves-group carries data-move-name equal to the move name', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={[]} onSelect={jest.fn()} />
    );
    const items = within(screen.getByTestId('quick-moves-group')).getAllByTestId('move-item');
    const names = items.map((i) => i.getAttribute('data-move-name'));
    for (const move of QUICK_MOVES) expect(names).toContain(move.name);
  });

  // AC-09: no duplicate data-move-name in quick-moves-group
  it('AC-09: no two items in quick-moves-group share the same data-move-name', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={[]} onSelect={jest.fn()} />
    );
    const items = within(screen.getByTestId('quick-moves-group')).getAllByTestId('move-item');
    const names = items.map((i) => i.getAttribute('data-move-name'));
    expect(new Set(names).size).toBe(names.length);
  });

  // AC-10: quick-moves-group absent when no quick moves
  it('AC-10: quick-moves-group is absent when quick move pool is empty', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={[]} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    expect(screen.queryByTestId('quick-moves-group')).not.toBeInTheDocument();
  });

  it('quick-moves-label is absent when quick-moves-group is absent', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={[]} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    expect(screen.queryByTestId('quick-moves-label')).not.toBeInTheDocument();
  });

  // AC-11: charged-moves-group present inside move-section
  it('AC-11: charged-moves-group is present inside move-section when Pokémon has charged moves', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={[]} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    expect(within(screen.getByTestId('move-section')).getByTestId('charged-moves-group')).toBeInTheDocument();
  });

  // AC-12: one move-item per unique charged move
  it('AC-12: charged-moves-group contains exactly one move-item per unique charged move', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={[]} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    const items = within(screen.getByTestId('charged-moves-group')).getAllByTestId('move-item');
    expect(items).toHaveLength(CHARGED_MOVES.length);
  });

  // AC-13: each move-item in charged-moves-group has correct data-move-name
  it('AC-13: each move-item in charged-moves-group carries data-move-name equal to the move name', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={[]} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    const items = within(screen.getByTestId('charged-moves-group')).getAllByTestId('move-item');
    const names = items.map((i) => i.getAttribute('data-move-name'));
    for (const move of CHARGED_MOVES) expect(names).toContain(move.name);
  });

  // AC-14: no duplicate data-move-name in charged-moves-group
  it('AC-14: no two items in charged-moves-group share the same data-move-name', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={[]} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    const items = within(screen.getByTestId('charged-moves-group')).getAllByTestId('move-item');
    const names = items.map((i) => i.getAttribute('data-move-name'));
    expect(new Set(names).size).toBe(names.length);
  });

  // AC-15: charged-moves-group absent when no charged moves
  it('AC-15: charged-moves-group is absent when charged move pool is empty', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={[]} onSelect={jest.fn()} />
    );
    expect(screen.queryByTestId('charged-moves-group')).not.toBeInTheDocument();
  });

  it('charged-moves-label is absent when charged-moves-group is absent', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={[]} onSelect={jest.fn()} />
    );
    expect(screen.queryByTestId('charged-moves-label')).not.toBeInTheDocument();
  });

  // AC-16: data-move-type matches the move's typeId
  it('AC-16: each move-item carries data-move-type equal to the move typeId', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    const allItems = screen.getAllByTestId('move-item');
    const allMoves = [...QUICK_MOVES, ...CHARGED_MOVES];
    for (const item of allItems) {
      const moveName = item.getAttribute('data-move-name');
      const expected = allMoves.find((m) => m.name === moveName);
      expect(item.getAttribute('data-move-type')).toBe(expected?.typeId);
    }
  });

  // AC-17: every data-move-type is a key in TYPE_COLORS
  it('AC-17: every data-move-type value is a key in TYPE_COLORS', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    for (const item of screen.getAllByTestId('move-item')) {
      expect(TYPE_COLORS).toHaveProperty(item.getAttribute('data-move-type')!);
    }
  });

  // AC-18: elite move item carries data-is-elite="true"
  it('AC-18: elite move item carries data-is-elite="true"', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    const eliteNames = [...QUICK_MOVES, ...CHARGED_MOVES].filter((m) => m.isElite).map((m) => m.name);
    for (const item of screen.getAllByTestId('move-item')) {
      if (eliteNames.includes(item.getAttribute('data-move-name')!)) {
        expect(item.getAttribute('data-is-elite')).toBe('true');
      }
    }
  });

  // AC-19: non-elite move item carries data-is-elite="false"
  it('AC-19: non-elite move item carries data-is-elite="false"', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    const nonEliteNames = [...QUICK_MOVES, ...CHARGED_MOVES].filter((m) => !m.isElite).map((m) => m.name);
    for (const item of screen.getAllByTestId('move-item')) {
      if (nonEliteNames.includes(item.getAttribute('data-move-name')!)) {
        expect(item.getAttribute('data-is-elite')).toBe('false');
      }
    }
  });

  // AC-22: quick-moves-label present with correct text
  it('AC-22: quick-moves-label is present with text "Quick moves" when quick moves exist', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={[]} onSelect={jest.fn()} />
    );
    const label = screen.getByTestId('quick-moves-label');
    expect(label).toBeInTheDocument();
    expect(label.textContent).toBe('Quick moves');
  });

  // AC-23: charged-moves-label present with correct text
  it('AC-23: charged-moves-label is present with text "Charged moves" when charged moves exist', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={[]} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    const label = screen.getByTestId('charged-moves-label');
    expect(label).toBeInTheDocument();
    expect(label.textContent).toBe('Charged moves');
  });

  // AC-25: no numeric move statistics in move-section
  it('AC-25: no numeric content appears inside move-section', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    const text = screen.getByTestId('move-section').textContent ?? '';
    expect(text).not.toMatch(/\b\d+\b/);
  });

  // AC-26: no type name text inside any move-item
  it('AC-26: no move-item text content equals a type name', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    const typeNames = Object.keys(TYPE_COLORS);
    for (const item of screen.getAllByTestId('move-item')) {
      expect(typeNames).not.toContain(item.textContent);
    }
  });

  // AC-29: content region data-content-tint-opacity remains 0
  it('AC-29: card-content-section data-content-tint-opacity remains 0 with move section', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    const opacity = parseFloat(screen.getByTestId('card-content-section').getAttribute('data-content-tint-opacity') ?? '1');
    expect(opacity).toBe(0);
  });

  // Both groups present when both pools non-empty
  it('both quick-moves-group and charged-moves-group are present when both pools are non-empty', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_MOVES} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    expect(screen.getByTestId('quick-moves-group')).toBeInTheDocument();
    expect(screen.getByTestId('charged-moves-group')).toBeInTheDocument();
  });

  // Stat bars and evolution remain intact
  it('stat bars remain present when move section is displayed', () => {
    render(
      <PokemonCard name="Ivysaur" primaryType={GRASS} secondaryType={POISON} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom="Bulbasaur" evolvesTo={['Venusaur']} quickMoves={QUICK_MOVES} chargedMoves={CHARGED_MOVES} onSelect={jest.fn()} />
    );
    expect(screen.getByTestId('stat-bar-atk')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bar-def')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bar-sta')).toBeInTheDocument();
    expect(screen.getByTestId('evolution-section')).toBeInTheDocument();
  });
});

describe('PokemonCard – move recommendation and elite clarification (spec 0014)', () => {
  // AC-07, AC-08, AC-10, AC-16, AC-17, AC-21, AC-22 require manual QA.

  const QUICK_14: MoveEntry[] = [
    { name: 'Ember', typeId: 'Fire', isElite: false, isRecommended: true },
    { name: 'Air Slash', typeId: 'Flying', isElite: true, isRecommended: false },
  ];
  const CHARGED_14: MoveEntry[] = [
    { name: 'Overheat', typeId: 'Fire', isElite: true, isRecommended: true },
    { name: 'Dragon Claw', typeId: 'Dragon', isElite: false, isRecommended: false },
    { name: 'Flamethrower', typeId: 'Fire', isElite: false, isRecommended: false },
  ];

  // AC-01: every move-item in quick-moves-group has data-is-recommended attribute
  it('AC-01: every move-item in quick-moves-group carries data-is-recommended attribute', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_14} chargedMoves={[]} onSelect={jest.fn()} />
    );
    const items = within(screen.getByTestId('quick-moves-group')).getAllByTestId('move-item');
    for (const item of items) {
      const val = item.getAttribute('data-is-recommended');
      expect(val === 'true' || val === 'false').toBe(true);
    }
  });

  // AC-02: exactly one quick move has data-is-recommended="true" when pool is non-empty
  it('AC-02: exactly one move-item in quick-moves-group has data-is-recommended="true"', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_14} chargedMoves={[]} onSelect={jest.fn()} />
    );
    const items = within(screen.getByTestId('quick-moves-group')).getAllByTestId('move-item');
    expect(items.filter((i) => i.getAttribute('data-is-recommended') === 'true')).toHaveLength(1);
  });

  // AC-04: every move-item in charged-moves-group has data-is-recommended attribute
  it('AC-04: every move-item in charged-moves-group carries data-is-recommended attribute', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={[]} chargedMoves={CHARGED_14} onSelect={jest.fn()} />
    );
    const items = within(screen.getByTestId('charged-moves-group')).getAllByTestId('move-item');
    for (const item of items) {
      const val = item.getAttribute('data-is-recommended');
      expect(val === 'true' || val === 'false').toBe(true);
    }
  });

  // AC-05: exactly one charged move has data-is-recommended="true" when pool is non-empty
  it('AC-05: exactly one move-item in charged-moves-group has data-is-recommended="true"', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={[]} chargedMoves={CHARGED_14} onSelect={jest.fn()} />
    );
    const items = within(screen.getByTestId('charged-moves-group')).getAllByTestId('move-item');
    expect(items.filter((i) => i.getAttribute('data-is-recommended') === 'true')).toHaveLength(1);
  });

  // AC-03: no data-is-recommended="true" in quick position when quick group is absent
  it('AC-03: no move-item with data-is-recommended="true" in quick position when quick pool is empty', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={[]} chargedMoves={CHARGED_14} onSelect={jest.fn()} />
    );
    expect(screen.queryByTestId('quick-moves-group')).not.toBeInTheDocument();
    const allItems = within(screen.getByTestId('move-section')).getAllByTestId('move-item');
    expect(allItems.every((i) => i.closest('[data-testid="charged-moves-group"]') !== null)).toBe(true);
  });

  // AC-06: no data-is-recommended="true" in charged position when charged group is absent
  it('AC-06: no move-item with data-is-recommended="true" in charged position when charged pool is empty', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_14} chargedMoves={[]} onSelect={jest.fn()} />
    );
    expect(screen.queryByTestId('charged-moves-group')).not.toBeInTheDocument();
  });

  // AC-09: recommended emphasis contains no label, badge, icon, or explanatory text
  it('AC-09: recommended move-item contains only the move name as text content', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_14} chargedMoves={CHARGED_14} onSelect={jest.fn()} />
    );
    const recommended = screen.getAllByTestId('move-item').filter((i) => i.getAttribute('data-is-recommended') === 'true');
    for (const item of recommended) {
      const moveName = item.getAttribute('data-move-name');
      expect(item.textContent).toBe(moveName);
    }
  });

  // AC-11: elite move renders name in italic style (data-is-elite="true")
  it('AC-11: move-item with data-is-elite="true" has italic font style', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_14} chargedMoves={CHARGED_14} onSelect={jest.fn()} />
    );
    const eliteItems = screen.getAllByTestId('move-item').filter((i) => i.getAttribute('data-is-elite') === 'true');
    for (const item of eliteItems) {
      expect(item).toHaveStyle({ fontStyle: 'italic' });
    }
  });

  // AC-12: non-elite move does not render in italic
  it('AC-12: move-item with data-is-elite="false" does not have italic font style', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_14} chargedMoves={CHARGED_14} onSelect={jest.fn()} />
    );
    const nonEliteItems = screen.getAllByTestId('move-item').filter((i) => i.getAttribute('data-is-elite') === 'false');
    for (const item of nonEliteItems) {
      expect(item).not.toHaveStyle({ fontStyle: 'italic' });
    }
  });

  // AC-13: no icon/badge/border element on elite move items
  it('AC-13: data-is-elite="true" move-item has no child elements (no icon, badge, or decorative indicator)', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_14} chargedMoves={CHARGED_14} onSelect={jest.fn()} />
    );
    const eliteItems = screen.getAllByTestId('move-item').filter((i) => i.getAttribute('data-is-elite') === 'true');
    for (const item of eliteItems) {
      expect(item.children).toHaveLength(0);
    }
  });

  // AC-14: no legend or label explaining elite status anywhere on the card
  it('AC-14: no element explains the Elite or recommended status on the card', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_14} chargedMoves={CHARGED_14} onSelect={jest.fn()} />
    );
    expect(screen.queryByText(/elite/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/recommended/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/best move/i)).not.toBeInTheDocument();
  });

  // AC-15: a move can be both elite and recommended
  it('AC-15: a move that is both elite and recommended carries both data-is-elite="true" and data-is-recommended="true"', () => {
    const COMBINED: MoveEntry[] = [
      { name: 'Overheat', typeId: 'Fire', isElite: true, isRecommended: true },
      { name: 'Dragon Claw', typeId: 'Dragon', isElite: false, isRecommended: false },
    ];
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={[]} chargedMoves={COMBINED} onSelect={jest.fn()} />
    );
    const items = within(screen.getByTestId('charged-moves-group')).getAllByTestId('move-item');
    const overheat = items.find((i) => i.getAttribute('data-move-name') === 'Overheat');
    expect(overheat?.getAttribute('data-is-elite')).toBe('true');
    expect(overheat?.getAttribute('data-is-recommended')).toBe('true');
  });

  // AC-19: no numeric content in move-section
  it('AC-19: no numeric content appears inside move-section', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_14} chargedMoves={CHARGED_14} onSelect={jest.fn()} />
    );
    const text = screen.getByTestId('move-section').textContent ?? '';
    expect(text).not.toMatch(/\b\d+\b/);
  });

  // AC-20: no explanatory text about signals outside move-item boundaries
  it('AC-20: move-section contains no explanatory text about recommendation or Elite outside move items', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={QUICK_14} chargedMoves={CHARGED_14} onSelect={jest.fn()} />
    );
    const moveSection = screen.getByTestId('move-section');
    // Check all text nodes not inside a move-item
    const allText = Array.from(moveSection.querySelectorAll('*'))
      .filter((el) => !el.closest('[data-testid="move-item"]'))
      .map((el) => el.textContent ?? '')
      .join(' ');
    expect(allText).not.toMatch(/elite/i);
    expect(allText).not.toMatch(/recommended/i);
    expect(allText).not.toMatch(/best/i);
  });
});

describe('PokemonCard – role-tier section (spec 0018)', () => {
  const ROCK: PokemonType = { name: 'Rock', color: '#AFA981' };
  const DARK: PokemonType = { name: 'Dark', color: '#624D4E' };

  const DUAL_ROLES: AttackerRoleTier[] = [
    { typeId: 'Rock', tier: 'S' },
    { typeId: 'Dark', tier: 'A' },
  ];
  const DEF_TIER: TierLabel = 'B';

  it('AC-15: dual-role Pokémon renders two [data-role="attacker"] and one [data-role="defender"]', () => {
    render(
      <PokemonCard name="Tyranitar" primaryType={ROCK} secondaryType={DARK} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} attackerRoles={DUAL_ROLES} defenderTier={DEF_TIER} onSelect={jest.fn()} />
    );
    const attackerItems = document.querySelectorAll('[data-role="attacker"]');
    const defenderItems = document.querySelectorAll('[data-role="defender"]');
    expect(attackerItems).toHaveLength(2);
    expect(defenderItems).toHaveLength(1);
  });

  it('AC-16: attacker elements carry correct data-type-id and data-tier; defender carries correct data-tier', () => {
    render(
      <PokemonCard name="Tyranitar" primaryType={ROCK} secondaryType={DARK} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} attackerRoles={DUAL_ROLES} defenderTier={DEF_TIER} onSelect={jest.fn()} />
    );
    const rockItem = document.querySelector('[data-role="attacker"][data-type-id="Rock"]');
    const darkItem = document.querySelector('[data-role="attacker"][data-type-id="Dark"]');
    const defItem  = document.querySelector('[data-role="defender"]');
    expect(rockItem?.getAttribute('data-tier')).toBe('S');
    expect(darkItem?.getAttribute('data-tier')).toBe('A');
    expect(defItem?.getAttribute('data-tier')).toBe('B');
  });

  it('AC-17: Pokémon with no attacker roles renders no [data-role="attacker"] elements', () => {
    render(
      <PokemonCard name="Dragonite" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} attackerRoles={[]} defenderTier="C" onSelect={jest.fn()} />
    );
    expect(document.querySelectorAll('[data-role="attacker"]')).toHaveLength(0);
    expect(document.querySelectorAll('[data-role="defender"]')).toHaveLength(1);
  });

  it('AC-19: role-tier section contains no explanatory text labels', () => {
    render(
      <PokemonCard name="Tyranitar" primaryType={ROCK} secondaryType={DARK} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} attackerRoles={DUAL_ROLES} defenderTier={DEF_TIER} onSelect={jest.fn()} />
    );
    const section = screen.getByTestId('role-tier-section');
    const text = section.textContent ?? '';
    expect(text).not.toMatch(/attacker|defender|tier|best|role/i);
  });

  it('AC-20: role-tier section contains no numeric stat values', () => {
    render(
      <PokemonCard name="Tyranitar" primaryType={ROCK} secondaryType={DARK} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} attackerRoles={DUAL_ROLES} defenderTier={DEF_TIER} onSelect={jest.fn()} />
    );
    const section = screen.getByTestId('role-tier-section');
    expect(section.textContent ?? '').not.toMatch(/\b\d+\b/);
  });

  it('role-tier-section is inside card-content-section', () => {
    render(
      <PokemonCard name="Tyranitar" primaryType={ROCK} secondaryType={DARK} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} attackerRoles={DUAL_ROLES} defenderTier={DEF_TIER} onSelect={jest.fn()} />
    );
    const content = screen.getByTestId('card-content-section');
    expect(within(content).getByTestId('role-tier-section')).toBeInTheDocument();
  });

  it('role-tier-section appears after stat-bar-sta and before move-section in document order', () => {
    render(
      <PokemonCard name="Tyranitar" primaryType={ROCK} secondaryType={DARK} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={[{ name: 'Bite', typeId: 'Dark', isElite: false, isRecommended: true }]}
        chargedMoves={[{ name: 'Crunch', typeId: 'Dark', isElite: false, isRecommended: true }]}
        attackerRoles={DUAL_ROLES} defenderTier={DEF_TIER} onSelect={jest.fn()} />
    );
    const content = screen.getByTestId('card-content-section');
    const nodes = Array.from(content.querySelectorAll('[data-testid]'));
    const staIdx   = nodes.findIndex((n) => n.getAttribute('data-testid') === 'stat-bar-sta');
    const tierIdx  = nodes.findIndex((n) => n.getAttribute('data-testid') === 'role-tier-section');
    const moveIdx  = nodes.findIndex((n) => n.getAttribute('data-testid') === 'move-section');
    expect(tierIdx).toBeGreaterThan(staIdx);
    expect(moveIdx).toBeGreaterThan(tierIdx);
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

describe('PokemonCard – role-anchored move recommendations (spec 0019)', () => {
  const ROCK: PokemonType = { name: 'Rock', color: '#AFA981' };
  const DARK: PokemonType = { name: 'Dark', color: '#624D4E' };

  const DUAL_ROLES: AttackerRoleTier[] = [
    { typeId: 'Rock', tier: 'S' },
    { typeId: 'Dark', tier: 'A' },
  ];

  // Tyranitar-like: two recommended per slot plus one non-recommended each
  const TYRANITAR_QUICK: MoveEntry[] = [
    { name: 'Smack Down', typeId: 'Rock', isElite: false, isRecommended: true },
    { name: 'Bite',       typeId: 'Dark', isElite: false, isRecommended: true },
    { name: 'Iron Tail',  typeId: 'Steel', isElite: false, isRecommended: false },
  ];
  const TYRANITAR_CHARGED: MoveEntry[] = [
    { name: 'Stone Edge', typeId: 'Rock', isElite: false, isRecommended: true },
    { name: 'Crunch',     typeId: 'Dark', isElite: false, isRecommended: true },
    { name: 'Fire Blast', typeId: 'Fire', isElite: false, isRecommended: false },
  ];

  // All moves recommended — standard groups must be absent
  const FIRE_FLYING_ROLES: AttackerRoleTier[] = [
    { typeId: 'Fire',   tier: 'A' },
    { typeId: 'Flying', tier: 'S' },
  ];
  const ALL_REC_QUICK: MoveEntry[] = [
    { name: 'Ember',     typeId: 'Fire',   isElite: false, isRecommended: true },
    { name: 'Air Slash', typeId: 'Flying', isElite: false, isRecommended: true },
  ];
  const ALL_REC_CHARGED: MoveEntry[] = [
    { name: 'Overheat',  typeId: 'Fire',   isElite: false, isRecommended: true },
    { name: 'Hurricane', typeId: 'Flying', isElite: false, isRecommended: true },
  ];

  // Smack Down is elite — verifies elite rendering is preserved inside role groups
  const ELITE_QUICK: MoveEntry[] = [
    { name: 'Smack Down', typeId: 'Rock', isElite: true,  isRecommended: true },
    { name: 'Bite',       typeId: 'Dark', isElite: false, isRecommended: true },
  ];
  const ELITE_CHARGED: MoveEntry[] = [
    { name: 'Stone Edge', typeId: 'Rock', isElite: false, isRecommended: true },
    { name: 'Crunch',     typeId: 'Dark', isElite: false, isRecommended: true },
  ];

  // Single-role fixture
  const SINGLE_ROLE: AttackerRoleTier[] = [{ typeId: 'Dark', tier: 'A' }];
  const SINGLE_QUICK: MoveEntry[] = [
    { name: 'Bite',      typeId: 'Dark', isElite: false, isRecommended: true },
    { name: 'Fire Fang', typeId: 'Fire', isElite: false, isRecommended: false },
  ];
  const SINGLE_CHARGED: MoveEntry[] = [
    { name: 'Night Slash', typeId: 'Dark',     isElite: false, isRecommended: true },
    { name: 'Thunder',     typeId: 'Electric', isElite: false, isRecommended: false },
  ];

  // Fallback fixture (attackerRoles: [])
  const FALLBACK_QUICK: MoveEntry[]   = [{ name: 'Tackle',     typeId: 'Normal', isElite: false, isRecommended: true }];
  const FALLBACK_CHARGED: MoveEntry[] = [{ name: 'Hyper Beam', typeId: 'Normal', isElite: false, isRecommended: true }];

  it('AC-01: dual-role Pokémon renders role-moveset-section inside move-section', () => {
    render(
      <PokemonCard name="Tyranitar" primaryType={ROCK} secondaryType={DARK} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={TYRANITAR_QUICK} chargedMoves={TYRANITAR_CHARGED}
        attackerRoles={DUAL_ROLES} defenderTier="B" onSelect={jest.fn()} />
    );
    expect(within(screen.getByTestId('move-section')).getByTestId('role-moveset-section')).toBeInTheDocument();
  });

  it('AC-02: single-role Pokémon does not render role-moveset-section', () => {
    render(
      <PokemonCard name="Absol" primaryType={DARK} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={SINGLE_QUICK} chargedMoves={SINGLE_CHARGED}
        attackerRoles={SINGLE_ROLE} defenderTier="C" onSelect={jest.fn()} />
    );
    expect(screen.queryByTestId('role-moveset-section')).not.toBeInTheDocument();
  });

  it('AC-03: fallback Pokémon (attackerRoles: []) does not render role-moveset-section', () => {
    render(
      <PokemonCard name="Fallback" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={FALLBACK_QUICK} chargedMoves={FALLBACK_CHARGED}
        attackerRoles={[]} defenderTier="C" onSelect={jest.fn()} />
    );
    expect(screen.queryByTestId('role-moveset-section')).not.toBeInTheDocument();
  });

  it('AC-04: role-moveset-section contains exactly one role-moveset-group per attacker role', () => {
    render(
      <PokemonCard name="Tyranitar" primaryType={ROCK} secondaryType={DARK} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={TYRANITAR_QUICK} chargedMoves={TYRANITAR_CHARGED}
        attackerRoles={DUAL_ROLES} defenderTier="B" onSelect={jest.fn()} />
    );
    expect(within(screen.getByTestId('role-moveset-section')).getAllByTestId('role-moveset-group')).toHaveLength(2);
  });

  it('AC-05: role-moveset-group elements appear in primary-type-first order (Rock then Dark)', () => {
    render(
      <PokemonCard name="Tyranitar" primaryType={ROCK} secondaryType={DARK} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={TYRANITAR_QUICK} chargedMoves={TYRANITAR_CHARGED}
        attackerRoles={DUAL_ROLES} defenderTier="B" onSelect={jest.fn()} />
    );
    const groups = within(screen.getByTestId('role-moveset-section')).getAllByTestId('role-moveset-group');
    expect(groups[0].getAttribute('data-role-type')).toBe('Rock');
    expect(groups[1].getAttribute('data-role-type')).toBe('Dark');
  });

  it('AC-06: each role-moveset-group contains a "[TypeId] attacker" label', () => {
    render(
      <PokemonCard name="Tyranitar" primaryType={ROCK} secondaryType={DARK} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={TYRANITAR_QUICK} chargedMoves={TYRANITAR_CHARGED}
        attackerRoles={DUAL_ROLES} defenderTier="B" onSelect={jest.fn()} />
    );
    const groups = within(screen.getByTestId('role-moveset-section')).getAllByTestId('role-moveset-group');
    expect(within(groups[0]).getByText('Rock attacker')).toBeInTheDocument();
    expect(within(groups[1]).getByText('Dark attacker')).toBeInTheDocument();
  });

  it('AC-07: no role label appears in move-section for a single-role Pokémon', () => {
    render(
      <PokemonCard name="Absol" primaryType={DARK} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={SINGLE_QUICK} chargedMoves={SINGLE_CHARGED}
        attackerRoles={SINGLE_ROLE} defenderTier="C" onSelect={jest.fn()} />
    );
    expect(within(screen.getByTestId('move-section')).queryByText(/attacker/)).toBeNull();
  });

  it('AC-08: no role label appears in move-section for a fallback Pokémon', () => {
    render(
      <PokemonCard name="Fallback" primaryType={FIRE} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={FALLBACK_QUICK} chargedMoves={FALLBACK_CHARGED}
        attackerRoles={[]} defenderTier="C" onSelect={jest.fn()} />
    );
    expect(within(screen.getByTestId('move-section')).queryByText(/attacker/)).toBeNull();
  });

  it('AC-09: each role-moveset-group contains exactly 2 recommended move items (Quick first, Charged second)', () => {
    render(
      <PokemonCard name="Tyranitar" primaryType={ROCK} secondaryType={DARK} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={TYRANITAR_QUICK} chargedMoves={TYRANITAR_CHARGED}
        attackerRoles={DUAL_ROLES} defenderTier="B" onSelect={jest.fn()} />
    );
    const groups = within(screen.getByTestId('role-moveset-section')).getAllByTestId('role-moveset-group');
    for (const group of groups) {
      const items = within(group).getAllByTestId('move-item');
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveAttribute('data-is-recommended', 'true');
      expect(items[1]).toHaveAttribute('data-is-recommended', 'true');
    }
  });

  it('AC-10: first move item (Quick) in each group has data-move-type matching the group data-role-type', () => {
    render(
      <PokemonCard name="Tyranitar" primaryType={ROCK} secondaryType={DARK} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={TYRANITAR_QUICK} chargedMoves={TYRANITAR_CHARGED}
        attackerRoles={DUAL_ROLES} defenderTier="B" onSelect={jest.fn()} />
    );
    const groups = within(screen.getByTestId('role-moveset-section')).getAllByTestId('role-moveset-group');
    for (const group of groups) {
      const items = within(group).getAllByTestId('move-item');
      expect(items[0]).toHaveAttribute('data-move-type', group.getAttribute('data-role-type'));
    }
  });

  it('AC-11: second move item (Charged) in each group has data-move-type matching the group data-role-type', () => {
    render(
      <PokemonCard name="Tyranitar" primaryType={ROCK} secondaryType={DARK} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={TYRANITAR_QUICK} chargedMoves={TYRANITAR_CHARGED}
        attackerRoles={DUAL_ROLES} defenderTier="B" onSelect={jest.fn()} />
    );
    const groups = within(screen.getByTestId('role-moveset-section')).getAllByTestId('role-moveset-group');
    for (const group of groups) {
      const items = within(group).getAllByTestId('move-item');
      expect(items[1]).toHaveAttribute('data-move-type', group.getAttribute('data-role-type'));
    }
  });

  it('AC-12: elite recommended move inside role-moveset-group carries data-is-elite="true" and data-is-recommended="true"', () => {
    render(
      <PokemonCard name="Tyranitar" primaryType={ROCK} secondaryType={DARK} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={ELITE_QUICK} chargedMoves={ELITE_CHARGED}
        attackerRoles={DUAL_ROLES} defenderTier="B" onSelect={jest.fn()} />
    );
    const groups = within(screen.getByTestId('role-moveset-section')).getAllByTestId('role-moveset-group');
    const rockGroup = groups.find((g) => g.getAttribute('data-role-type') === 'Rock')!;
    const smackDown = within(rockGroup).getAllByTestId('move-item').find((i) => i.getAttribute('data-move-name') === 'Smack Down');
    expect(smackDown).toHaveAttribute('data-is-elite', 'true');
    expect(smackDown).toHaveAttribute('data-is-recommended', 'true');
  });

  it('AC-13: quick-moves-group contains no recommended move items for a multi-role Pokémon', () => {
    render(
      <PokemonCard name="Tyranitar" primaryType={ROCK} secondaryType={DARK} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={TYRANITAR_QUICK} chargedMoves={TYRANITAR_CHARGED}
        attackerRoles={DUAL_ROLES} defenderTier="B" onSelect={jest.fn()} />
    );
    const items = within(screen.getByTestId('quick-moves-group')).getAllByTestId('move-item');
    expect(items.every((i) => i.getAttribute('data-is-recommended') === 'false')).toBe(true);
  });

  it('AC-14: charged-moves-group contains no recommended move items for a multi-role Pokémon', () => {
    render(
      <PokemonCard name="Tyranitar" primaryType={ROCK} secondaryType={DARK} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={TYRANITAR_QUICK} chargedMoves={TYRANITAR_CHARGED}
        attackerRoles={DUAL_ROLES} defenderTier="B" onSelect={jest.fn()} />
    );
    const items = within(screen.getByTestId('charged-moves-group')).getAllByTestId('move-item');
    expect(items.every((i) => i.getAttribute('data-is-recommended') === 'false')).toBe(true);
  });

  it('AC-15: moves in role-moveset-groups do not appear in quick-moves-group or charged-moves-group', () => {
    render(
      <PokemonCard name="Tyranitar" primaryType={ROCK} secondaryType={DARK} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={TYRANITAR_QUICK} chargedMoves={TYRANITAR_CHARGED}
        attackerRoles={DUAL_ROLES} defenderTier="B" onSelect={jest.fn()} />
    );
    const roleNames = new Set(
      within(screen.getByTestId('role-moveset-section')).getAllByTestId('move-item').map((i) => i.getAttribute('data-move-name'))
    );
    const standardItems = [
      ...within(screen.getByTestId('quick-moves-group')).getAllByTestId('move-item'),
      ...within(screen.getByTestId('charged-moves-group')).getAllByTestId('move-item'),
    ];
    standardItems.forEach((item) => expect(roleNames.has(item.getAttribute('data-move-name'))).toBe(false));
  });

  it('AC-16: quick-moves-group is absent when all quick moves are recommended for roles', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={ALL_REC_QUICK} chargedMoves={ALL_REC_CHARGED}
        attackerRoles={FIRE_FLYING_ROLES} defenderTier="C" onSelect={jest.fn()} />
    );
    expect(screen.queryByTestId('quick-moves-group')).not.toBeInTheDocument();
  });

  it('AC-17: charged-moves-group is absent when all charged moves are recommended for roles', () => {
    render(
      <PokemonCard name="Charizard" primaryType={FIRE} secondaryType={FLYING} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={ALL_REC_QUICK} chargedMoves={ALL_REC_CHARGED}
        attackerRoles={FIRE_FLYING_ROLES} defenderTier="C" onSelect={jest.fn()} />
    );
    expect(screen.queryByTestId('charged-moves-group')).not.toBeInTheDocument();
  });

  it('AC-18: for single-role Pokémon, quick-moves-group contains the recommended move', () => {
    render(
      <PokemonCard name="Absol" primaryType={DARK} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={SINGLE_QUICK} chargedMoves={SINGLE_CHARGED}
        attackerRoles={SINGLE_ROLE} defenderTier="C" onSelect={jest.fn()} />
    );
    const items = within(screen.getByTestId('quick-moves-group')).getAllByTestId('move-item');
    expect(items.filter((i) => i.getAttribute('data-is-recommended') === 'true')).toHaveLength(1);
  });

  it('AC-19: for single-role Pokémon, charged-moves-group contains the recommended move', () => {
    render(
      <PokemonCard name="Absol" primaryType={DARK} secondaryType={null} stats={BALANCED} statMaxima={MAXIMA}
        evolvesFrom={null} evolvesTo={[]} quickMoves={SINGLE_QUICK} chargedMoves={SINGLE_CHARGED}
        attackerRoles={SINGLE_ROLE} defenderTier="C" onSelect={jest.fn()} />
    );
    const items = within(screen.getByTestId('charged-moves-group')).getAllByTestId('move-item');
    expect(items.filter((i) => i.getAttribute('data-is-recommended') === 'true')).toHaveLength(1);
  });
});
