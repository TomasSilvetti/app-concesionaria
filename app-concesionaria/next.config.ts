import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Evita que pdfjs-dist intente importar el módulo nativo 'canvas' de Node.js
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
