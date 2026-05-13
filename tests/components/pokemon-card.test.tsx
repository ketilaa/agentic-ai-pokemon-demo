/**
 * @jest-environment jsdom
 */
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PokemonCard } from '../../src/components/pokemon-card';
import type { PokemonStats, PokemonType, StatMaxima } from '../../src/domain/pokemon-catalog';

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
