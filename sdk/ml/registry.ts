/**
 * ML Model Registry
 * Based on machine-learning-engineer skill - Model Registry and Versioning
 */

import type { ModelMetadata, RegisteredModel, ModelStatus } from './types';

// ============================================
// MODEL REGISTRY
// ============================================

/**
 * Model registry for managing deployed models
 */
export class ModelRegistry {
  private models: Map<string, RegisteredModel> = new Map();
  private aliases: Map<string, string> = new Map(); // alias -> modelId

  /**
   * Register a new model
   */
  register(model: RegisteredModel): void {
    const key = `${model.metadata.id}:${model.metadata.version}`;
    this.models.set(key, model);
    
    // Set latest alias if status is production
    if (model.metadata.status === 'production') {
      this.aliases.set(`latest:${model.metadata.name}`, key);
    }
  }

  /**
   * Get model by ID and version
   */
  get(modelId: string, version?: string): RegisteredModel | undefined {
    if (version) {
      return this.models.get(`${modelId}:${version}`);
    }
    
    // Return latest version if version not specified
    const latest = Array.from(this.models.entries())
      .filter(([key]) => key.startsWith(`${modelId}:`))
      .sort((a, b) => b[0].localeCompare(a[0]))[0];
    
    return latest?.[1];
  }

  /**
   * Get model by alias
   */
  getByAlias(alias: string): RegisteredModel | undefined {
    const key = this.aliases.get(alias);
    return key ? this.models.get(key) : undefined;
  }

  /**
   * List all models
   */
  list(status?: ModelStatus): RegisteredModel[] {
    const all = Array.from(this.models.values());
    if (status) {
      return all.filter(m => m.metadata.status === status);
    }
    return all;
  }

  /**
   * List model versions
   */
  listVersions(modelId: string): RegisteredModel[] {
    return Array.from(this.models.entries())
      .filter(([key]) => key.startsWith(`${modelId}:`))
      .map(([, model]) => model)
      .sort((a, b) => b.metadata.version.localeCompare(a.metadata.version));
  }

  /**
   * Set alias for model
   */
  setAlias(alias: string, modelId: string, version?: string): void {
    const model = this.get(modelId, version);
    if (!model) {
      throw new Error(`Model ${modelId}:${version || 'latest'} not found`);
    }
    this.aliases.set(alias, `${modelId}:${model.metadata.version}`);
  }

  /**
   * Update model status
   */
  updateStatus(modelId: string, version: string, status: ModelStatus): void {
    const key = `${modelId}:${version}`;
    const model = this.models.get(key);
    if (!model) {
      throw new Error(`Model ${key} not found`);
    }
    
    model.metadata.status = status;
    model.metadata.updatedAt = new Date();
    
    // Update latest alias
    if (status === 'production') {
      this.aliases.set(`latest:${modelId}`, key);
    }
  }

  /**
   * Remove model
   */
  remove(modelId: string, version: string): void {
    const key = `${modelId}:${version}`;
    this.models.delete(key);
    
    // Clean up aliases
    for (const [alias, k] of this.aliases.entries()) {
      if (k === key) {
        this.aliases.delete(alias);
      }
    }
  }

  /**
   * Get model metadata
   */
  getMetadata(modelId: string, version?: string): ModelMetadata | undefined {
    const model = this.get(modelId, version);
    return model?.metadata;
  }
}

// ============================================
// MODEL ROUTER
// ============================================

/**
 * Route requests to appropriate model versions
 */
export class ModelRouter {
  private registry: ModelRegistry;
  private routingRules: Map<string, RoutingRule> = new Map();

  constructor(registry: ModelRegistry) {
    this.registry = registry;
  }

  /**
   * Add routing rule
   */
  addRule(name: string, rule: RoutingRule): void {
    this.routingRules.set(name, rule);
  }

  /**
   * Route request to appropriate model
   */
  async route(request: RoutingRequest): Promise<RegisteredModel | null> {
    const rule = this.routingRules.get(request.ruleName || 'default');
    if (!rule) {
      // Default: return latest production model
      return this.registry.get(request.modelId, 'latest') || null;
    }

    switch (rule.type) {
      case 'version':
        return this.registry.get(request.modelId, rule.version) || null;
      
      case 'alias':
        return this.registry.getByAlias(rule.alias || request.modelId) || null;
      
      case 'weighted':
        return this.routeWeighted(rule, request);
      
      case 'a_b_testing':
        return this.routeABTest(rule, request);
      
      default:
        return this.registry.get(request.modelId) || null;
    }
  }

