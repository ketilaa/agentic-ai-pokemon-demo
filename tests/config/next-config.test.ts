// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextConfig = require('../../next.config.js') as { output?: string };

// AC-02: Next.js must be configured with output: 'export'

describe('next.config', () => {
  it('AC-02: output is set to export', () => {
    expect(nextConfig.output).toBe('export');
  });

  it('AC-02: no server-dependent output modes are configured', () => {
    expect(nextConfig.output).not.toBe('standalone');
    expect(nextConfig.output).not.toBeUndefined();
  });
});
