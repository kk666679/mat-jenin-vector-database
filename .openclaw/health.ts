import { OpenClawSystem } from './index';

export async function healthCheck(): Promise<any> {
  try {
    const system = OpenClawSystem.getInstance({
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      logLevel: 'info'
    });

    const status = await system.getStatus();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: {
        initialized: true,
        agents: status.agents?.total || 0,
        workflows: status.workflows?.length || 0,
        queue: status.queueStats
      },
      dependencies: {
        redis: status.queueInfo?.connected || false,
        database: true
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}
