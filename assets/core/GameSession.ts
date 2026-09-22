import { InputManager } from '../input/InputManager';

export type SessionPhase = 'lobby' | 'playing' | 'disconnected';
export class GameSession {
    public phase: SessionPhase = 'lobby';
    public update(input: InputManager): void {
        if (input.bothReady) this.phase = 'playing';
        else if (this.phase !== 'lobby') this.phase = 'disconnected';
    }
    public returnToLobby(input: InputManager): void {
        input.releaseAll();
        this.phase = 'lobby';
    }
}
