export interface RuntimeConfig {
  version: string;
  buildTime: string;
  platform: string;
  arch: string;
  nodeVersion: string;
  memory: {
    total: number;
    free: number;
    used: number;
  };
  cpu: {
    cores: number;
    model: string;
    speed: number;
  };
}

export function getRuntimeConfig(): RuntimeConfig {
  const memory = process.memoryUsage();
  const cpus = require('os').cpus();
  
  return {
    version: process.env.npm_package_version || '1.0.0',
    buildTime: process.env.BUILD_TIME || new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    memory: {
      total: require('os').totalmem(),
      free: require('os').freemem(),
      used: memory.heapUsed
    },
    cpu: {
      cores: cpus.length,
      model: cpus[0]?.model || 'unknown',
      speed: cpus[0]?.speed || 0
    }
  };
}
