import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Bundle the worker with its dependencies
const srcIndexPath = path.join(rootDir, 'public', 'src', 'index.js');
const srcFormatsConfigPath = path.join(rootDir, 'public', 'src', 'formats-config.js');
const destWorker = path.join(rootDir, 'public', '_worker.js');

if (fs.existsSync(srcIndexPath)) {
  // Read both files
  let formatsConfig = '';
  if (fs.existsSync(srcFormatsConfigPath)) {
    formatsConfig = fs.readFileSync(srcFormatsConfigPath, 'utf-8');
    // Remove export statements from formats-config
    formatsConfig = formatsConfig.replace(/export /g, '');
  }
  
  let indexCode = fs.readFileSync(srcIndexPath, 'utf-8');
  
  // Remove the import statement
  indexCode = indexCode.replace(/import\s*{[^}]+}\s*from\s*['"]\.\/formats-config['"];?\s*/g, '');
  
  // Bundle: formats-config first, then index
  const bundled = formatsConfig + '\n\n' + indexCode;
  
  fs.writeFileSync(destWorker, bundled);
  console.log('✓ Bundled and copied to public/_worker.js');
  
  // Clean up the src folder in public
  fs.rmSync(path.join(rootDir, 'public', 'src'), { recursive: true, force: true });
  console.log('✓ Cleaned up public/src folder');
}

console.log('✓ Build complete!');
