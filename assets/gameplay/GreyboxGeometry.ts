import { _decorator, Color, Component, Material, Mesh, MeshRenderer, Node, primitives, utils, Layers } from 'cc';
const { ccclass } = _decorator;
/** Engine primitive meshes only. Owned resources are released with each world node. */
@ccclass('GreyboxGeometry')
export class GreyboxGeometry extends Component {
    private mesh!: Mesh;
    private material!: Material;
    public initialize(color: Color, shape: 'box' | 'sphere' = 'box'): void {
        this.node.layer = Layers.Enum.DEFAULT;
        this.mesh = utils.createMesh(shape === 'sphere' ? primitives.sphere(0.5) : primitives.box());
        this.material = new Material();
        this.material.initialize({ effectName: 'builtin-standard' });
        if (!this.material.passes.length) throw Error('Greybox material effect was not preloaded by the scene');
        this.material.setProperty('mainColor', color);
        this.material.setProperty('roughness', 0.85);
        const renderer = this.node.addComponent(MeshRenderer);
        renderer.mesh = this.mesh; renderer.setSharedMaterial(this.material, 0);
    }
    public tint(color: Color): void { this.material.setProperty('mainColor', color); }
    protected onDestroy(): void { this.mesh?.destroy(); this.material?.destroy(); }
}
export function greybox(parent: Node, name: string, position: readonly [number, number, number],
    size: readonly [number, number, number], color: Color, shape: 'box' | 'sphere' = 'box'): GreyboxGeometry {
    const node = new Node(name); node.parent = parent;
    node.setPosition(...position); node.setScale(...size);
    const mesh = node.addComponent(GreyboxGeometry); mesh.initialize(color, shape); return mesh;
}
