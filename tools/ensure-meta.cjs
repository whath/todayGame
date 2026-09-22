// Author only missing metadata; existing UUIDs and editor-authored data are preserved.
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
let created = 0;
function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (entry.name.endsWith('.meta')) continue;
        const file = path.join(directory, entry.name);
        const importer = entry.isDirectory() ? 'directory' : file.endsWith('.ts') ? 'typescript' : null;
        if (importer && !fs.existsSync(`${file}.meta`)) {
            fs.writeFileSync(`${file}.meta`, JSON.stringify({ ver: importer === 'directory' ? '1.2.0' : '4.0.24',
                importer, imported: true, uuid: randomUUID(), files: [], subMetas: {}, userData: {} }, null, 2) + '\n');
            created++;
        }
        if (entry.isDirectory()) walk(file);
    }
}
walk('assets');
console.log(`Created ${created} missing metadata files.`);
