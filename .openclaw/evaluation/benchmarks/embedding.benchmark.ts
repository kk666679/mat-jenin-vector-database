import { Benchmark } from '../evaluator';

export const EmbeddingBenchmark: Benchmark = {
  id: 'embedding-benchmark-v1',
  name: 'Embedding Quality Benchmark',
  description: 'Evaluates embedding skills on accuracy and similarity',
  
  tests: [
    {
      id: 'similarity',
      name: 'Similarity Detection',
      input: {
        text: 'Artificial intelligence is transforming the world.',
        model: 'Xenova/all-MiniLM-L6-v2'
      },
      expectedOutput: {
        vector: expect.any(Array),
        dimensions: 384
      },
      validator: (output: any, expected: any) => {
        return output.vector && output.vector.length === 384;
      },
      weight: 1.0
    },
    {
      id: 'semantic-similarity',
      name: 'Semantic Similarity',
      input: {
        texts: ['AI is the future', 'Artificial intelligence will change everything'],
        batch: true,
        model: 'Xenova/all-MiniLM-L6-v2'
      },
      expectedOutput: {
        vectors: expect.any(Array),
        dimensions: 384
      },
      validator: (output: any, expected: any) => {
        return output.vectors && output.vectors.length === 2 && output.vectors[0].length === 384;
      },
      weight: 1.5
    }
  ]
};

function expect(thing: any) {
  return thing;
}
