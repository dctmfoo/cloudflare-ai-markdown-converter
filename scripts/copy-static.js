import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Files to preserve in public folder (don't overwrite)
const staticFiles = ['index.html', 'styles.css', 'app.js'];

// Ensure src/index.js is renamed to _worker.js
const srcWorker = path.join(rootDir, 'public', 'src', 'index.js');
const destWorker = path.join(rootDir, 'public', '_worker.js');

if (fs.existsSync(srcWorker)) {
  fs.copyFileSync(srcWorker, destWorker);
  console.log('✓ Copied src/index.js → public/_worker.js');
  
  // Clean up the src folder in public
  fs.rmSync(path.join(rootDir, 'public', 'src'), { recursive: true, force: true });
  console.log('✓ Cleaned up public/src folder');
}

console.log('✓ Build complete!');
