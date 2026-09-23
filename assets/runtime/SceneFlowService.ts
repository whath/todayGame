import { AssetScope, AssetService } from './AssetService';
import { DomainEvent } from './DomainEvent';
export type AppState = 'boot' | 'mainMenu' | 'localJoin' | 'loading' | 'gameplay';
export interface TransitionRequest { readonly target: Exclude<AppState, 'boot' | 'loading'>; readonly contentId?: string }
export interface PreparedView { activate(): void; dispose(): void }
export interface SceneFlowAdapter<T> {
    prepare(request: TransitionRequest, scope: AssetScope<T>, progress: (value: number) => void): Promise<PreparedView>;
}
export class AppStateService { public current: AppState = 'boot'; }
export class LoadingService {
    public progress = 0;
    public error = '';
    public report(value: number): void { if (Number.isFinite(value)) this.progress = Math.max(this.progress, Math.min(1, Math.max(0, value))); }
}
export class SceneFlowService<T> {
    public readonly state = new AppStateService();
    public readonly loading = new LoadingService();
    public readonly changed = new DomainEvent<{ phase: 'started' | 'completed' | 'failed'; request: TransitionRequest; error?: string }>();
    public busy = false;
    private disposed = false;
    private current: { view: PreparedView; scope: AssetScope<T> } | null = null;
    private pendingScope: AssetScope<T> | null = null;
    public constructor(private readonly assets: AssetService<T>, private readonly adapter: SceneFlowAdapter<T>) {}
    public async requestTransition(request: TransitionRequest): Promise<boolean> {
        if (this.busy || this.disposed) return false;
        this.busy = true;
        const previous = this.state.current;
        const scope = this.assets.createScope(request.target);
        this.pendingScope = scope;
        this.state.current = 'loading'; this.loading.progress = 0; this.loading.error = '';
        this.changed.publish({ phase: 'started', request });
        let view: PreparedView | null = null;
        try {
            view = await this.adapter.prepare(request, scope, value => this.loading.report(value));
            if (this.disposed) { view.dispose(); scope.dispose(); return false; }
            view.activate();
            const old = this.current;
            this.current = { view, scope };
            this.state.current = request.target; this.loading.report(1);
            // Destroy instances before releasing the assets they use.
            if (old) {
                try { old.view.dispose(); } catch (error) { this.loading.error = `Retired view cleanup: ${String(error)}`; }
                finally {
                    try { old.scope.dispose(); } catch (error) { this.loading.error = `Retired assets cleanup: ${String(error)}`; }
                }
            }
            this.changed.publish({ phase: 'completed', request });
            return true;
        } catch (error) {
            try { view?.dispose(); } catch { /* Preserve the transition failure. */ }
            scope.dispose();
            this.state.current = previous; this.loading.error = String(error);
            this.changed.publish({ phase: 'failed', request, error: String(error) });
            return false;
        } finally { this.pendingScope = null; this.busy = false; }
    }
    public dispose(): void {
        this.disposed = true;
        this.pendingScope?.dispose();
        try { this.current?.view.dispose(); }
        finally { this.current?.scope.dispose(); this.current = null; this.changed.clear(); }
    }
}
