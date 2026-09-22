const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
let failures = 0;
let files = 0;
function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) walk(file);
        else if (file.endsWith('.ts')) {
            files++;
            const result = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
                fileName: file, reportDiagnostics: true,
                compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, experimentalDecorators: true },
            });
            for (const diagnostic of result.diagnostics ?? []) {
                if (diagnostic.category !== ts.DiagnosticCategory.Error) continue;
                console.error(file, ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
                failures++;
            }
        }
    }
}
walk('assets');
console.log(`Syntax transpilation: ${files} scripts, ${failures} errors. Does not check Cocos API types.`);
process.exitCode = failures ? 1 : 0;
