import * as vscode from 'vscode';
import * as path from 'path';

export class I18n {
    private languageCode: string | null = null;
    private localeFilePath: vscode.Uri | null = null;
    private locale: Record<string, any> | null = null;

    private constructor() {}

    public static async create(languageCode: string): Promise<I18n> {
        const i18n = new I18n();
        const success = await i18n.setup(languageCode);
        if (!success) {
            throw new Error(`Failed to load language ${languageCode}`);
        }
        return i18n;
    }

    async setup(languageCode: string): Promise<boolean> {
        const isLanguageAvailable = await this.isLanguageAvailable(languageCode);
        if (isLanguageAvailable) {
            this.languageCode = languageCode;
        } else {
            console.log(`[WARNING] The language code ${languageCode} is not available! Fallback to en...`);
            this.languageCode = 'en';
        }
        this.localeFilePath = vscode.Uri.file(path.join(__dirname, `./translation/${this.languageCode}.json`));
        const fileData = await vscode.workspace.fs.readFile(this.localeFilePath);
        const jsonString: string = new TextDecoder().decode(fileData);
        this.locale = JSON.parse(jsonString);
        return true;
    }

    async isLanguageAvailable(languageCode: string): Promise<boolean> {
        const allLanguages = await this.getAvailableLanguages();
        return allLanguages.includes(languageCode);
    }

    async getAvailableLanguages(): Promise<string[]> {
        const translationPath = vscode.Uri.file(path.join(__dirname, './translation'));
        try {
            const files = await vscode.workspace.fs.readDirectory(translationPath);
            return files
                .filter(([file, type]) => type === vscode.FileType.File && file.endsWith('.json'))
                .map(([file]) => file.replace('.json', ''));
        } catch (error) {
            console.error("Error reading translation directory:", error);
            return [];
        }
    }

    t(key: string, interpolation?: { [key: string]: string }): string {
        let localeText: Record<string, any> | null = this.locale;
    
        // Get the Value
        const splittedKey = key.split(".");
        splittedKey.forEach((value: string) => {
            if (!localeText) return;
            localeText = localeText[value];
        });
    
        if (typeof localeText !== 'string') {
            console.log(`The key ${key} is not available in the ${this.languageCode} locale.`);
            return "Unknown Translation";
        }
    
        // Interpolate the string if interpolation is provided
        if (interpolation) {
            let text = localeText as string;
            for (const [key, value] of Object.entries(interpolation)) {
                text = text.replaceAll(`{${key}}`, value);
            }
            return text;
        }
    
        return localeText;
    }
}
