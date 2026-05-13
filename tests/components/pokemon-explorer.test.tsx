/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockGet = jest.fn<string | null, [string]>().mockReturnValue(null);
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: mockGet }),
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/',
}));

// AC-11 (spec 0005), AC-01, AC-04, AC-05, AC-06 (spec 0002) — state management
jest.mock('../../src/components/pokemon-search', () => ({
  PokemonSearch: ({ onSelect }: { onSelect: (name: string | null) => void }) => (
    <input
      data-testid="mock-search"
      onChange={(e) => onSelect(e.target.value || null)}
    />
  ),
}));

import { PokemonExplorer } from '../../src/components/pokemon-explorer';
import type { PokemonEntry, StatMaxima } from '../../src/domain/pokemon-catalog';

const STATS = { attack: 118, defense: 111, stamina: 128 };
const MAXIMA: StatMaxima = { maxAttack: 200, maxDefense: 200, maxStamina: 200 };

const ENTRIES: PokemonEntry[] = [
  { name: 'Bulbasaur', primaryType: { name: 'Grass', color: '#3FA129' }, secondaryType: { name: 'Poison', color: '#9141CB' }, stats: STATS, evolvesFrom: null, evolvesTo: ['Ivysaur'] },
  { name: 'Ivysaur',   primaryType: { name: 'Grass', color: '#3FA129' }, secondaryType: { name: 'Poison', color: '#9141CB' }, stats: STATS, evolvesFrom: 'Bulbasaur', evolvesTo: ['Venusaur'] },
  { name: 'Venusaur',  primaryType: { name: 'Grass', color: '#3FA129' }, secondaryType: { name: 'Poison', color: '#9141CB' }, stats: STATS, evolvesFrom: 'Ivysaur', evolvesTo: [] },
];

