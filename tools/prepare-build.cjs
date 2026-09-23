// Prepares configuration only. Does not invoke Creator or claim a native build succeeded.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { buildConfig } = require('./build-config.cjs');
const root = path.resolve(__dirname, '..');
const variant = process.argv[2] || 'development';
const base = process.argv[3] ? JSON.parse(fs.readFileSync(process.argv[3], 'utf8')) : {};
const config = buildConfig(variant, root, base);
const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const dirty = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim() !== '';
const info = { version: require('../package.json').version, buildId: new Date().toISOString().replace(/[:.]/g, '-'), commit: commit + (dirty ? '-dirty' : ''), variant };
fs.writeFileSync(path.join(root, 'assets/runtime/GeneratedBuildInfo.ts'), `import { BuildInfo } from './BuildInfo';\nexport const GENERATED_BUILD_INFO: BuildInfo = ${JSON.stringify(info, null, 4)};\n`);
const out = path.join(root, 'temp/build'); fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, variant + '.json'), JSON.stringify(config, null, 2) + '\n');
fs.writeFileSync(path.join(out, variant + '.info.json'), JSON.stringify(info, null, 2) + '\n');
console.log(`Prepared ${variant} configuration: ${path.join(out, variant + '.json')}`);
