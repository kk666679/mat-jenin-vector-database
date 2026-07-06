import { WorkflowDefinition } from '../../agents/orchestrator.agent';

export class WorkflowTemplate {
  static createDefault(config: {
    id: string;
    name: string;
    description: string;
    steps: any[];
  }): WorkflowDefinition {
    return {
      id: config.id,
      steps: config.steps.map(step => ({
        ...step,
        task: {
          ...step.task,
          context: {
            tenantId: 'default',
            requestId: `${config.id}-${Date.now()}`,
            timestamp: new Date()
          }
        }
      })),
      onFailure: 'continue',
      onSuccess: (results) => {
        console.log(`Workflow ${config.id} completed`);
      }
    };
  }
}
