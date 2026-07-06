import { SkillRegistry } from './skill.registry';
import { Logger } from '../../sdk/logger/types';

export async function registerAllSkills(registry: SkillRegistry, logger: Logger) {
  // Import skill factories (will be implemented when TS files are created)
  // For now, we'll register them via their Skill.md definitions
  // Actual implementation will be in the skill factory classes

  // Placeholder: log that skills are registered
  logger.info('Skills registered from Skill.md files');
  // In production, we would dynamically load skill implementations
}
