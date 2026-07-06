import { BaseAgent, AgentTask, AgentResult } from '../core/base.agent';
import { IntentService, IntentResult } from '../../intent/config';
import { Logger } from '../../../sdk/shared/logger';

export interface IntentTaskPayload {
  text: string;
  action: 'detect' | 'train' | 'route';
  intents?: string[];
  trainingData?: any[];
  context?: Record<string, any>;
}

export class IntentAgent extends BaseAgent {
  private intentService: IntentService;
  private routes: Map<string, RouteHandler> = new Map();

  constructor(logger: Logger) {
    super('IntentAgent', '1.0.0', logger);
    this.intentService = new IntentService(logger);
    this.capabilities = [
      {
        name: 'detect-intent',
        description: 'Detect intent from text input',
        inputSchema: { text: 'string' },
        outputSchema: { intent: 'string', confidence: 'number', entities: 'object' },
        version: '1.0.0'
      },
      {
        name: 'route-intent',
        description: 'Route text to appropriate handler based on intent',
        inputSchema: { text: 'string' },
        outputSchema: { routed: 'boolean', handler: 'string' },
        version: '1.0.0'
      }
    ];
  }

  canHandle(task: AgentTask): boolean {
    return ['detect-intent', 'route-intent', 'train-intent'].includes(task.type);
  }

  async execute(task: AgentTask<IntentTaskPayload>): Promise<AgentResult> {
    const { text, action, trainingData, context } = task.payload;

    switch (action) {
      case 'detect':
        return this.detectIntent(text, task);
      case 'train':
        return this.trainIntent(trainingData!, task);
      case 'route':
        return this.routeIntent(text, context || {}, task);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async detectIntent(text: string, task: AgentTask): Promise<AgentResult> {
    return this.withMetrics('intent-detection', async () => {
      try {
        const result = await this.intentService.detectIntent(text);
        
        return {
          success: true,
          data: {
            intent: result.intent,
            confidence: result.confidence,
            entities: result.entities,
            text
          },
          taskId: task.id,
          metadata: {
            confidence: result.confidence,
            timestamp: new Date().toISOString()
          }
        };
      } catch (error) {
        this.logger.error('Intent detection failed:', error);
        return {
          success: false,
          error: error.message,
          taskId: task.id
        };
      }
    });
  }

  private async trainIntent(trainingData: any[], task: AgentTask): Promise<AgentResult> {
    return this.withMetrics('intent-training', async () => {
      try {
        await this.intentService.train(trainingData);
        await this.intentService.saveModel();
        
        return {
          success: true,
          data: {
            trained: trainingData.length,
            status: 'completed'
          },
          taskId: task.id,
          metadata: {
            samples: trainingData.length,
            timestamp: new Date().toISOString()
          }
        };
      } catch (error) {
        this.logger.error('Training failed:', error);
        return {
          success: false,
          error: error.message,
          taskId: task.id
        };
      }
    });
  }

  private async routeIntent(text: string, context: Record<string, any>, task: AgentTask): Promise<AgentResult> {
    return this.withMetrics('intent-routing', async () => {
      try {
        const result = await this.intentService.detectIntent(text);
        const handler = this.routes.get(result.intent);
        
        if (!handler) {
          return {
            success: false,
            error: `No route found for intent: ${result.intent}`,
            taskId: task.id
          };
        }

        const routed = await handler(result, context);
        
        return {
          success: true,
          data: {
            routed: true,
            handler: result.intent,
            result: routed
          },
          taskId: task.id,
          metadata: {
            intent: result.intent,
            confidence: result.confidence,
            timestamp: new Date().toISOString()
          }
        };
      } catch (error) {
        this.logger.error('Routing failed:', error);
        return {
          success: false,
          error: error.message,
          taskId: task.id
        };
      }
    });
  }

  registerRoute(intent: string, handler: RouteHandler): void {
    this.routes.set(intent, handler);
    this.logger.info(`Route registered for intent: ${intent}`);
  }

  getRoutes(): string[] {
    return Array.from(this.routes.keys());
  }
}

export type RouteHandler = (result: IntentResult, context: Record<string, any>) => Promise<any>;
