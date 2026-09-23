import { Prefab } from 'cc';
import { AssetBackend } from '../runtime/AssetService';
/** Scene references supply the small prototype catalog; the scope adds its own ref. */
export class CocosAssetBackend implements AssetBackend<Prefab> {
    public constructor(private readonly catalog: ReadonlyMap<string, Prefab>) {}
    public async load(id: string): Promise<Prefab> {
        const asset = this.catalog.get(id); if (!asset) throw new Error(`Unregistered asset ${id}`);
        asset.addRef(); return asset;
    }
    public release(_id: string, asset: Prefab): void { asset.decRef(); }
}
