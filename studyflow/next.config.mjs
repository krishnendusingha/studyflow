/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Next.js not to bundle these server-side packages —
  // they must run natively in the Node.js runtime (important for Vercel)
  serverExternalPackages: ["@google/generative-ai"],

  // Increase the default serverless function timeout for AI requests (Vercel)
  experimental: {},
};

export default nextConfig;
