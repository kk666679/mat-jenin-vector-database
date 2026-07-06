#!/usr/bin/env ts-node

import { createLogger } from '../../sdk/shared/logger';
import { OpenClawSystem } from '../index';

const logger = createLogger({ level: 'info', name: 'openclaw-test', pretty: true });
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

async function testOpenClawSystem() {
  logger.info('🧪 Testing OpenClaw System...');

  try {
    logger.info('Initializing OpenClaw system...');
    const system = OpenClawSystem.getInstance({ redisUrl, logLevel: 'info' });
    
    logger.info('Test 1: Getting status...');
    const status = await system.getStatus();
    logger.info('Status:', status);

    logger.info('Test 2: Enqueue embedding task...');
    const embedResult = await system.enqueueTask({
      id: `embed-${Date.now()}`,
      type: 'embed-text',
      payload: { text: 'This is a test document for embedding.', model: 'Xenova/all-MiniLM-L6-v2' },
      priority: 1,
      context: { tenantId: 'test', requestId: `test-${Date.now()}`, timestamp: new Date() }
    });
    logger.info('Embedding task enqueued:', embedResult);

    logger.info('Test 3: Enqueue document processing...');
    const docResult = await system.enqueueTask({
      id: `doc-${Date.now()}`,
      type: 'process-document',
      payload: {
        content: 'This is a test document. It contains multiple sentences. We will process it for RAG.',
        metadata: { filename: 'test.txt', mimeType: 'text/plain' },
        chunkSize: 100,
        overlap: 20
      },
      priority: 2,
      context: { tenantId: 'test', requestId: `test-${Date.now()}`, timestamp: new Date() }
    });
    logger.info('Document processing task enqueued:', docResult);

    logger.info('Test 4: Executing RAG workflow...');
    const ragResult = await system.executeWorkflow('rag-query', {
      query: 'What is this document about?',
      topK: 5,
      includeSources: true
    });
    logger.info('RAG workflow result:', ragResult);

    logger.info('Test 5: Getting final status...');
    const finalStatus = await system.getStatus();
    logger.info('Final status:', finalStatus);

    logger.info('Test 6: Listing workflows...');
    const orchestrator = system.getOrchestrator();
    const workflows = orchestrator.listWorkflows();
    logger.info('Available workflows:', workflows);

    logger.info('✅ All tests completed successfully!');
    await system.close();
  } catch (error) {
    logger.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testOpenClawSystem();
