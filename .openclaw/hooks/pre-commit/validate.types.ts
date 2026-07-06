#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Pre-commit hook to validate TypeScript types
 */
function validateTypes(): void {
  console.log('🔍 Validating TypeScript types...');
  
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    console.log('✅ TypeScript validation passed');
  } catch (error) {
    console.error('❌ TypeScript validation failed');
    process.exit(1);
  }
}

/**
 * Pre-commit hook to validate agent configurations
 */
function validateAgentConfigs(): void {
  console.log('🔍 Validating agent configurations...');
  
  const configPath = path.join(process.cwd(), '.openclaw', 'config');
  const configFiles = fs.readdirSync(configPath);
  
  for (const file of configFiles) {
    if (file.endsWith('.json')) {
      try {
        const content = fs.readFileSync(path.join(configPath, file), 'utf8');
        JSON.parse(content);
        console.log(`✅ ${file} is valid JSON`);
      } catch (error) {
        console.error(`❌ ${file} is invalid JSON:`, error.message);
        process.exit(1);
      }
    }
  }
}

/**
 * Pre-commit hook to check for agent registration
 */
function validateAgentRegistration(): void {
  console.log('🔍 Validating agent registration...');
  
  const agentPath = path.join(process.cwd(), '.openclaw', 'agents', 'implementations');
  const indexFile = path.join(process.cwd(), '.openclaw', 'index.ts');
  
  // Check if all agents are imported
  const agentFiles = fs.readdirSync(agentPath);
  const indexContent = fs.readFileSync(indexFile, 'utf8');
  
  for (const file of agentFiles) {
    if (file.endsWith('.ts') && !file.includes('base')) {
      const agentName = file.replace('.ts', '');
      const className = agentName.split('.').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('');
      
      if (!indexContent.includes(className)) {
        console.warn(`⚠️  ${agentName} may not be registered in index.ts`);
      }
    }
  }
  
  console.log('✅ Agent registration validation completed');
}

// Run all validations
function main(): void {
  console.log('🚀 Running pre-commit validations...\n');
  
  validateTypes();
  validateAgentConfigs();
  validateAgentRegistration();
  
  console.log('\n✅ All pre-commit validations passed!');
}

main();
