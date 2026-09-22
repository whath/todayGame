import { sys } from 'cc';
import { ISettingsPersistence } from '../settings/SettingDefinition';

/** Separate logical namespace; never touches saved progress or profiles. */
export class CocosSettingsPersistence implements ISettingsPersistence {
    private readonly key = 'duogame.settings';
    public load(): string | null { return sys.localStorage.getItem(this.key); }
    public save(serialized: string): void { sys.localStorage.setItem(this.key, serialized); }
}
