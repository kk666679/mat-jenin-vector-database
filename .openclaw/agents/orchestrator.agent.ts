import { BaseAgent, AgentTask, AgentResult, AgentContext } from './core/base.agent';
import { AgentRegistry } from './core/agent.registry';
import { Logger } from '../../sdk/shared/logger';
import { QueueService } from '../queue';

export interface OrchestratorConfig {
  maxConcurrentTasks?: number;
  taskTimeout?: number;
  enableParallelExecution?: boolean;
  retryOnFailure?: boolean;
  maxRetries?: number;
}

export interface WorkflowDefinition {
  id: string;
  name?: string;
  description?: string;
  version?: string;
  steps: WorkflowStep[];
  onFailure?: 'stop' | 'continue';
  onSuccess?: (results: AgentResult[]) => void;
  onError?: (error: Error, step: WorkflowStep) => void;
}

export interface WorkflowStep {
  id: string;
  name?: string;
  description?: string;
  task: AgentTask;
  dependencies?: string[];
  onError?: (error: Error) => void;
  retryCount?: number;
}

export class OrchestratorAgent extends BaseAgent {
  private registry: AgentRegistry;
  private queueService: QueueService;
  private config: OrchestratorConfig;
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private runningWorkflows: Map<string, any> = new Map();

  constructor(logger: Logger, registry: AgentRegistry, queueService: QueueService, config?: OrchestratorConfig) {
    super('OrchestratorAgent', '1.0.0', logger);
    this.registry = registry;
    this.queueService = queueService;
    this.config = {
      maxConcurrentTasks: 10,
      taskTimeout: 30000,
      enableParallelExecution: true,
      retryOnFailure: true,
      maxRetries: 3,
      ...config
    };
    this.capabilities = [
      {
        name: 'orchestrate',
        description: 'Orchestrate multiple tasks or workflows',
        inputSchema: { tasks: 'array', workflowId: 'string' },
        outputSchema: { results: 'array' },
        version: '1.0.0'
      },
      {
        name: 'workflow-execute',
        description: 'Execute a defined workflow',
        inputSchema: { workflowId: 'string', parameters: 'object' },
        outputSchema: { status: 'string', results: 'array' },
        version: '1.0.0'
      }
    ];
  }

  canHandle(task: AgentTask): boolean {
    return ['orchestrate', 'workflow-execute'].includes(task.type);
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    const { workflowId, tasks, context, parameters } = task.payload;

    if (workflowId) {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) throw new Error(`Workflow ${workflowId} not found`);
      return this.executeWorkflow(workflow, context || task.context, parameters);
    }

    if (tasks) {
      return this.executeParallel(tasks, context || task.context);
    }

