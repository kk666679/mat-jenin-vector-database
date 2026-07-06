import { WorkflowDefinition } from '../../agents/orchestrator.agent';
import { AgentContext } from '../../agents/core/base.agent';

export class RAGQueryWorkflow implements WorkflowDefinition {
  id = 'rag-query';
  name = 'RAG Query Workflow';
  description = 'Execute a RAG query with retrieval and generation';
  version = '1.0.0';

  steps = [
    {
      id: 'embed-query',
      name: 'Embed Query',
      description: 'Generate embedding for query',
      task: {
        id: `embed-query-${Date.now()}`,
        type: 'embed-text',
        payload: { text: '' },
        context: {} as AgentContext
      },
      dependencies: []
    },
    {
      id: 'search',
      name: 'Search Documents',
      description: 'Search for relevant documents',
      task: {
        id: `search-${Date.now()}`,
        type: 'rag-search',
        payload: { searchType: 'hybrid' },
        context: {} as AgentContext
      },
      dependencies: ['embed-query']
    },
    {
      id: 'generate',
      name: 'Generate Answer',
      description: 'Generate answer using LLM',
      task: {
        id: `rag-${Date.now()}`,
        type: 'rag-query',
        payload: {},
        context: {} as AgentContext
      },
      dependencies: ['search']
    }
  ];

  onFailure = 'continue';
  onSuccess = (results: any[]) => {
    console.log(`RAG query workflow completed with ${results.length} steps`);
  };
}
