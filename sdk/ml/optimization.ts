/**
 * ML Model Optimization Utilities
 * Based on machine-learning-engineer skill - Model Optimization
 */

import type { OptimizationConfig, OptimizationResult, QuantizationType } from './types';

// ============================================
// MODEL OPTIMIZATION
// ============================================

/**
 * Optimize model for inference
 * Provides configuration for various optimization techniques
 */
export class ModelOptimizer {
  private config: OptimizationConfig;

  constructor(config: OptimizationConfig = {}) {
    this.config = {
      quantization: 'fp16',
      pruning: false,
      pruningRatio: 0.3,
      knowledgeDistillation: false,
      onnxExport: false,
      tensorrtEnabled: false,
      graphOptimization: true,
      ...config,
    };
  }

  /**
   * Get optimization configuration
   */
  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  /**
   * Update optimization configuration
   */
  updateConfig(config: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Estimate size reduction from optimization
   */
  estimateSizeReduction(originalSizeBytes: number): OptimizationResult {
    let reductionFactor = 1;

    // Quantization reduction
    switch (this.config.quantization) {
      case 'fp32':
        reductionFactor *= 1;
        break;
      case 'fp16':
        reductionFactor *= 0.5;
        break;
      case 'int8':
        reductionFactor *= 0.25;
        break;
      case 'int4':
        reductionFactor *= 0.125;
        break;
    }

    // Pruning reduction
    if (this.config.pruning && this.config.pruningRatio) {
      reductionFactor *= (1 - this.config.pruningRatio);
    }

    const optimizedSize = Math.round(originalSizeBytes * reductionFactor);
    const sizeReduction = Math.round((1 - reductionFactor) * 100);

    // Estimate latency improvement
    let estimatedLatency: number | undefined;
    if (this.config.quantization === 'int8' || this.config.quantization === 'int4') {
      estimatedLatency = 0.4; // ~60% faster
    } else if (this.config.quantization === 'fp16') {
      estimatedLatency = 0.7; // ~30% faster
    }

    return {
      originalSize: originalSizeBytes,
      optimizedSize,
      sizeReduction,
      outputPath: this.generateOutputPath(),
      ...(estimatedLatency !== undefined && { estimatedLatency }),
    };
  }

  /**
   * Generate output path based on configuration
   */
  private generateOutputPath(): string {
    const quant = this.config.quantization || 'fp32';
    const pruning = this.config.pruning ? '_pruned' : '';
    const onnx = this.config.onnxExport ? '_onnx' : '';
    return `/models/optimized/model_${quant}${pruning}${onnx}.bin`;
  }

  /**
   * Create ONNX conversion configuration
   */
  createONNXConfig(): ONNXConversionConfig {
    const config: ONNXConversionConfig = {
      optimize: this.config.graphOptimization || true,
      opsetVersion: 14,
      inputNames: ['input'],
      outputNames: ['output'],
    };
    
    if (this.config.quantization !== undefined) {
      config.quantization = this.config.quantization;
    }
    
    return config;
  }

  /**
   * Create TensorRT optimization configuration
   */
  createTensorRTConfig(): TensorRTConfig {
    if (!this.config.tensorrtEnabled) {
      throw new Error('TensorRT is not enabled in configuration');
    }

    return {
      precision: this.config.quantization || 'fp16',
      workspaceSize: 1 << 30, // 1GB
      maxBatchSize: 32,
      minInputSize: 1,
      optInputSize: 16,
      maxInputSize: 32,
    };
  }
}

// ============================================
// QUANTIZATION HELPERS
// ============================================

export interface ONNXConversionConfig {
  optimize: boolean;
  quantization?: QuantizationType;
  opsetVersion: number;
  inputNames: string[];
  outputNames: string[];
}

export interface TensorRTConfig {
  precision: QuantizationType;
  workspaceSize: number;
  maxBatchSize: number;
  minInputSize: number;
  optInputSize: number;
  maxInputSize: number;
}

/**
 * Quantize a float32 array to specified precision
 */
export function quantizeTensor(
  data: Float32Array,
  targetType: QuantizationType
): { data: Int8Array | Uint8Array | Float32Array; scale: number; zeroPoint?: number } {
  switch (targetType) {
    case 'fp16': {
      // Convert to float16 (as float32 for simplicity, in production use proper fp16)
      return { data: data, scale: 1 };
    }
    case 'int8': {
      // Find min and max for symmetric quantization
      const min = Math.min(...data);
      const max = Math.max(...data);
      const scale = (max - min) / 255 || 1;
      const zeroPoint = Math.round(-min / scale);

      const quantized = new Int8Array(data.length);
      for (let i = 0; i < data.length; i++) {
        const val = data[i];
        if (val !== undefined) {
          quantized[i] = Math.round(val / scale) + zeroPoint - 128;
        }
      }

      return { data: quantized, scale, zeroPoint };
    }
    case 'int4': {
      // 4-bit quantization
      const min = Math.min(...data);
      const max = Math.max(...data);
      const scale = (max - min) / 15 || 1;

      const quantized = new Uint8Array(Math.ceil(data.length / 2));
      for (let i = 0; i < data.length; i += 2) {
        const v1 = Math.min(15, Math.round((data[i] ?? 0) / scale));
        const v2 = i + 1 < data.length ? Math.min(15, Math.round((data[i + 1] ?? 0) / scale)) : 0;
        quantized[Math.floor(i / 2)] = (v1 << 4) | v2;
      }

      return { data: quantized, scale };
    }
    default:
      return { data: data, scale: 1 };
  }
}

/**
 * Dequantize tensor back to float32
 */
export function dequantizeTensor(
  data: Int8Array | Uint8Array | Float32Array,
  scale: number,
  zeroPoint?: number,
  originalType?: QuantizationType
): Float32Array {
  if (originalType === 'int8' && zeroPoint !== undefined) {
    const result = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const val = data[i];
      if (val !== undefined) {
        result[i] = ((val - zeroPoint + 128) * scale);
      }
    }
    return result;
  }

