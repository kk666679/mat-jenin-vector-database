import pino from 'pino';
import pinoPretty from 'pino-pretty';
import type { Logger, LoggerConfig, LogContext } from './types';

function createLoggerImpl(baseLogger: pino.Logger): Logger {
  return {
    debug: (msg: string, context?: LogContext) => baseLogger.debug(context ?? {}, msg),
    info: (msg: string, context?: LogContext) => baseLogger.info(context ?? {}, msg),
    warn: (msg: string, context?: LogContext) => baseLogger.warn(context ?? {}, msg),
    error: (msg: string, context?: LogContext) => baseLogger.error(context ?? {}, msg),
    fatal: (msg: string, context?: LogContext) => baseLogger.fatal(context ?? {}, msg),
    child: (bindings: Record<string, any>) => createLoggerImpl(baseLogger.child(bindings)),
  };
}

export function createLogger(config: LoggerConfig = { level: 'info' }): Logger {
  const {
    level = 'info',
    name = 'matjenin',
    pretty = true,
    silent = false,
    formatters,
    transports = [],
  } = config;

  const streams: pino.StreamEntry[] = [];

  if (transports.some((t) => t.type === 'console') || transports.length === 0) {
    if (pretty) {
      streams.push({
        stream: pinoPretty({
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          messageFormat: '{msg}',
          levelFirst: true,
        }),
      });
    } else {
      streams.push({ stream: process.stdout });
    }
  }

  for (const transport of transports) {
    if (transport.type === 'file' && transport.options?.path) {
      streams.push({
        stream: pino.destination(transport.options.path),
      });
    }
  }

  const pinoLogger = pino(
    {
      level: silent ? 'silent' : level,
      name,
      formatters: {
        level: (label) => ({ level: label }),
        bindings: (bindings) => ({ pid: bindings.pid, host: bindings.hostname }),
        ...formatters,
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    pino.multistream(streams)
  );

  return createLoggerImpl(pinoLogger);
}
