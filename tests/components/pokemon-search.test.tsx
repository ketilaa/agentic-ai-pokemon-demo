/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PokemonSearch } from '../../src/components/pokemon-search';

// MUI Autocomplete uses matchMedia internally via Popper
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const OPTIONS = ['Bulbasaur', 'Ivysaur', 'Venusaur'];

describe('PokemonSearch', () => {
  // AC-01: autocomplete input is present at the top of the page
  it('AC-01: renders an autocomplete combobox input', () => {
    render(<PokemonSearch options={OPTIONS} onSelect={jest.fn()} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  // Clears the selected value and calls onSelect(null) when the MUI clear button is clicked
  it('calls onSelect(null) when the selection is cleared', () => {
    const onSelect = jest.fn();
    render(<PokemonSearch options={OPTIONS} onSelect={onSelect} />);

    // open dropdown and select an option
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Bulb' } });
    fireEvent.click(screen.getByRole('option', { name: 'Bulbasaur' }));
    expect(onSelect).toHaveBeenCalledWith('Bulbasaur');

    // click the MUI clear button (aria-label="Clear", appears after a value is selected)
    fireEvent.click(screen.getByLabelText('Clear'));
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
