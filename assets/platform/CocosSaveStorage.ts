import { sys } from 'cc';
import { SaveStorage } from '../save/SaveSnapshot';
export class CocosSaveStorage implements SaveStorage {
    public constructor(private readonly namespace = 'duogame.saves') {}
    public read(key: string): string | null { return sys.localStorage.getItem(`${this.namespace}/${key}`); }
    public write(key: string, value: string): void { sys.localStorage.setItem(`${this.namespace}/${key}`, value); }
    public remove(key: string): void { sys.localStorage.removeItem(`${this.namespace}/${key}`); }
}
