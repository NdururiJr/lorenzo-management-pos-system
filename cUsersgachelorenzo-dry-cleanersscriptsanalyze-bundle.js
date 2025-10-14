/**
 * Bundle Size Analysis Script
 * Analyzes Next.js build output and reports bundle sizes
 */

const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', '.next');
const BUNDLE_THRESHOLD_KB = 500;

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size / 1024;
}

function analyzeBundles() {
  console.log('\n📊 Bundle Size Analysis\n');
  console.log('='.repeat(60));

  const buildManifestPath = path.join(BUILD_DIR, 'build-manifest.json');

  if (!fs.existsSync(buildManifestPath)) {
    console.error('Build manifest not found. Run npm run build first.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf-8'));
  let totalSize = 0;
  const bundles = [];

  for (const [page, files] of Object.entries(manifest.pages)) {
    let pageSize = 0;
    for (const file of files) {
      const filePath = path.join(BUILD_DIR, file);
      if (fs.existsSync(filePath)) {
        const size = getFileSize(filePath);
        pageSize += size;
        totalSize += size;
      }
    }
    bundles.push({ page, size: pageSize });
  }

  bundles.sort((a, b) => b.size - a.size);
  console.log('\n📦 Largest Bundles:\n');

  bundles.slice(0, 10).forEach((bundle, idx) => {
    const status = bundle.size > BUNDLE_THRESHOLD_KB ? '⚠️ ' : '✅ ';
    console.log(status + (idx + 1) + '. ' + bundle.page + ': ' + bundle.size.toFixed(2) + ' KB');
  });

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Total Bundle Size: ' + totalSize.toFixed(2) + ' KB');
  console.log('🎯 Target: < ' + BUNDLE_THRESHOLD_KB + ' KB (gzipped)\n');

  if (totalSize > BUNDLE_THRESHOLD_KB * 2) {
    console.warn('Warning: Bundle size exceeds target.');
  } else {
    console.log('Bundle size is within acceptable range!\n');
  }
}

try {
  analyzeBundles();
} catch (error) {
  console.error('Error analyzing bundles:', error.message);
  process.exit(1);
}
