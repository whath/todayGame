import { MenuInput } from '../core/MenuInput';
export type UILayer = 'screen' | 'overlay' | 'modal' | 'toast' | 'debug';
interface NavigationLayer { id: string; layer: UILayer; handle: (input: MenuInput) => void; owner: string | null }
/** The top interactive layer owns the entire input frame, including Back. */
export class UINavigationService {
    private readonly stack: NavigationLayer[] = [];
    public push(id: string, layer: UILayer, handle: (input: MenuInput) => void, owner: string | null = null): () => void {
        if (this.stack.some(item => item.id === id)) throw new Error(`Duplicate UI layer ${id}`);
        const item = { id, layer, handle, owner }; this.stack.push(item);
        return () => { const index = this.stack.indexOf(item); if (index >= 0) this.stack.splice(index, 1); };
    }
    public dispatch(input: MenuInput, source: string | null = null): boolean {
        const top = this.top;
        if (!top || !this.accepts(source)) return false;
        top.handle(input); return true;
    }
    public accepts(source: string | null): boolean { return !this.top?.owner || this.top.owner === source; }
    public get owner(): string | null { return this.top?.owner ?? null; }
    public releaseOwner(source: string): void { this.stack.forEach(item => { if (item.owner === source) item.owner = null; }); }
    private get top(): NavigationLayer | undefined {
        const ordered = [...this.stack].reverse();
        return ordered.find(item => item.layer === 'modal') ?? ordered.find(item => item.layer === 'overlay') ?? ordered.find(item => item.layer === 'screen');
    }
    public get topId(): string | null { return this.top?.id ?? null; }
    public clear(): void { this.stack.length = 0; }
}
