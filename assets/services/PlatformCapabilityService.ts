import { Capability } from '../settings/SettingDefinition';

export interface DisplayResolution { readonly width: number; readonly height: number; readonly refreshRate: number }

/** Only implemented adapter features are advertised; platform names do not imply support. */
export class PlatformCapabilityService {
    public constructor(
        private readonly flags: Readonly<Partial<Record<Capability, boolean>>>,
        private readonly resolutions: readonly DisplayResolution[] = [],
    ) {}
    public supports(capability?: Capability): boolean { return capability === undefined || this.flags[capability] === true; }
    public getSupportedResolutions(): readonly DisplayResolution[] { return this.resolutions.map(value => ({ ...value })); }
}