    throw new Error('Invalid orchestration task: missing workflowId or tasks');
  }

  async executeWorkflow(workflow: WorkflowDefinition, context: AgentContext, parameters?: Record<string, any>): Promise<AgentResult> {
    if (this.runningWorkflows.has(workflow.id)) {
      throw new Error(`Workflow ${workflow.id} is already running`);
    }

    const workflowRun = { workflowId: workflow.id, startTime: new Date(), steps: new Map() };
    this.runningWorkflows.set(workflow.id, workflowRun);
    this.logger.info(`Executing workflow: ${workflow.id} (${workflow.name || 'unnamed'})`);
    
    const results: AgentResult[] = [];
    const completedTasks = new Set<string>();
    const resultMap = new Map<string, AgentResult>();
    const errorMap = new Map<string, Error>();

    const taskMap = new Map<string, AgentTask>();
    workflow.steps.forEach(step => {
      const task = { ...step.task };
      if (parameters) task.payload = { ...task.payload, ...parameters };
      task.context = { ...context };
      taskMap.set(step.id, task);
    });

    for (const step of workflow.steps) {
      try {
        if (step.dependencies) {
          const allDependenciesCompleted = step.dependencies.every(dep => completedTasks.has(dep));
          if (!allDependenciesCompleted) continue;
        }

        this.logger.info(`Executing step: ${step.id} (${step.name || 'unnamed'})`);
        const task = taskMap.get(step.id);
        if (!task) throw new Error(`Task for step ${step.id} not found`);

        let result: AgentResult;
        let attempts = 0;
        const maxRetries = step.retryCount || this.config.maxRetries || 3;

        while (attempts <= maxRetries) {
          try {
            const taskId = await this.queueService.enqueueTask(task);
            await new Promise(resolve => setTimeout(resolve, 500));
            result = { success: true, data: { taskId }, taskId: task.id, metadata: { step: step.id, attempt: attempts + 1 } };
            break;
          } catch (error) {
            attempts++;
            if (attempts > maxRetries) throw error;
            this.logger.warn(`Step ${step.id} failed, retrying (${attempts}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }

        results.push(result!);
        completedTasks.add(step.id);
        resultMap.set(step.id, result!);
        workflowRun.steps.set(step.id, { status: 'completed', result: result! });
        this.logger.info(`Step ${step.id} completed successfully`);
      } catch (error) {
        this.logger.error(`Step ${step.id} failed:`, error);
        errorMap.set(step.id, error);
        workflowRun.steps.set(step.id, { status: 'failed', error });
        if (step.onError) step.onError(error);
        if (workflow.onError) workflow.onError(error, step);
        if (workflow.onFailure === 'stop') {
          this.runningWorkflows.delete(workflow.id);
          return {
            success: false,
            error: `Workflow ${workflow.id} failed at step ${step.id}: ${error.message}`,
            taskId: 'orchestrator',
            metadata: { failedStep: step.id, completedSteps: completedTasks.size, totalSteps: workflow.steps.length, timestamp: new Date().toISOString() }
          };
        }
      }
    }

    if (workflow.onSuccess) workflow.onSuccess(results);
    this.runningWorkflows.delete(workflow.id);

    return {
      success: true,
      data: {
        workflowId: workflow.id,
        results: Array.from(resultMap.values()),
        completedSteps: completedTasks.size,
        totalSteps: workflow.steps.length,
        errors: Array.from(errorMap.entries()).map(([id, error]) => ({ step: id, error: error.message }))
      },
      taskId: 'orchestrator',
      metadata: {
        workflowId: workflow.id,
        timestamp: new Date().toISOString(),
        duration: Date.now() - workflowRun.startTime.getTime()
      }
    };
  }

  async executeParallel(tasks: AgentTask[], context: AgentContext): Promise<AgentResult> {
    this.logger.info(`Executing ${tasks.length} tasks in parallel`);
    const enqueuedTasks = await Promise.all(tasks.map(task => this.queueService.enqueueTask(task)));
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: { enqueued: enqueuedTasks, totalTasks: tasks.length },
      taskId: 'orchestrator',
      metadata: { totalTasks: tasks.length, timestamp: new Date().toISOString() }
    };
  }

  registerWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
    this.logger.info(`Registered workflow: ${workflow.id} (${workflow.name || 'unnamed'})`);
  }

  registerWorkflows(workflows: WorkflowDefinition[]): void {
    workflows.forEach(w => this.registerWorkflow(w));
  }

  getWorkflow(id: string): WorkflowDefinition | undefined {
    return this.workflows.get(id);
  }

  listWorkflows(): string[] {
    return Array.from(this.workflows.keys());
  }

  getRunningWorkflows(): any[] {
    return Array.from(this.runningWorkflows.entries()).map(([id, run]) => ({
      workflowId: id,
      startTime: run.startTime,
      steps: Array.from(run.steps.entries()).map(([stepId, info]) => ({ stepId, status: info.status, hasError: !!info.error }))
    }));
  }

  async getStatus(): Promise<any> {
    const queueStats = await this.queueService.getQueueStats();
    return {
      status: 'running',
      queueStats,
      workflows: this.listWorkflows(),
      runningWorkflows: this.getRunningWorkflows(),
      config: this.config,
      timestamp: new Date().toISOString()
    };
  }

  async initialize(): Promise<void> {
    await super.initialize();
    this.logger.info(`Orchestrator initialized with ${this.workflows.size} workflows`);
  }
}
