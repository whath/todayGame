const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
fs.mkdirSync('assets/labs', { recursive: true });
for (const name of ['InputLab', 'CameraLab', 'SettingsLab', 'SaveLab', 'KeyboardGhostingLab']) {
    const file = `assets/labs/${name}.scene`;
    if (fs.existsSync(file)) continue;
    const data = JSON.parse(fs.readFileSync('assets/scenes/Prototype.scene', 'utf8'));
    const meta = JSON.parse(fs.readFileSync('assets/scenes/Prototype.scene.meta', 'utf8'));
    meta.uuid = randomUUID(); data[0]._name = name; data[1]._name = name; data[1]._id = meta.uuid; data[3].lab = name;
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
    fs.writeFileSync(file + '.meta', JSON.stringify(meta, null, 2) + '\n');
}
