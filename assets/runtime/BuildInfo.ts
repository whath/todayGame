export type BuildVariant = 'development' | 'playtest' | 'release';
export interface BuildInfo { readonly version: string; readonly buildId: string; readonly commit: string; readonly variant: BuildVariant }
export function buildPolicy(variant: BuildVariant) {
    return Object.freeze({ labs: variant === 'development', developerTools: variant === 'development',
        experimentalFlags: variant !== 'release', verbose: variant === 'development', buildLabel: variant !== 'release' });
}