describe('PokemonExplorer', () => {
  beforeEach(() => {
    mockGet.mockReturnValue(null);
    mockReplace.mockClear();
  });

  it('renders the search input at the top', () => {
    render(<PokemonExplorer entries={ENTRIES} statMaxima={MAXIMA} />);
    expect(screen.getByTestId('mock-search')).toBeInTheDocument();
  });

  it('AC-11: no card is shown before a Pokémon is selected', () => {
    render(<PokemonExplorer entries={ENTRIES} statMaxima={MAXIMA} />);
    ENTRIES.forEach(({ name }) => expect(screen.queryByText(name)).not.toBeInTheDocument());
  });

  it('shows a card with the selected Pokémon name', () => {
    render(<PokemonExplorer entries={ENTRIES} statMaxima={MAXIMA} />);
    fireEvent.change(screen.getByTestId('mock-search'), { target: { value: 'Bulbasaur' } });
    expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
  });

  it('AC-05/AC-06: card container carries type colors for the selected Pokémon', () => {
    render(<PokemonExplorer entries={ENTRIES} statMaxima={MAXIMA} />);
    fireEvent.change(screen.getByTestId('mock-search'), { target: { value: 'Bulbasaur' } });
    const card = screen.getByTestId('pokemon-card');
    expect(card).toHaveAttribute('data-border-primary-color', '#3FA129');
    expect(card).toHaveAttribute('data-border-secondary-color', '#9141CB');
  });

  it('AC-02: strength profile is shown for the selected Pokémon', () => {
    render(<PokemonExplorer entries={ENTRIES} statMaxima={MAXIMA} />);
    fireEvent.change(screen.getByTestId('mock-search'), { target: { value: 'Bulbasaur' } });
    expect(screen.getByTestId('stat-bar-atk')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bar-def')).toBeInTheDocument();
    expect(screen.getByTestId('stat-bar-sta')).toBeInTheDocument();
  });

  it('card updates when a different Pokémon is selected', () => {
    render(<PokemonExplorer entries={ENTRIES} statMaxima={MAXIMA} />);
    const input = screen.getByTestId('mock-search');
    fireEvent.change(input, { target: { value: 'Bulbasaur' } });
    fireEvent.change(input, { target: { value: 'Ivysaur' } });
    const header = screen.getByTestId('card-header');
    expect(within(header).getByText('Ivysaur')).toBeInTheDocument();
    expect(within(header).queryByText('Bulbasaur')).not.toBeInTheDocument();
  });

  it('AC-11: card is hidden when the selection is cleared', () => {
    render(<PokemonExplorer entries={ENTRIES} statMaxima={MAXIMA} />);
    const input = screen.getByTestId('mock-search');
    fireEvent.change(input, { target: { value: 'Bulbasaur' } });
    expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
    fireEvent.change(input, { target: { value: '' } });
    expect(screen.queryByText('Bulbasaur')).not.toBeInTheDocument();
  });

  it('AC-14: selecting via autocomplete calls router.replace with ?pokemon=<name>', () => {
    render(<PokemonExplorer entries={ENTRIES} statMaxima={MAXIMA} />);
    fireEvent.change(screen.getByTestId('mock-search'), { target: { value: 'Venusaur' } });
    expect(mockReplace).toHaveBeenCalledWith('/?pokemon=Venusaur');
  });

  it('AC-23: clearing the autocomplete calls router.replace with no pokemon param', () => {
    render(<PokemonExplorer entries={ENTRIES} statMaxima={MAXIMA} />);
    const input = screen.getByTestId('mock-search');
    fireEvent.change(input, { target: { value: 'Bulbasaur' } });
    fireEvent.change(input, { target: { value: '' } });
    expect(mockReplace).toHaveBeenLastCalledWith('/');
  });

  it('AC-07/AC-08: evolution section shows evolves-to chips for a base-stage Pokémon', () => {
    render(<PokemonExplorer entries={ENTRIES} statMaxima={MAXIMA} />);
    fireEvent.change(screen.getByTestId('mock-search'), { target: { value: 'Bulbasaur' } });
    expect(screen.getByTestId('evolves-to-section')).toBeInTheDocument();
    expect(screen.queryByTestId('evolves-from-section')).not.toBeInTheDocument();
  });

  it('AC-09: evolution section shows evolves-from chip for a final-stage Pokémon', () => {
    render(<PokemonExplorer entries={ENTRIES} statMaxima={MAXIMA} />);
    fireEvent.change(screen.getByTestId('mock-search'), { target: { value: 'Venusaur' } });
    expect(screen.getByTestId('evolves-from-section')).toBeInTheDocument();
    expect(screen.queryByTestId('evolves-to-section')).not.toBeInTheDocument();
  });

  it('AC-11: clicking an evolution chip selects the target Pokémon', () => {
    render(<PokemonExplorer entries={ENTRIES} statMaxima={MAXIMA} />);
    fireEvent.change(screen.getByTestId('mock-search'), { target: { value: 'Ivysaur' } });
    const venusaurChip = screen.getByText('Venusaur');
    fireEvent.click(venusaurChip);
    expect(screen.getByTestId('pokemon-card')).toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith('/?pokemon=Venusaur');
  });

  it('AC-15: loading with a valid ?pokemon= param immediately shows that Pokémon\'s card', () => {
    mockGet.mockReturnValue('Bulbasaur');
    render(<PokemonExplorer entries={ENTRIES} statMaxima={MAXIMA} />);
    expect(screen.getByTestId('pokemon-card')).toBeInTheDocument();
    expect(within(screen.getByTestId('card-header')).getByText('Bulbasaur')).toBeInTheDocument();
  });

  it('AC-16: loading with an invalid ?pokemon= param shows no card and cleans the URL', () => {
    mockGet.mockReturnValue('UnknownXYZ');
    render(<PokemonExplorer entries={ENTRIES} statMaxima={MAXIMA} />);
    expect(screen.queryByTestId('pokemon-card')).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});
