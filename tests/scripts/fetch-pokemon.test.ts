import { fetchPokemonData, writePokemonFile, run } from '../../scripts/fetch-pokemon';
import { existsSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import os from 'os';

// AC-01: script fetches data and writes a JSON file containing Pokémon entries
// AC-06: script throws (and thus exits non-zero) when API is unreachable or returns non-200

const SAMPLE_POKEMON = [{ id: 'BULBASAUR' }, { id: 'IVYSAUR' }];

describe('fetchPokemonData', () => {
  it('returns parsed JSON from a successful response', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(SAMPLE_POKEMON),
    } as unknown as Response);

    const result = await fetchPokemonData('https://example.com/api', mockFetcher);
    expect(result).toEqual(SAMPLE_POKEMON);
  });

  it('AC-06: throws when the API returns a non-200 status', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as unknown as Response);

    await expect(fetchPokemonData('https://example.com/api', mockFetcher)).rejects.toThrow(
      'API request failed with status 404'
    );
  });

  it('AC-06: throws when the fetch call itself fails (network error)', async () => {
    const mockFetcher = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(fetchPokemonData('https://example.com/api', mockFetcher)).rejects.toThrow(
      'ECONNREFUSED'
    );
  });
});

describe('writePokemonFile', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(os.tmpdir(), `pokemon-test-${Date.now()}`);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('AC-01: writes JSON file to the specified path and creates directories', () => {
    const outputPath = join(tmpDir, 'data', 'pokemon.json');
    writePokemonFile(SAMPLE_POKEMON, outputPath);

    expect(existsSync(outputPath)).toBe(true);
    const written = JSON.parse(readFileSync(outputPath, 'utf-8'));
    expect(written).toEqual(SAMPLE_POKEMON);
  });

  it('AC-01: written file contains Pokémon entries (non-empty array)', () => {
    const outputPath = join(tmpDir, 'pokemon.json');
    writePokemonFile(SAMPLE_POKEMON, outputPath);

    const written = JSON.parse(readFileSync(outputPath, 'utf-8'));
    expect(Array.isArray(written)).toBe(true);
    expect(written.length).toBeGreaterThan(0);
  });
});

describe('run', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(os.tmpdir(), `pokemon-run-test-${Date.now()}`);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('AC-01: writes a valid pokemon JSON file when API succeeds', async () => {
    const outputPath = join(tmpDir, 'pokemon.json');

    const mockFetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(SAMPLE_POKEMON),
    } as unknown as Response);

    // Patch the module-level fetcher by passing through run's injectable deps
    // run() uses fetchPokemonData internally; we test via the full integration path
    // by replacing global fetch temporarily
    const originalFetch = global.fetch;
    global.fetch = mockFetcher as unknown as typeof fetch;

    try {
      await run('https://example.com/api', outputPath);
    } finally {
      global.fetch = originalFetch;
    }

    expect(existsSync(outputPath)).toBe(true);
    const written = JSON.parse(readFileSync(outputPath, 'utf-8'));
    expect(written).toEqual(SAMPLE_POKEMON);
  });

  it('AC-06: rejects with an error when API returns non-200 (caller must exit non-zero)', async () => {
    const outputPath = join(tmpDir, 'pokemon.json');
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    } as unknown as Response) as unknown as typeof fetch;

    try {
      await expect(run('https://example.com/api', outputPath)).rejects.toThrow(
        'API request failed with status 503'
      );
    } finally {
      global.fetch = originalFetch;
    }
  });
});
