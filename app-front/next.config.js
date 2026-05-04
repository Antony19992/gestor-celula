const path = require("path");
const fs = require("fs");

const bibliaEntries = fs
  .readdirSync(path.join(__dirname, "public", "biblia"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => ({ url: `/biblia/${f}`, revision: null }));

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    additionalManifestEntries: bibliaEntries,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
