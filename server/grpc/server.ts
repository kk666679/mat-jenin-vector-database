/**
 * gRPC Server Bootstrap
 * 
 * Starts and manages the gRPC server for AI services
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import { AIServiceImpl, createAIService } from './aiservice';

// ============================================
// CONFIGURATION
// ============================================

interface ServerConfig {
  host: string;
  port: number;
  protoPath: string;
}

const defaultConfig: ServerConfig = {
  host: process.env.GRPC_HOST || '0.0.0.0',
  port: parseInt(process.env.GRPC_PORT || '50051', 10),
  protoPath: process.env.PROTO_PATH || path.join(__dirname, '../../sdk/proto/ai-service.proto'),
};

// ============================================
// SERVER IMPLEMENTATION
// ============================================

/**
 * gRPC Server class
 */
export class GrpcServer {
  private server: grpc.Server;
  private config: ServerConfig;
  private service: AIServiceImpl;
  private isRunning: boolean = false;

  constructor(config: Partial<ServerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.server = new grpc.Server();
    this.service = createAIService();
  }

  /**
   * Load proto file
   */
  private loadProto(): any {
    const packageDefinition = protoLoader.loadSync(this.config.protoPath, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    return grpc.loadPackageDefinition(packageDefinition);
  }

  /**
   * Register service handlers
   */
  private registerHandlers(): void {
    const proto = this.loadProto();
    const aiService = proto.ai?.AIService;

    if (!aiService) {
      throw new Error('Failed to load AIService from proto');
    }

    this.server.addService(aiService.service, {
      // Search
      search: async (call: any, callback: any) => {
        try {
          const result = await this.service.search(call.request);
          callback(null, result);
        } catch (error) {
          callback(this.mapError(error), null);
        }
      },

      searchOnly: async (call: any, callback: any) => {
        try {
          const result = await this.service.searchOnly(call.request);
          callback(null, result);
        } catch (error) {
          callback(this.mapError(error), null);
        }
      },

      // Text generation
      generateText: async (call: any, callback: any) => {
        try {
          const result = await this.service.generateText(call.request);
          callback(null, result);
        } catch (error) {
          callback(this.mapError(error), null);
        }
      },

      streamText: (_call: any, callback: any) => {
        // Streaming implementation
        callback(null, { content: '', chunkType: 'text', finishReason: 'stop' });
      },

      // Structured output
      generateStructured: async (call: any, callback: any) => {
        try {
          const result = await this.service.generateStructured(call.request);
          callback(null, result);
        } catch (error) {
          callback(this.mapError(error), null);
        }
      },

      // Document operations
      listDocuments: async (call: any, callback: any) => {
        try {
          const result = await this.service.listDocuments(call.request);
          callback(null, result);
        } catch (error) {
          callback(this.mapError(error), null);
        }
      },

      getDocument: async (call: any, callback: any) => {
        try {
          const result = await this.service.listDocuments({
            ...call.request,
            page: 1,
            pageSize: 1,
          });
          callback(null, result.items[0] || null);
        } catch (error) {
          callback(this.mapError(error), null);
        }
      },

      createDocument: async (call: any, callback: any) => {
        try {
          const result = await this.service.createDocument(call.request);
          callback(null, result);
        } catch (error) {
          callback(this.mapError(error), null);
        }
      },

      updateDocument: async (call: any, callback: any) => {
        try {
          const result = await this.service.updateDocument(call.request);
          callback(null, result);
        } catch (error) {
          callback(this.mapError(error), null);
        }
      },

      deleteDocument: async (call: any, callback: any) => {
        try {
          const result = await this.service.deleteDocument(call.request);
          callback(null, result);
        } catch (error) {
          callback(this.mapError(error), null);
        }
      },

      getDocumentStats: async (call: any, callback: any) => {
        try {
          const result = await this.service.getDocumentStats(call.request);
          callback(null, result);
        } catch (error) {
          callback(this.mapError(error), null);
        }
      },

      // Conversation operations
      listConversations: async (call: any, callback: any) => {
        try {
          const result = await this.service.listConversations(call.request);
          callback(null, result);
        } catch (error) {
          callback(this.mapError(error), null);
        }
      },

      getMessages: async (call: any, callback: any) => {
        try {
          const result = await this.service.getMessages(call.request);
          callback(null, result);
        } catch (error) {
          callback(this.mapError(error), null);
        }
      },

      createConversation: async (call: any, callback: any) => {
        try {
          const result = await this.service.createConversation(call.request);
          callback(null, result);
        } catch (error) {
          callback(this.mapError(error), null);
        }
      },

      deleteConversation: async (call: any, callback: any) => {
        try {
          const result = await this.service.deleteConversation(call.request);
          callback(null, result);
        } catch (error) {
          callback(this.mapError(error), null);
        }
      },

      // Model operations
      getModelInfo: (call: any) => {
        // Stream model info
        call.write({
          id: 'openai-gpt4',
          name: 'GPT-4',
          provider: 'openai',
          modelId: 'gpt-4',
          capabilities: {
            supportsImageInput: false,
            supportsObjectGeneration: true,
            supportsToolUsage: true,
            supportsToolStreaming: true,
            supportsVision: false,
            supportsStreaming: true,
            supportsReasoning: true,
            maxContextTokens: 128000,
            maxOutputTokens: 4096,
          },
          description: 'OpenAI GPT-4 model',
          deprecated: false,
        });
        call.end();
      },

      inference: async (call: any, callback: any) => {
        try {
          const result = await this.service.inference(call.request);
          callback(null, result);
        } catch (error) {
          callback(this.mapError(error), null);
        }
      },

      batchInference: async (call: any, callback: any) => {
        try {
          const result = await this.service.batchInference(call.request);
          callback(null, result);
        } catch (error) {
          callback(this.mapError(error), null);
        }
      },

      // Health check
      healthCheck: async (call: any, callback: any) => {
        try {
          const result = await this.service.healthCheck(call.request);
          callback(null, result);
        } catch (error) {
          callback(this.mapError(error), null);
        }
      },
    });
  }

  /**
   * Map error to gRPC status
   */
  private mapError(error: unknown): grpc.ServiceError {
    if (error instanceof Error) {
      return {
        code: grpc.status.INTERNAL,
        message: error.message,
        name: 'INTERNAL',
        details: '',
        metadata: new grpc.Metadata(),
      };
    }
    return {
      code: grpc.status.UNKNOWN,
      message: 'Unknown error',
      name: 'UNKNOWN',
      details: '',
      metadata: new grpc.Metadata(),
    };
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.registerHandlers();

      const address = `${this.config.host}:${this.config.port}`;
      
      this.server.bindAsync(
        address,
        grpc.ServerCredentials.createInsecure(),
        (err: Error | null, port: number) => {
          if (err) {
            reject(err);
            return;
          }

          this.server.start();
          this.isRunning = true;
          console.log(`gRPC server running on port ${port}`);
          resolve();
        }
      );
    });
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.tryShutdown(() => {
        this.isRunning = false;
        console.log('gRPC server stopped');
        resolve();
      });
    });
  }

  /**
   * Check if server is running
   */
  get running(): boolean {
    return this.isRunning;
  }

  /**
   * Get server address
   */
  get address(): string {
    return `${this.config.host}:${this.config.port}`;
  }
}

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Create and start gRPC server
 */
export async function createGrpcServer(config?: Partial<ServerConfig>): Promise<GrpcServer> {
  const server = new GrpcServer(config);
  await server.start();
  return server;
}

// ============================================
// MAIN
// ============================================

// Allow running as standalone server
if (require.main === module) {
  const server = new GrpcServer();
  
  server.start()
    .then(() => {
      console.log('gRPC server started successfully');
    })
    .catch((error) => {
      console.error('Failed to start gRPC server:', error);
      process.exit(1);
    });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down gRPC server...');
    await server.stop();
    process.exit(0);
  });
}

