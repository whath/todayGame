import { CoopActor, CoopChallenge } from './CoopChallenge';
export interface GameHUDViewModel {
    objectiveId: string;
    players: { playerId: 1 | 2; promptId: string }[];
    notifications: readonly string[];
    context: { gateOpen: boolean; gateLatched: boolean; completed: boolean };
}
export function coopViewModel(challenge: CoopChallenge, players: readonly CoopActor[], separated = false): GameHUDViewModel {
    return { objectiveId: challenge.gateLatched ? 'coop.goalExit' : 'coop.goalRelay',
        players: players.map(p => ({ playerId: p.playerId, promptId: challenge.gateLatched ? 'coop.toExit'
            : challenge.platePlayer === p.playerId ? 'coop.keepPlate' : challenge.nearTerminal(p)
                ? challenge.platePlayer ? 'coop.useTerminal' : 'coop.needPartner' : 'coop.findRole' })),
        notifications: separated ? ['coop.separated'] : [],
        context: { gateOpen: challenge.gateOpen, gateLatched: challenge.gateLatched, completed: challenge.completed } };
}
