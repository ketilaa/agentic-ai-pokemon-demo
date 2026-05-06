// AC-02: Next.js must be configured with output: 'export'
// basePath must be configurable via NEXT_BASE_PATH for GitHub Pages project-site hosting.

type NextConfig = { output?: string; basePath?: string };

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
