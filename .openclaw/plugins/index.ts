export * from './plugin.interface';
export * from './plugin.manager';

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  config?: Record<string, any>;
  hooks?: Record<string, Function>;
  initialize?: () => Promise<void>;
  shutdown?: () => Promise<void>;
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.child({ service: 'PluginManager' });
  }

  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      this.logger.warn(`Plugin ${plugin.id} already registered, overwriting`);
    }
    this.plugins.set(plugin.id, plugin);
    this.logger.info(`Plugin registered: ${plugin.id} v${plugin.version}`);
  }

  unregister(id: string): boolean {
    const deleted = this.plugins.delete(id);
    if (deleted) {
      this.logger.info(`Plugin unregistered: ${id}`);
    }
    return deleted;
  }

  get(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  async initializeAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.initialize) {
        await plugin.initialize();
        this.logger.info(`Plugin initialized: ${plugin.id}`);
      }
    }
  }

  async shutdownAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.shutdown) {
        await plugin.shutdown();
        this.logger.info(`Plugin shutdown: ${plugin.id}`);
      }
    }
  }

  getStatus() {
    return {
      total: this.plugins.size,
      plugins: Array.from(this.plugins.keys())
    };
  }
}
