import { IntentTestSuite } from './intent.evaluator';

export const documentIntentsSuite: IntentTestSuite = {
  id: 'document-intents',
  name: 'Document Intents',
  description: 'Tests for document-related intents',
  tests: [
    { text: 'Upload a PDF', expectedIntent: 'upload_document', expectedEntities: { fileType: 'pdf' } },
    { text: 'Process my document', expectedIntent: 'process_document' },
    { text: 'Search for AI documents', expectedIntent: 'search_documents', expectedEntities: { query: 'AI' } },
    { text: 'Find documents about machine learning', expectedIntent: 'search_documents', expectedEntities: { query: 'machine learning' } }
  ]
};

export const ragIntentsSuite: IntentTestSuite = {
  id: 'rag-intents',
  name: 'RAG Intents',
  description: 'Tests for RAG-related intents',
  tests: [
    { text: 'What does the document say about AI?', expectedIntent: 'rag_query', expectedEntities: { topic: 'AI' } },
    { text: 'Summarize this document', expectedIntent: 'summarize' },
    { text: 'Give me a summary', expectedIntent: 'summarize' },
    { text: 'Ask a question about the content', expectedIntent: 'rag_query', expectedEntities: { type: 'question' } }
  ]
};

export const chatIntentsSuite: IntentTestSuite = {
  id: 'chat-intents',
  name: 'Chat Intents',
  description: 'Tests for chat-related intents',
  tests: [
    { text: 'Hello, how are you?', expectedIntent: 'chat', expectedEntities: { sentiment: 'greeting' } },
    { text: 'What can you help with?', expectedIntent: 'help' },
    { text: 'Hi there', expectedIntent: 'chat' }
  ]
};

export const systemIntentsSuite: IntentTestSuite = {
  id: 'system-intents',
  name: 'System Intents',
  description: 'Tests for system-related intents',
  tests: [
    { text: 'Check system status', expectedIntent: 'system_status' },
    { text: 'Show metrics', expectedIntent: 'view_metrics' },
    { text: 'Clear the queue', expectedIntent: 'clear_queue' }
  ]
};

export const allIntentSuites = [
  documentIntentsSuite,
  ragIntentsSuite,
  chatIntentsSuite,
  systemIntentsSuite
];