  if (originalType === 'int4') {
    const result = new Float32Array(data.length * 2);
    for (let i = 0; i < data.length; i++) {
      const val = data[i];
      if (val !== undefined) {
        const v1 = (val >> 4) & 0x0f;
        const v2 = val & 0x0f;
        result[i * 2] = v1 * scale;
        if (i * 2 + 1 < result.length) {
          result[i * 2 + 1] = v2 * scale;
        }
      }
    }
    return result;
  }

  return new Float32Array(data as Float32Array);
}

// ============================================
// MODEL PRUNING
// ============================================

/**
 * Prune model weights based on threshold
 */
export function pruneWeights(
  weights: Float32Array,
  threshold: number,
  _method: 'magnitude' | 'gradient' = 'magnitude'
): { prunedWeights: Float32Array; mask: Uint8Array; sparsity: number } {
  const mask = new Uint8Array(weights.length);
  let nonZeroCount = 0;

  for (let i = 0; i < weights.length; i++) {
    const val = weights[i];
    const absValue = Math.abs(val ?? 0);
    if (absValue > threshold) {
      mask[i] = 1;
      nonZeroCount++;
    } else {
      mask[i] = 0;
    }
  }

  // Apply mask
  const prunedWeights = new Float32Array(weights.length);
  for (let i = 0; i < weights.length; i++) {
    const val = weights[i];
    if (val !== undefined) {
      prunedWeights[i] = (val ?? 0) * (mask[i] ?? 0);
    }
  }

  const sparsity = 1 - nonZeroCount / weights.length;

  return { prunedWeights, mask, sparsity };
}

/**
 * Calculate optimal pruning threshold
 */
export function calculatePruningThreshold(
  weights: Float32Array,
  targetSparsity: number
): number {
  const sorted = [...weights].map(Math.abs).sort((a, b) => a - b);
  const index = Math.floor(sorted.length * targetSparsity);
  return sorted[index] ?? 0;
}

// ============================================
// KNOWLEDGE DISTILLATION
// ============================================

/**
 * Knowledge distillation loss function
 */
export function distillationLoss(
  student_logits: number[],
  teacher_logits: number[],
  labels: number[],
  temperature: number = 3,
  alpha: number = 0.5
): number {
  // Soft target loss (KL divergence)
  const softStudent = softmax(student_logits.map(v => v / temperature));
  const softTeacher = softmax(teacher_logits.map(v => v / temperature));
  
  let klLoss = 0;
  for (let i = 0; i < softStudent.length; i++) {
    const teacherVal = softTeacher[i];
    const studentVal = softStudent[i];
    if (teacherVal !== undefined && studentVal !== undefined && teacherVal > 0) {
      klLoss += teacherVal * Math.log(teacherVal / studentVal);
    }
  }

  // Hard target loss (cross entropy)
  const hardStudent = softmax(student_logits);
  let ceLoss = 0;
  for (let i = 0; i < labels.length; i++) {
    const studentVal = hardStudent[i];
    if (studentVal !== undefined && labels[i] === 1) {
      ceLoss -= Math.log(studentVal + 1e-10);
    }
  }

  // Combined loss
  const softLoss = klLoss * (temperature * temperature);
  return alpha * softLoss + (1 - alpha) * ceLoss;
}

/**
 * Softmax function
 */
function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => v / sum);
}

// ============================================
// ONNX UTILITIES
// ============================================

/**
 * Convert model to ONNX format (placeholder)
 * In production, this would use torch.onnx or onnx converter
 */
export async function convertToONNX(
  modelPath: string,
  outputPath: string,
  config?: ONNXConversionConfig
): Promise<{ success: boolean; outputPath: string; size: number }> {
  // Placeholder implementation
  // In production, use onnx converter
  console.log('Converting to ONNX:', { modelPath, outputPath, config });
  
  return {
    success: true,
    outputPath,
    size: 0, // Would be actual size
  };
}

/**
 * Optimize ONNX model
 */
export async function optimizeONNX(
  modelPath: string,
  outputPath: string,
  optimizations?: string[]
): Promise<{ success: boolean; outputPath: string }> {
  // Placeholder for ONNX optimization
  // In production, use onnxruntime.transformers
  console.log('Optimizing ONNX:', { modelPath, outputPath, optimizations });
  
  return {
    success: true,
    outputPath,
  };
}

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Create model optimizer with configuration from environment
 */
export function createModelOptimizer(): ModelOptimizer {
  const config: OptimizationConfig = {
    quantization: (process.env.ML_QUANTIZATION as QuantizationType) || 'fp16',
    pruning: process.env.ML_PRUNING === 'true',
    pruningRatio: parseFloat(process.env.ML_PRUNING_RATIO || '0.3'),
    knowledgeDistillation: process.env.ML_DISTILLATION === 'true',
    onnxExport: process.env.ML_ONNX_EXPORT === 'true',
    tensorrtEnabled: process.env.ML_TENSORRT === 'true',
    graphOptimization: process.env.ML_GRAPH_OPT !== 'false',
  };

  return new ModelOptimizer(config);
}

