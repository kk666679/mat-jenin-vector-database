import { WorkflowDefinition } from '../../agents/orchestrator.agent';
import { AgentContext } from '../../agents/core/base.agent';

export class DocumentProcessingWorkflow implements WorkflowDefinition {
  id = 'process-document';
  name = 'Document Processing Workflow';
  description = 'Process a document through chunking, embedding, and indexing';
  version = '1.0.0';

  steps = [
    {
      id: 'chunk',
      name: 'Chunk Document',
      description: 'Split document into chunks',
      task: {
        id: `chunk-${Date.now()}`,
        type: 'process-document',
        payload: { action: 'chunk' },
        context: {} as AgentContext
      },
      dependencies: []
    },
    {
      id: 'embed',
      name: 'Generate Embeddings',
      description: 'Generate embeddings for chunks',
      task: {
        id: `embed-${Date.now()}`,
        type: 'embed-batch',
        payload: { batch: true },
        context: {} as AgentContext
      },
      dependencies: ['chunk']
    },
    {
      id: 'index',
      name: 'Index Documents',
      description: 'Index documents in vector database',
      task: {
        id: `index-${Date.now()}`,
        type: 'process-document',
        payload: { action: 'index' },
        context: {} as AgentContext
      },
      dependencies: ['embed']
    }
  ];

  onFailure = 'stop';
  onSuccess = (results: any[]) => {
    console.log(`Document processing workflow completed with ${results.length} steps`);
  };
}
