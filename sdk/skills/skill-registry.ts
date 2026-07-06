import type { Logger } from 'pino';
import type { SkillDefinition } from './runtime/types';
import type { SkillContext, } from './runtime/context';

export interface SkillExecuteResult<TOutput = any> {
  success: boolean;
  data?: TOutput;
  error?: string;
  metrics: {
    durationMs: number;
    validated: boolean;
  };
}

export class SkillRegistry {
  private readonly logger: Logger;
  private readonly skills = new Map<string, SkillDefinition<any, any>>();

  constructor(logger: Logger) {
    this.logger = logger.child({ registry: 'SkillRegistry' });
  }

  register<TInput, TOutput>(skill: SkillDefinition<TInput, TOutput>): void {
    const key = this.key(skill.id, skill.version);
    if (this.skills.has(key)) {
      throw new Error(`Skill already registered: ${skill.id}@${skill.version}`);
    }
    this.skills.set(key, skill);
    this.logger.info({ skillId: skill.id, version: skill.version }, 'Registered skill');
  }

  /**
   * Resolve by `id`.
   *
   * If multiple versions are registered, this returns the latest lexicographically.
   * (You can upgrade this to semver selection later.)
   */
  getLatestById<TInput = any, TOutput = any>(id: string): SkillDefinition<TInput, TOutput> | undefined {
    const candidates = Array.from(this.skills.values()).filter((s) => s.id === id);
    if (candidates.length === 0) return undefined;
    candidates.sort((a, b) => (a.version < b.version ? -1 : 1));
    return candidates[candidates.length - 1] as SkillDefinition<TInput, TOutput>;
  }

  private key(id: string, version: string) {
    return `${id}@${version}`;
  }

  async execute<TInput, TOutput>(args: {
    skillId: string;
    input: TInput;
    context: SkillContext;
    version?: string;
  }): Promise<SkillExecuteResult<TOutput>> {
    const { skillId, input, context, version } = args;

    const start = Date.now();
    const metrics = {
      durationMs: 0,
      validated: false,
    };

    try {
      const skill = version
        ? this.skills.get(this.key(skillId, version))
        : this.getLatestById<TInput, TOutput>(skillId);

      if (!skill) {
        return {
          success: false,
          error: `Skill not found: ${skillId}${version ? `@${version}` : ''}`,
          metrics: { ...metrics, durationMs: Date.now() - start, validated: false },
        };
      }

      const validated = await (async () => {
        if (!skill.validate) return true;
        return await skill.validate(input);
      })();

      metrics.validated = validated;
      if (!validated) {
        return {
          success: false,
          error: `Input validation failed for skill: ${skillId}`,
          metrics: { ...metrics, durationMs: Date.now() - start },
        };
      }

      const data = await skill.execute(input, context);

      return {
        success: true,
        data: data as TOutput,
        metrics: { ...metrics, durationMs: Date.now() - start },
      };
    } catch (err: any) {
      this.logger.error({ err }, 'Skill execution failed');
      return {
        success: false,
        error: err?.message ?? String(err),
        metrics: { ...metrics, durationMs: Date.now() - start },
      };
    }
  }
}

