/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true }, // optional while iterating
  webpack: (config) => {
    config.resolve.alias = { ...(config.resolve.alias || {}), canvas: false }; // ⬅️ key fix
    return config;
  },
};
export default nextConfig;