  /**
   * Route based on weighted distribution
   */
  private routeWeighted(rule: RoutingRule, request: RoutingRequest): RegisteredModel | null {
    const weights = rule.weights || {};
    const versions = Object.keys(weights);
    
    if (versions.length === 0) {
      return this.registry.get(request.modelId) || null;
    }

    // Use request ID for consistent hashing
    const hash = this.hashString(request.requestId || Math.random().toString());
    const normalized = hash % 100;
    
    let cumulative = 0;
    for (const version of versions) {
      cumulative += weights[version] || 0;
      if (normalized < cumulative) {
        return this.registry.get(request.modelId, version) || null;
      }
    }

    return this.registry.get(request.modelId, versions[0]) || null;
  }

  /**
   * Route for A/B testing
   */
  private routeABTest(rule: RoutingRule, request: RoutingRequest): RegisteredModel | null {
    // Use user ID or session for consistent testing
    const identifier = request.userId || request.sessionId || Math.random().toString();
    const hash = this.hashString(identifier);
    const percentage = rule.testPercentage || 50;
    
    if (hash % 100 < percentage) {
      return this.registry.get(request.modelId, rule.testVersion || 'B') || null;
    }
    
    return this.registry.get(request.modelId, rule.controlVersion || 'A') || null;
  }

  /**
   * Simple hash function
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Get routing info for a request
   */
  async getRoutingInfo(request: RoutingRequest): Promise<RoutingInfo> {
    const model = await this.route(request);

    const routingInfo: RoutingInfo = {
      modelId: request.modelId,
      rule: request.ruleName || 'default',
    };

    if (model?.metadata.version !== undefined) {
      routingInfo.version = model.metadata.version;
    }
    if (model?.endpoints.realtime !== undefined) {
      routingInfo.endpoint = model.endpoints.realtime;
    }

    return routingInfo;
  }
}

// ============================================
// ROUTING TYPES
// ============================================

export interface RoutingRule {
  type: 'version' | 'alias' | 'weighted' | 'a_b_testing';
  version?: string;
  alias?: string;
  weights?: Record<string, number>;
  controlVersion?: string;
  testVersion?: string;
  testPercentage?: number;
}

export interface RoutingRequest {
  modelId: string;
  ruleName?: string;
  requestId?: string;
  userId?: string;
  sessionId?: string;
}

export interface RoutingInfo {
  modelId: string;
  version?: string;
  endpoint?: string;
  rule: string;
}

// ============================================
// MODEL LOADERS
// ============================================

/**
 * Load model from various sources
 */
export class ModelLoader {
  /**
   * Load model from URL
   */
  static async fromURL(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load model: ${response.statusText}`);
    }
    return response.arrayBuffer();
  }

  /**
   * Load model from file path (Node.js)
   */
  static async fromFile(path: string): Promise<Buffer> {
    // Dynamic import for Node.js
    const fs = await import('fs');
    return fs.readFileSync(path);
  }

  /**
   * Load model from base64 string
   */
  static fromBase64(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Validate model file
   */
  static validate(buffer: ArrayBuffer, format: 'onnx' | 'pytorch' | 'tensorflow'): boolean {
    // Check magic bytes
    const bytes = new Uint8Array(buffer);
    
    switch (format) {
      case 'onnx':
        // ONNX files start with specific magic
        return bytes[0] === 0x08;
      case 'pytorch':
        // PT files have specific magic
        return bytes[0] === 0x80 && bytes[1] === 0x02;
      case 'tensorflow':
        // TF SavedModel has specific structure
        return true; // Would need more validation
      default:
        return false;
    }
  }
}

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Create model registry from environment
 */
export function createModelRegistry(): ModelRegistry {
  return new ModelRegistry();
}

/**
 * Create model router
 */
export function createModelRouter(registry: ModelRegistry): ModelRouter {
  return new ModelRouter(registry);
}

