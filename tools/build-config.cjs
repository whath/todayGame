const fs = require('node:fs');
const path = require('node:path');
function buildConfig(variant, root = path.resolve(__dirname, '..'), base = {}) {
    if (!['development', 'playtest', 'release'].includes(variant)) throw new Error('Unknown build variant');
    const files = ['assets/scenes/Prototype.scene'];
    if (variant === 'development') for (const name of ['InputLab', 'CameraLab', 'SettingsLab', 'SaveLab', 'KeyboardGhostingLab']) files.push(`assets/labs/${name}.scene`);
    const scenes = files.map(file => ({ url: `db://${file}`, uuid: JSON.parse(fs.readFileSync(path.join(root, file + '.meta'), 'utf8')).uuid }));
    return { ...base, platform: 'windows', name: `DuoGame-${variant}`, debug: variant === 'development',
        buildPath: `project://build/${variant}`, startScene: scenes[0].uuid, scenes };
}
module.exports = { buildConfig };
