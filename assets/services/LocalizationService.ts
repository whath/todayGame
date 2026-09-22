import { ZH_CN } from './locales/zh-CN';

export class LocalizationService {
    public locale = 'zh-CN';
    public setLocale(locale: string): void { this.locale = locale === 'zh-CN' ? locale : 'zh-CN'; }
    public t(id: string, params: Readonly<Record<string, string | number>> = {}): string {
        const text = ZH_CN[id] ?? id;
        return text.replace(/\{(\w+)\}/g, (match, key: string) => params[key] === undefined ? match : String(params[key]));
    }
    public keyName(key: string | null): string {
        if (key === null) return this.t('key.unbound');
        if (key.startsWith('Key')) return key.slice(3);
        if (key.startsWith('Digit')) return key.slice(5);
        return this.t(`key.${key}`);
    }
}
