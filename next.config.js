/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NEXT_BASE_PATH || '',
};

module.exports = nextConfig;
