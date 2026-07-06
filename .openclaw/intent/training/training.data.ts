import { TrainingData } from '../config';

export const trainingData: TrainingData[] = [
  // Document intents
  {
    text: 'Upload a document for processing',
    intent: 'upload_document',
    entities: {
      action: 'upload'
    }
  },
  {
    text: 'Process this PDF file',
    intent: 'process_document',
    entities: {
      fileType: 'pdf'
    }
  },
  {
    text: 'Search for documents about AI',
    intent: 'search_documents',
    entities: {
      query: 'AI'
    }
  },
  {
    text: 'Find documents about machine learning',
    intent: 'search_documents',
    entities: {
      query: 'machine learning'
    }
  },

  // RAG intents
  {
    text: 'Ask a question about the document',
    intent: 'rag_query',
    entities: {
      type: 'question'
    }
  },
  {
    text: 'What does the document say about AI?',
    intent: 'rag_query',
    entities: {
      topic: 'AI'
    }
  },
  {
    text: 'Summarize this document',
    intent: 'summarize',
    entities: {
      action: 'summarize'
    }
  },
  {
    text: 'Get a summary of the main points',
    intent: 'summarize',
    entities: {
      detail: 'main points'
    }
  },

  // Chat intents
  {
    text: 'Chat with the AI assistant',
    intent: 'chat',
    entities: {
      type: 'general'
    }
  },
  {
    text: 'Hello, how are you?',
    intent: 'chat',
    entities: {
      sentiment: 'greeting'
    }
  },
  {
    text: 'What can you help me with?',
    intent: 'help',
    entities: {
      type: 'assistance'
    }
  },

  // System intents
  {
    text: 'Check system status',
    intent: 'system_status',
    entities: {
      type: 'status'
    }
  },
  {
    text: 'Show me the metrics',
    intent: 'view_metrics',
    entities: {
      type: 'metrics'
    }
  },
  {
    text: 'Clear the queue',
    intent: 'clear_queue',
    entities: {
      action: 'clear'
    }
  },

  // Workflow intents
  {
    text: 'Process documents in batch',
    intent: 'batch_process',
    entities: {
      action: 'batch'
    }
  },
  {
    text: 'Run the document processing workflow',
    intent: 'run_workflow',
    entities: {
      workflow: 'document_processing'
    }
  },
  {
    text: 'Execute RAG query workflow',
    intent: 'run_workflow',
    entities: {
      workflow: 'rag_query'
    }
  }
];

export const intentCategories = {
  document: ['upload_document', 'process_document', 'search_documents'],
  rag: ['rag_query', 'summarize'],
  chat: ['chat', 'help'],
  system: ['system_status', 'view_metrics', 'clear_queue'],
  workflow: ['batch_process', 'run_workflow']
};
