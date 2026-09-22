const { spawnSync } = require('node:child_process');
const commands = [
    [require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.engine.json'],
    [require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.core.json'],
    ['tools/check-syntax.cjs'],
    ['--test', 'tests/foundation.test.cjs'],
];
for (const args of commands) {
    const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status ?? 1);
}
