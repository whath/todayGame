import { RacingSelection, TRACKS, VEHICLES } from './RacingContent';
/** Lobby choices belong to racing; device identity and assignment still belong to the shell. */
export class RacingSetup {
    private readonly carIndex = [0, 0];
    private trackIndex = 0;
    private readonly devices: (string | null)[] = [null, null];
    public readonly ready = [false, false];
    public get selection(): RacingSelection { return { carIds: [VEHICLES[this.carIndex[0]].id, VEHICLES[this.carIndex[1]].id], trackId: TRACKS[this.trackIndex].id }; }
    public syncDevice(player: number, device: string | null): void {
        if (this.devices[player] !== device) { this.devices[player] = device; this.ready[player] = false; }
    }
    public chooseCar(player: number): void { this.carIndex[player] = (this.carIndex[player] + 1) % VEHICLES.length; this.ready[player] = false; }
    public chooseTrack(): void { this.trackIndex = (this.trackIndex + 1) % TRACKS.length; this.ready.fill(false); }
    public toggleReady(player: number): void { if (this.devices[player]) this.ready[player] = !this.ready[player]; }
    public get canStart(): boolean { return this.devices.every(Boolean) && this.ready.every(Boolean); }
}
