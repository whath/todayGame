import { _decorator, Camera, Component, Node, view } from 'cc';
import { Box } from '../core/CollisionWorld';
const { ccclass, property } = _decorator;

@ccclass('SharedCamera')
export class SharedCamera extends Component {
    @property({ min: 1 }) public minZoom = 260;
    @property({ min: 1 }) public maxZoom = 900;
    @property({ min: 0 }) public padding = 140;
    @property({ min: 0.1 }) public smoothing = 6;
    private camera!: Camera;
    private targets: readonly Node[] = [];
    private bounds!: Box;

    public initialize(camera: Camera, targets: readonly Node[], bounds: Box): void {
        this.camera = camera;
        this.targets = targets;
        this.bounds = bounds;
        this.tick(0, true);
    }

    /** orthoHeight is half the visible height: a larger value zooms out. */
    public tick(dt: number, snap = false): void {
        if (this.targets.length === 0) return;
        const a = this.targets[0].worldPosition;
        const b = this.targets[this.targets.length - 1].worldPosition;
        const visible = view.getVisibleSize();
        const aspect = Math.max(0.1, visible.width / Math.max(1, visible.height));
        const required = Math.max(Math.abs(a.y - b.y) / 2 + this.padding,
            (Math.abs(a.x - b.x) / 2 + this.padding) / aspect);
        const wantedZoom = Math.max(this.minZoom, Math.min(this.maxZoom, required));
        const alpha = snap ? 1 : 1 - Math.exp(-this.smoothing * dt);
        let zoom = this.camera.orthoHeight + (wantedZoom - this.camera.orthoHeight) * alpha;
        const centerX = (a.x + b.x) / 2;
        const centerY = (a.y + b.y) / 2;
        const clampAxis = (value: number, start: number, length: number, half: number): number =>
            half * 2 >= length ? start + length / 2 : Math.max(start + half, Math.min(start + length - half, value));
        const x = clampAxis(centerX, this.bounds.x, this.bounds.width, zoom * aspect);
        const y = clampAxis(centerY, this.bounds.y, this.bounds.height, zoom);
        const current = this.node.worldPosition;
        const nextX = current.x + (x - current.x) * alpha;
        const nextY = current.y + (y - current.y) * alpha;
        // Fit immediately when players separate faster than smoothing; zoom-in remains smooth.
        const safetyFit = Math.max(Math.abs(a.y - nextY) + 70, Math.abs(b.y - nextY) + 70,
            (Math.abs(a.x - nextX) + 70) / aspect, (Math.abs(b.x - nextX) + 70) / aspect);
        zoom = Math.max(zoom, Math.min(this.maxZoom, safetyFit));
        this.camera.orthoHeight = zoom;
        this.node.setWorldPosition(nextX, nextY, current.z);
    }
}
