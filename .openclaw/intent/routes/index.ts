import { RouteHandler } from '../../agents/intent/intent.agent';
import { IntentResult } from '../config';

export const createIntentRoutes = (services: any): Record<string, RouteHandler> => {
  return {
    'upload_document': async (result: IntentResult, context: any) => {
      return {
        action: 'upload',
        fileType: result.entities.fileType || 'any',
        message: 'Document upload initiated'
      };
    },

    'process_document': async (result: IntentResult, context: any) => {
      return {
        action: 'process',
        documentId: result.entities.documentId || context.documentId,
        message: 'Document processing started'
      };
    },

    'search_documents': async (result: IntentResult, context: any) => {
      return {
        action: 'search',
        query: result.entities.query,
        message: `Searching for: ${result.entities.query}`
      };
    },

    'rag_query': async (result: IntentResult, context: any) => {
      return {
        action: 'rag',
        query: result.entities.topic || result.text,
        message: 'Processing RAG query'
      };
    },

    'summarize': async (result: IntentResult, context: any) => {
      return {
        action: 'summarize',
        detail: result.entities.detail || 'general',
        message: 'Generating summary'
      };
    },

    'chat': async (result: IntentResult, context: any) => {
      return {
        action: 'chat',
        message: result.text,
        sentiment: result.entities.sentiment || 'neutral'
      };
    },

    'help': async (result: IntentResult, context: any) => {
      return {
        action: 'help',
        message: 'I can help you with document processing, RAG queries, and more!'
      };
    },

    'system_status': async (result: IntentResult, context: any) => {
      return {
        action: 'status',
        message: 'System is running normally'
      };
    },

    'view_metrics': async (result: IntentResult, context: any) => {
      return {
        action: 'metrics',
        type: result.entities.type || 'all',
        message: 'Retrieving metrics'
      };
    },

    'clear_queue': async (result: IntentResult, context: any) => {
      return {
        action: 'clear',
        message: 'Queue cleared successfully'
      };
    },

    'batch_process': async (result: IntentResult, context: any) => {
      return {
        action: 'batch',
        message: 'Batch processing started'
      };
    },

    'run_workflow': async (result: IntentResult, context: any) => {
      return {
        action: 'workflow',
        workflow: result.entities.workflow || 'default',
        message: `Running workflow: ${result.entities.workflow || 'default'}`
      };
    },

    'unknown': async (result: IntentResult, context: any) => {
      return {
        action: 'unknown',
        message: 'I didn\'t understand that. Please try again.',
        confidence: result.confidence
      };
    }
  };
};
