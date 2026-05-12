// AC-02: Next.js must be configured with output: 'export'
// basePath must be configurable via NEXT_BASE_PATH for GitHub Pages project-site hosting.

type RemotePattern = { protocol?: string; hostname: string; port?: string; pathname?: string };
type NextConfig = { output?: string; basePath?: string; images?: { remotePatterns?: RemotePattern[] } };

function loadConfig(): NextConfig {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('../../next.config.js') as NextConfig;
}

describe('next.config output', () => {
  it('AC-02: output is set to export', () => {
    expect(loadConfig().output).toBe('export');
  });

  it('AC-02: no server-dependent output modes are configured', () => {
    const { output } = loadConfig();
    expect(output).not.toBe('standalone');
    expect(output).not.toBeUndefined();
  });
});

describe('next.config images (spec 0009 AC-13)', () => {
  it('AC-13: raw.githubusercontent.com is the only permitted remote image host', () => {
    const config = loadConfig();
    const patterns = config.images?.remotePatterns ?? [];
    expect(patterns).toHaveLength(1);
    expect(patterns[0].hostname).toBe('raw.githubusercontent.com');
  });
});

describe('next.config basePath', () => {
  const ORIGINAL = process.env.NEXT_BASE_PATH;

  afterEach(() => {
    if (ORIGINAL === undefined) {
      delete process.env.NEXT_BASE_PATH;
    } else {
      process.env.NEXT_BASE_PATH = ORIGINAL;
    }
    jest.resetModules();
  });

  it('defaults to empty string when NEXT_BASE_PATH is not set', () => {
    delete process.env.NEXT_BASE_PATH;
    jest.resetModules();
    expect(loadConfig().basePath).toBe('');
  });

  it('uses NEXT_BASE_PATH when set', () => {
    process.env.NEXT_BASE_PATH = '/agentic-ai-pokemon-demo';
    jest.resetModules();
    expect(loadConfig().basePath).toBe('/agentic-ai-pokemon-demo');
  });
});
