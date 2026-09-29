// Requires the core compile, performed by tools/run-tests.cjs. Does not run the game.
const fs = require('node:fs');
const path = require('node:path');
const { createPrototypeContent } = require('../temp/core-tests/content/PrototypeContent');
const { LocalizationService } = require('../temp/core-tests/services/LocalizationService');
const { validateRacingContent } = require('../temp/core-tests/packs/racing/RacingContent');
const root = path.resolve(__dirname, '..');
const metas = new Map();
function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) walk(file);
        else if (entry.name.endsWith('.meta')) {
            const meta = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (!meta.uuid || metas.has(meta.uuid)) throw Error(`Missing/duplicate UUID: ${file}`);
            metas.set(meta.uuid, file);
        } else if ((file.endsWith('.ts') || file.endsWith('.scene') || file.endsWith('.prefab')) && !fs.existsSync(file + '.meta')) throw Error(`Missing metadata: ${file}`);
    }
}
walk(path.join(root, 'assets'));
const content = createPrototypeContent(), locale = new LocalizationService();
content.validate(id => id === 'prefab.player' && fs.existsSync(path.join(root, 'assets/player/Player.prefab')), id => locale.t(id) !== id);
validateRacingContent(undefined, undefined, id => locale.t(id) !== id);
function references(value) {
    if (!value || typeof value !== 'object') return;
    // Pinned Cocos 3.8.6 builtin-standard.effect; all project references remain strict.
    if (value.__uuid__ && value.__uuid__ !== 'c8f66d17-351a-48da-a12c-0212d28575c4' && !metas.has(value.__uuid__)) throw Error(`Missing asset UUID: ${value.__uuid__}`);
    Object.values(value).forEach(references);
}
for (const file of metas.values()) if (/\.(scene|prefab|mtl)\.meta$/.test(file)) references(JSON.parse(fs.readFileSync(file.slice(0,-5),'utf8')));
console.log(`Content validation: ${content.all().length} definitions, ${metas.size} unique metadata UUIDs; references and localization present.`);
