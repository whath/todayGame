import { _decorator, Camera, Component, Node, Vec3, view } from 'cc';
import { Box } from '../core/CollisionWorld';
import { CameraPolicy, SharedGroupCameraPolicy } from '../core/CameraPolicy';
import { toGround, toWorld, WORLD_SCALE } from '../core/WorldCoordinates';
const { ccclass, property } = _decorator;
@ccclass('SharedCamera')
export class SharedCamera extends Component {
    @property({ min: 0.1 }) public smoothing = 6;
    private camera!: Camera;
    private targets: readonly Node[] = [];
    private bounds!: Box;
    private policy: CameraPolicy = new SharedGroupCameraPolicy();
    private center = { x: 0, y: 0 };
    public offscreen = false;
    public initialize(camera: Camera, targets: readonly Node[], bounds: Box, policy: CameraPolicy = new SharedGroupCameraPolicy()): void {
        this.camera = camera; this.targets = targets; this.bounds = bounds; this.policy = policy; this.tick(0, true);
    }
    public tick(dt: number, snap = false): void {
        if (!this.targets.length) return;
        const size = view.getVisibleSize(), aspect = size.width / Math.max(1, size.height);
        const wanted = this.policy.frame(this.targets.map(n => toGround(n.worldPosition)), this.bounds, aspect);
        const alpha = snap ? 1 : 1 - Math.exp(-this.smoothing * dt);
        this.center.x += (wanted.center.x - this.center.x) * alpha;
        this.center.y += (wanted.center.y - this.center.y) * alpha;
        const target = toWorld(this.center);
        this.node.setWorldPosition(target.x, 16, target.z + 10);
        this.node.lookAt(new Vec3(target.x, 0, target.z));
        const zoom = wanted.halfHeight * WORLD_SCALE;
        this.camera.orthoHeight = snap || zoom > this.camera.orthoHeight ? zoom : this.camera.orthoHeight + (zoom - this.camera.orthoHeight) * alpha;
        const projected = new Vec3();
        this.offscreen = this.targets.some(node => {
            this.camera.worldToScreen(node.worldPosition, projected);
            return projected.x < 20 || projected.x > this.camera.camera.width - 20
                || projected.y < 20 || projected.y > this.camera.camera.height - 20;
        });
    }
}
