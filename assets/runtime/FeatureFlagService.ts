import { BuildVariant, buildPolicy } from './BuildInfo';
export class FeatureFlagService {
    private readonly flags = new Map<string, { enabled: boolean; purpose: string }>();
    public constructor(private readonly variant: BuildVariant) {}
    public register(id: string, purpose: string, enabled = false): void {
        if (!id || !purpose || this.flags.has(id)) throw new Error('Invalid or duplicate feature flag');
        this.flags.set(id, { enabled, purpose });
    }
    public enabled(id: string): boolean { return buildPolicy(this.variant).experimentalFlags && this.flags.get(id)?.enabled === true; }
    public set(id: string, enabled: boolean): void {
        if (!buildPolicy(this.variant).experimentalFlags) throw new Error('Feature flags disabled in release');
        const flag = this.flags.get(id); if (!flag) throw new Error(`Unknown flag ${id}`); flag.enabled = enabled;
    }
}
