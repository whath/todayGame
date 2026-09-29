import { Color, Node } from 'cc';
import { Box } from '../core/CollisionWorld';
import { CoopChallenge } from '../packs/relay/CoopChallenge';
import { toWorld, WORLD_SCALE as S } from '../core/WorldCoordinates';
import { GreyboxGeometry, greybox } from './GreyboxGeometry';
/** Relay-specific 3D feedback. Rules and ground footprints stay in the challenge. */
export class CoopPresentation {
    private readonly plate: GreyboxGeometry;
    private readonly gate: GreyboxGeometry;
    private readonly terminal: GreyboxGeometry;
    private readonly exit: GreyboxGeometry;
    private signature = '';
    public constructor(parent: Node, private readonly challenge: CoopChallenge) {
        const root = new Node('Relay mechanisms'); root.parent = parent;
        const gold = new Color(220, 170, 60), c = challenge.definition;
        const box = (name: string, b: Box, height: number, color: Color) => {
            const p = toWorld({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
            return greybox(root, name, [p.x, height / 2 + 0.02, p.z], [b.width * S, height, b.height * S], color);
        };
        this.plate = box('Pressure plate', c.plate, 0.07, gold);
        this.gate = box('Relay gate', c.gate, 0.9, new Color(195, 75, 80));
        this.exit = box('Dual player exit', c.exit, 0.035, new Color(45, 105, 165));
        const p = toWorld(c.terminal);
        this.terminal = greybox(root, 'Terminal', [p.x, 0.36, p.z], [0.42, 0.72, 0.42], gold);
        greybox(root, 'Terminal range', [p.x, 0.01, p.z], [c.interactRadius * S * 2, 0.015, c.interactRadius * S * 2], new Color(76, 87, 95));
        this.update();
    }
    public update(): void {
        const c = this.challenge, signature = `${c.gateOpen}/${c.gateLatched}/${c.platePlayer}/${c.completed}`;
        if (signature === this.signature) return; this.signature = signature;
        const green = new Color(70, 200, 136), gold = new Color(220, 170, 60);
        this.plate.tint(c.platePlayer ? green : gold);
        this.terminal.tint(c.gateLatched ? green : gold);
        this.exit.tint(c.completed ? green : new Color(45, 105, 165));
        this.gate.node.active = !c.gateOpen;
    }
}
