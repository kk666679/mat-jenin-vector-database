import { Skill } from '../registry/skill.registry';
import { MLService } from '../../../sdk/ml';
import { Logger } from '../../../sdk/shared/logger';

export function createEmbeddingSkill(logger: Logger): Skill {
  const mlService = new MLService(logger);

  return {
    id: 'embedding-v1',
    name: 'Text Embedding',
    version: '1.0.0',
    description: 'Generate embeddings for text using transformer models',
    category: 'embedding',
    capabilities: ['text-embedding', 'semantic-search', 'similarity'],
    config: {
      defaultModel: 'Xenova/all-MiniLM-L6-v2',
      batchSize: 32
    },
    estimatedCost: 0.001,

    validate: (input: any) => {
      return input && typeof input.text === 'string';
    },

    execute: async (input: any, context: any) => {
      const { text, model = 'Xenova/all-MiniLM-L6-v2', batch = false } = input;
      
      if (batch && Array.isArray(text)) {
        const result = await mlService.batchEmbed(text, model);
        return {
          vectors: result.vectors,
          dimensions: result.dimensions,
          count: result.vectors.length,
          model: result.model
        };
      } else {
        const result = await mlService.embedText(text, model);
        return {
          vector: result.vector,
          dimensions: result.dimensions,
          model: result.model
        };
      }
    }
  };
}
