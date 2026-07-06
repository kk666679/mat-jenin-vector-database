export interface EmbeddingResult {
  vector: number[];
  model: string;
  duration: number;
  dimensions: number;
}

export interface BatchEmbeddingResult {
  vectors: number[][];
  model: string;
  duration: number;
  dimensions: number;
}

export interface GenerationOptions {
  maxTokens?: number;
  temperature?: number;
  topK?: number;
  topP?: number;
  seed?: number;
}

export interface MLModelInfo {
  name: string;
  type: string;
  version: string;
  loaded: boolean;
  memory?: number;
}
