module.exports = {
  apps: [
    {
      name: 'openclaw-worker',
      script: '.openclaw/worker/index.ts',
      interpreter: 'ts-node',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'info'
      },
      error_file: '.openclaw/logs/worker-error.log',
      out_file: '.openclaw/logs/worker-out.log',
      log_file: '.openclaw/logs/worker-combined.log',
      time: true
    }
  ]
};
