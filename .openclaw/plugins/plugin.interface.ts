export interface PluginHook {
  name: string;
  priority: number;
  handler: (data: any) => Promise<any>;
}

export interface PluginContext {
  logger: any;
  config: Record<string, any>;
  registry: any;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  config?: Record<string, any>;
  hooks?: Record<string, Function>;
  initialize?: (context: PluginContext) => Promise<void>;
  shutdown?: () => Promise<void>;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies: Record<string, string>;
  hooks: string[];
}
