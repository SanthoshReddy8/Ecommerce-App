#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('Installing dependencies...');

try {
  // Try using npm-cli.js directly to bypass PowerShell wrapper
  const npmCliPath = require.resolve('npm/bin/npm-cli.js');
  
  execSync(`node "${npmCliPath}" install`, {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: process.platform === 'win32' ? 'cmd.exe' : true
  });
  
  console.log('\n✅ Dependencies installed successfully!');
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}
