#!/usr/bin/env node
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const cliEntry = path.resolve(__dirname, '../node_modules/@tanstack/intent/dist/cli.mjs');

function normalizeValidateArgs(argv) {
  if (argv[0] !== 'validate') {
    return { argv, tempDir: null };
  }

  const targets = argv.slice(1).filter((arg) => !arg.startsWith('-'));
  if (targets.length === 0) {
    return { argv, tempDir: null };
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'intent-validate-'));
  const stagedDir = path.join(tempDir, 'skills');
  fs.mkdirSync(stagedDir, { recursive: true });

  let stagedCount = 0;
  for (const target of targets) {
    if (!fs.existsSync(target)) continue;
    const stat = fs.statSync(target);
    if (stat.isFile() && target.endsWith('.skill.md')) {
      const dirName = path.basename(target, '.md').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || `skill-${stagedCount + 1}`;
      const targetPath = path.join(stagedDir, dirName, 'SKILL.md');
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.copyFileSync(target, targetPath);
      stagedCount += 1;
    } else if (stat.isDirectory()) {
      const entries = fs.readdirSync(target, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.skill.md')) continue;
        const dirName = entry.name.replace(/\.skill\.md$/i, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || `skill-${stagedCount + 1}`;
        const targetPath = path.join(stagedDir, dirName, 'SKILL.md');
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.copyFileSync(path.join(target, entry.name), targetPath);
        stagedCount += 1;
      }
    }
  }

  if (stagedCount === 0) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    return { argv, tempDir: null };
  }

  return { argv: ['validate', stagedDir], tempDir };
}

const { argv, tempDir } = normalizeValidateArgs(process.argv.slice(2));
const result = spawnSync(process.execPath, [cliEntry, ...argv], {
  stdio: 'inherit',
});

if (tempDir) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

if (typeof result.status === 'number') {
  process.exit(result.status);
}

if (result.error) {
  throw result.error;
}

process.exit(1);
