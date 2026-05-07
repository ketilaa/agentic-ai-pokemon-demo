/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// AC-01, AC-04, AC-05, AC-06 — test state management without MUI Autocomplete portal complexity
jest.mock('../../src/components/pokemon-search', () => ({
  PokemonSearch: ({ onSelect }: { onSelect: (name: string | null) => void }) => (
    <input
      data-testid="mock-search"
      onChange={(e) => onSelect(e.target.value || null)}
    />
  ),
}));

import { PokemonExplorer } from '../../src/components/pokemon-explorer';
import type { PokemonEntry } from '../../src/domain/pokemon-catalog';

const ENTRIES: PokemonEntry[] = [
  { name: 'Bulbasaur', primaryType: { name: 'Grass', color: '#3FA129' }, secondaryType: { name: 'Poison', color: '#9141CB' } },
  { name: 'Ivysaur',   primaryType: { name: 'Grass', color: '#3FA129' }, secondaryType: { name: 'Poison', color: '#9141CB' } },
  { name: 'Venusaur',  primaryType: { name: 'Grass', color: '#3FA129' }, secondaryType: { name: 'Poison', color: '#9141CB' } },
];

describe('PokemonExplorer', () => {
  it('AC-01: renders the search input at the top', () => {
    render(<PokemonExplorer entries={ENTRIES} />);
    expect(screen.getByTestId('mock-search')).toBeInTheDocument();
  });

  it('AC-05: no card is shown before a Pokémon is selected', () => {
    render(<PokemonExplorer entries={ENTRIES} />);
    ENTRIES.forEach(({ name }) => expect(screen.queryByText(name)).not.toBeInTheDocument());
  });

  it('AC-04: shows a card with the selected Pokémon name', () => {
    render(<PokemonExplorer entries={ENTRIES} />);
    fireEvent.change(screen.getByTestId('mock-search'), { target: { value: 'Bulbasaur' } });
    expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
  });

  it('AC-02: shows type indicators for the selected Pokémon', () => {
    render(<PokemonExplorer entries={ENTRIES} />);
    fireEvent.change(screen.getByTestId('mock-search'), { target: { value: 'Bulbasaur' } });
    expect(screen.getByText('Grass')).toBeInTheDocument();
    expect(screen.getByText('Poison')).toBeInTheDocument();
  });

  it('AC-06: card updates when a different Pokémon is selected', () => {
    render(<PokemonExplorer entries={ENTRIES} />);
    const input = screen.getByTestId('mock-search');
    fireEvent.change(input, { target: { value: 'Bulbasaur' } });
    fireEvent.change(input, { target: { value: 'Ivysaur' } });
    expect(screen.getByText('Ivysaur')).toBeInTheDocument();
    expect(screen.queryByText('Bulbasaur')).not.toBeInTheDocument();
  });

  it('AC-05: card is hidden when the selection is cleared', () => {
    render(<PokemonExplorer entries={ENTRIES} />);
    const input = screen.getByTestId('mock-search');
    fireEvent.change(input, { target: { value: 'Bulbasaur' } });
    expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
    fireEvent.change(input, { target: { value: '' } });
    expect(screen.queryByText('Bulbasaur')).not.toBeInTheDocument();
  });
});
