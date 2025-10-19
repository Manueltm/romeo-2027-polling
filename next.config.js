// next.config.js
/* eslint-disable @typescript-eslint/no-require-imports */

const withPWA = require('next-pwa')({
  dest: 'public',         // service-worker.js output dir
  register: true,         // auto-register the SW
  skipWaiting: true,      // activate new SW immediately
  disable: process.env.NODE_ENV === 'development', // no SW in dev
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // ┌──────────────────────────────────────────────────────────────┐
    // │  NEW SYNTAX – replace / add hosts here                      │
    // └──────────────────────────────────────────────────────────────┘
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-image-host.com', // << change to your real host
        // port: '',                     // optional
        // pathname: '/**',              // optional
      },

      // add more blocks as needed, e.g.
      // {
      //   protocol: 'https',
      //   hostname: 'avatars.githubusercontent.com',
      // },
    ],
  },
};

module.exports = withPWA(nextConfig);