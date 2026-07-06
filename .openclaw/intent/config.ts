import { createIntent } from '@tanstack/intent';
import { Logger } from '../../sdk/shared/logger';

export interface IntentConfig {
  enabled: boolean;
  modelPath: string;
  confidenceThreshold: number;
  maxEntities: number;
  trainingDataPath: string;
}

export const defaultIntentConfig: IntentConfig = {
  enabled: true,
  modelPath: '.openclaw/intent/models',
  confidenceThreshold: 0.7,
  maxEntities: 10,
  trainingDataPath: '.openclaw/intent/training'
};

export class IntentService {
  private intent: any;
  private logger: Logger;
  private config: IntentConfig;

  constructor(logger: Logger, config: Partial<IntentConfig> = {}) {
    this.logger = logger.child({ service: 'IntentService' });
    this.config = { ...defaultIntentConfig, ...config };
    this.initializeIntent();
  }

  private async initializeIntent() {
    try {
      this.intent = createIntent({
        modelPath: this.config.modelPath,
        confidenceThreshold: this.config.confidenceThreshold
      });
      this.logger.info('Intent service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize intent service:', error);
    }
  }

  async detectIntent(text: string): Promise<IntentResult> {
    try {
      const result = await this.intent.predict(text);
      return {
        intent: result.intent,
        confidence: result.confidence,
        entities: result.entities,
        raw: result
      };
    } catch (error) {
      this.logger.error('Intent detection failed:', error);
      return {
        intent: 'unknown',
        confidence: 0,
        entities: {},
        raw: null
      };
    }
  }

  async train(data: TrainingData[]): Promise<void> {
    try {
      await this.intent.train(data);
      this.logger.info('Intent model trained successfully');
    } catch (error) {
      this.logger.error('Training failed:', error);
      throw error;
    }
  }

  async saveModel(): Promise<void> {
    try {
      await this.intent.save();
      this.logger.info('Intent model saved');
    } catch (error) {
      this.logger.error('Failed to save model:', error);
    }
  }

  async loadModel(): Promise<void> {
    try {
      await this.intent.load();
      this.logger.info('Intent model loaded');
    } catch (error) {
      this.logger.error('Failed to load model:', error);
    }
  }
}

export interface IntentResult {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  raw: any;
}

export interface TrainingData {
  text: string;
  intent: string;
  entities?: Record<string, any>;
}
