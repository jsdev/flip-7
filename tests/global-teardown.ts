async function globalTeardown() {
  console.log('🧹 Running global test teardown...');
  
  // Clean up the dev server if we started it
  const devServer = (global as any).__DEV_SERVER__;
  if (devServer) {
    console.log('🔴 Stopping development server...');
    devServer.kill('SIGTERM');
    
    // Wait a bit for graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Force kill if still running
    if (!devServer.killed) {
      devServer.kill('SIGKILL');
    }
    
    console.log('✅ Development server stopped');
  }
}

export default globalTeardown;
