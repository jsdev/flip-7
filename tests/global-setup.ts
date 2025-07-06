import { chromium, FullConfig } from '@playwright/test';
import { spawn } from 'child_process';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  // Start the development server
  
  // Check if dev server is already running
  try {
    const response = await fetch('http://localhost:5175');
    if (response.ok) {
      console.log('✅ Development server already running');
      return;
    }
  } catch (error) {
    // Server not running, start it
  }
  
  console.log('🔧 Starting development server...');
  
  // Start the dev server in the background
  const devServer = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    detached: false,
    cwd: process.cwd()
  });
  
  // Store the process for cleanup
  (global as any).__DEV_SERVER__ = devServer;
  
  // Wait for server to be ready
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch('http://localhost:5175');
      if (response.ok) {
        console.log('✅ Development server ready!');
        return;
      }
    } catch (error) {
      // Server not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  throw new Error('❌ Development server failed to start within 30 seconds');
}

export default globalSetup;
