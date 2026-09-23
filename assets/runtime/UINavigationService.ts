import { MenuInput } from '../core/MenuInput';
export type UILayer = 'screen' | 'overlay' | 'modal' | 'toast' | 'debug';
interface NavigationLayer { id: string; layer: UILayer; handle: (input: MenuInput) => void }
/** The top interactive layer owns the entire input frame, including Back. */
export class UINavigationService {
    private readonly stack: NavigationLayer[] = [];
    public push(id: string, layer: UILayer, handle: (input: MenuInput) => void): () => void {
        if (this.stack.some(item => item.id === id)) throw new Error(`Duplicate UI layer ${id}`);
        const item = { id, layer, handle }; this.stack.push(item);
        return () => { const index = this.stack.indexOf(item); if (index >= 0) this.stack.splice(index, 1); };
    }
    public dispatch(input: MenuInput): void {
        this.top?.handle(input);
    }
    private get top(): NavigationLayer | undefined {
        const ordered = [...this.stack].reverse();
        return ordered.find(item => item.layer === 'modal') ?? ordered.find(item => item.layer === 'overlay') ?? ordered.find(item => item.layer === 'screen');
    }
    public get topId(): string | null { return this.top?.id ?? null; }
    public clear(): void { this.stack.length = 0; }
}
