import { Benchmark, TestCase } from '../evaluator';

export const RAGBenchmark: Benchmark = {
  id: 'rag-benchmark-v1',
  name: 'RAG Performance Benchmark',
  description: 'Evaluates RAG skills on accuracy and response quality',
  
  tests: [
    {
      id: 'basic-qa',
      name: 'Basic Question Answering',
      input: {
        query: 'What is artificial intelligence?',
        topK: 3
      },
      expectedOutput: {
        answer: 'Artificial intelligence is the simulation of human intelligence in machines.',
        confidence: 0.8
      },
      validator: (output: any, expected: any) => {
        return output.answer && output.answer.length > 10 && output.confidence > 0.5;
      },
      weight: 1.0
    },
    {
      id: 'context-qa',
      name: 'Context-Based Question Answering',
      input: {
        query: 'How does machine learning work?',
        topK: 5,
        includeSources: true
      },
      expectedOutput: {
        answer: 'Machine learning enables systems to learn from data.',
        sources: expect.any(Array)
      },
      validator: (output: any, expected: any) => {
        return output.answer && output.answer.length > 10 && output.sources && output.sources.length > 0;
      },
      weight: 1.5
    }
  ],
  
  weight: {
    accuracy: 0.7,
    latency: 0.2,
    sourceQuality: 0.1
  }
};

// Helper for test validation
function expect(thing: any) {
  return thing;
}
