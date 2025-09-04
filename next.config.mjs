import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true }, // optional while iterating
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: path.resolve(process.cwd(), "src/stubs/canvas.js"), // ⬅️ key fix
    };
    return config;
  },
};
export default nextConfig;
