import { Logger } from '../sdk/shared/logger';
import { createLogger } from '../sdk/shared/logger';
import { QueueService } from './queue';
import { AgentRegistry } from './agents/core/agent.registry';
import { OrchestratorAgent } from './agents/orchestrator.agent';
import { EmbeddingAgent } from './agents/implementations/embedding.agent';
import { RAGAgent } from './agents/implementations/rag.agent';
import { DocumentProcessorAgent } from './agents/implementations/document.processor.agent';
import { DocumentProcessingWorkflow } from './workflows/definitions/document.processing.workflow';
import { RAGQueryWorkflow } from './workflows/definitions/rag.query.workflow';
import { BatchProcessWorkflow } from './workflows/definitions/batch.process.workflow';

export interface OpenClawConfig {
  redisUrl: string;
  concurrency?: number;
  logLevel?: string;
  enableMonitoring?: boolean;
}

export class OpenClawSystem {
  private static instance: OpenClawSystem;
  private logger: Logger;
  private registry: AgentRegistry;
  private queueService: QueueService;
  private orchestrator: OrchestratorAgent;
  private isInitialized: boolean = false;

  private constructor(config: OpenClawConfig) {
    this.logger = createLogger({ level: config.logLevel || 'info', name: 'openclaw' });
    this.queueService = new QueueService(config.redisUrl, this.logger, { concurrency: config.concurrency || 10 });
    this.registry = new AgentRegistry(this.logger);
    this.registerAgents();
    this.orchestrator = new OrchestratorAgent(this.logger, this.registry, this.queueService, {
      maxConcurrentTasks: 10,
      taskTimeout: 30000,
      enableParallelExecution: true,
      retryOnFailure: true
    });
    this.registerWorkflows();
    this.isInitialized = true;
    this.logger.info('OpenClaw system initialized successfully');
  }

  static getInstance(config: OpenClawConfig): OpenClawSystem {
    if (!OpenClawSystem.instance) {
      OpenClawSystem.instance = new OpenClawSystem(config);
    }
    return OpenClawSystem.instance;
  }

  private registerAgents(): void {
    const embeddingAgent = new EmbeddingAgent(this.logger);
    const ragAgent = new RAGAgent(this.logger);
    const docProcessor = new DocumentProcessorAgent(this.logger);

    this.registry.register(embeddingAgent);
    this.registry.register(ragAgent);
    this.registry.register(docProcessor);

    this.queueService.registerAgent(embeddingAgent);
    this.queueService.registerAgent(ragAgent);
    this.queueService.registerAgent(docProcessor);
    this.queueService.registerAgent(this.orchestrator);

    this.logger.info('All agents registered');
  }

  private registerWorkflows(): void {
    const docWorkflow = new DocumentProcessingWorkflow();
    const ragWorkflow = new RAGQueryWorkflow();
    const batchWorkflow = new BatchProcessWorkflow();

    this.orchestrator.registerWorkflows([docWorkflow, ragWorkflow, batchWorkflow]);
    this.logger.info(`Registered ${this.orchestrator.listWorkflows().length} workflows`);
  }

  async enqueueTask(task: any): Promise<string> {
    if (!this.isInitialized) throw new Error('OpenClaw system not initialized');
    return this.queueService.enqueueTask(task);
  }

  async enqueueBatch(tasks: any[]): Promise<string[]> {
    if (!this.isInitialized) throw new Error('OpenClaw system not initialized');
    return this.queueService.enqueueBatch(tasks);
  }

  async enqueueBulk(tasks: any[]): Promise<string[]> {
    if (!this.isInitialized) throw new Error('OpenClaw system not initialized');
    return this.queueService.enqueueBulk(tasks);
  }

  async executeWorkflow(workflowId: string, parameters?: Record<string, any>): Promise<any> {
    const workflow = this.orchestrator.getWorkflow(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);
    return this.orchestrator.execute({
      id: `workflow-${workflowId}-${Date.now()}`,
      type: 'workflow-execute',
      payload: { workflowId, parameters },
      context: { tenantId: 'default', requestId: `req-${Date.now()}`, timestamp: new Date() }
    });
  }

  async getStatus(): Promise<any> {
    if (!this.isInitialized) return { status: 'not-initialized' };
    const status = await this.orchestrator.getStatus();
    return { ...status, agents: this.registry.getStatus(), queueInfo: await this.queueService.getRedisInfo() };
  }

  async cleanQueue(): Promise<void> {
    await this.queueService.cleanQueue();
  }

  async pauseQueue(): Promise<void> {
    await this.queueService.pauseQueue();
  }

  async resumeQueue(): Promise<void> {
    await this.queueService.resumeQueue();
  }

  getRegistry(): AgentRegistry {
    return this.registry;
  }

  getOrchestrator(): OrchestratorAgent {
    return this.orchestrator;
  }

  async close(): Promise<void> {
    this.isInitialized = false;
    await this.registry.shutdownAll();
    await this.queueService.close();
    this.logger.info('OpenClaw system closed');
  }
}

export * from './agents/core/base.agent';
export * from './agents/core/agent.registry';
export * from './agents/orchestrator.agent';
export * from './queue';
export { createLogger } from '../sdk/shared/logger';
