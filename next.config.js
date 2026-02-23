/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@/sdk/shared',
    '@/sdk/db',
    '@/sdk/queue',
    '@/sdk/vector',
    '@/sdk/cache',
    '@/sdk/llm',
  ],
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/adapter-mssql',
    'bullmq',
    'ioredis',
    '@grpc/grpc-js',
    '@grpc/proto-loader',
    '@opentelemetry/core',
    '@opentelemetry/instrumentation-grpc',
    '@xenova/transformers',
  ],
};

module.exports = nextConfig;

