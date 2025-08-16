#!/usr/bin/env node

import { execSync } from 'child_process';
import process from 'process';

try {
  // Run pnpm ignored-builds to check for ignored builds
  const output = execSync('pnpm ignored-builds', {
    encoding: 'utf8',
    cwd: '../../', // Go to repository root
  });

  // Check if the output contains "None" for ignored builds
  if (output.includes('Automatically ignored builds during installation:\n  None')) {
    console.log('✅ No packages ignored during installation');
    process.exit(0);
  } else {
    console.log('⚠️  Some packages were ignored during installation:');
    console.log(output);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error checking ignored builds:', error.message);
  process.exit(1);
}
