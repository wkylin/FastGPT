/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const rewrites = () => {
  return [
    {
      source: '/api/:path*',
      destination: 'http://121.36.214.100:3000/:path*'
    }
  ];
};

const nextConfig = {
  i18n,
  output: 'standalone',
  reactStrictMode: false,
  compress: true,
  rewrites,
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve.fallback,
          fs: false
        }
      };
    }
    config.experiments = {
      asyncWebAssembly: true,
      layers: true
    };
    config.module = {
      ...config.module,
      rules: config.module.rules.concat([
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: ['@svgr/webpack']
        }
      ]),
      exprContextCritical: false
    };

    return config;
  }
};

module.exports = nextConfig;
