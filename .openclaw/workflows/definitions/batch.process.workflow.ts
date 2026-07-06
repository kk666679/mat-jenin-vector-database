import { WorkflowDefinition } from '../../agents/orchestrator.agent';
import { AgentContext } from '../../agents/core/base.agent';

export class BatchProcessWorkflow implements WorkflowDefinition {
  id = 'batch-process';
  name = 'Batch Processing Workflow';
  description = 'Process multiple documents in batch';
  version = '1.0.0';

  steps = [
    {
      id: 'prepare',
      name: 'Prepare Documents',
      description: 'Prepare documents for processing',
      task: {
        id: `prepare-${Date.now()}`,
        type: 'process-document',
        payload: { action: 'prepare' },
        context: {} as AgentContext
      },
      dependencies: []
    },
    {
      id: 'process-parallel',
      name: 'Process Documents in Parallel',
      description: 'Process documents concurrently',
      task: {
        id: `process-${Date.now()}`,
        type: 'process-document',
        payload: { action: 'batch' },
        context: {} as AgentContext
      },
      dependencies: ['prepare']
    },
    {
      id: 'validate',
      name: 'Validate Results',
      description: 'Validate processing results',
      task: {
        id: `validate-${Date.now()}`,
        type: 'validate-data',
        payload: { action: 'validate' },
        context: {} as AgentContext
      },
      dependencies: ['process-parallel']
    }
  ];

  onFailure = 'stop';
  onSuccess = (results: any[]) => {
    console.log(`Batch processing workflow completed with ${results.length} steps`);
  };
}
