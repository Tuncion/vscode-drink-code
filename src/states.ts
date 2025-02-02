// Note: I used the State Pattern to implement the reminder states.

import * as vscode from 'vscode';
import { IReminderState, ReminderState, IDrinkCodeSettings } from './interfaces';
import { I18n as CI18n } from './i18n';

let DrinkCodeSettings: IDrinkCodeSettings;
let I18n: CI18n;
export class DrinkReminder {
    private currentState: IReminderState;
    private context: vscode.ExtensionContext | null;
    private statusBarItem: vscode.StatusBarItem;
    private timeout: NodeJS.Timeout | undefined;
    private interval: number;
    private lastDrinkDate: Date | null = null;

    constructor(context: vscode.ExtensionContext, drinkCodeSettings: IDrinkCodeSettings, i18n: CI18n) {
        DrinkCodeSettings = drinkCodeSettings;
        I18n = i18n;
        this.context = context;
        this.interval = DrinkCodeSettings.drinkInterval;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.text = I18n.t(`drinkStates.${ReminderState.Hydrated}.statusBar`);
        this.statusBarItem.command = 'drink-code.drinkWater';
        this.updateStatusBarTooltip();
        this.statusBarItem.show();
        this.context.subscriptions.push(this.statusBarItem);

        this.currentState = new HydratedState(this);
        this.startReminder();
    }

    private startReminder() {
        this.timeout = setTimeout(() => {
            this.currentState.showReminder();
        }, this.interval);
    }

    public resetInterval() {
        this.interval = DrinkCodeSettings.drinkInterval;
        clearTimeout(this.timeout);
        this.startReminder();
    }

    public decreaseInterval() {
        this.interval = Math.max(DrinkCodeSettings.drinkMinInterval, this.interval / DrinkCodeSettings.drinkSkipFactor); // Minimum 5 min
        this.startReminder();
    }

    public setReminderState(newState: IReminderState) {
        this.currentState = newState;
    }

    public setStatusBarItemText(newText: string) {
        this.statusBarItem.text = newText;
    }

    public drankWater(showMessage: boolean = false) {
        if (!this.context) return;

        if (showMessage) vscode.window.showInformationMessage(I18n.t(`drinkWaterMessage`));
        this.setReminderState(new HydratedState(this));
        this.resetInterval();
        this.lastDrinkDate = new Date();
        this.context.globalState.update('lastDrinkDate', this.lastDrinkDate);
        this.updateStatusBarTooltip();
    }

    public updateStatusBarTooltip() {
        if (!this.context) return;
        if (!this.statusBarItem) return;

        let LastTimeDrink = this.lastDrinkDate instanceof Date ? this.lastDrinkDate : this.context.globalState.get('lastDrinkDate', null);

        // Check if LastTimeDrink is a Date object
        if (!(LastTimeDrink instanceof Date)) {

            // Try to parse the date (maybe it's a date/iso string)
            if (typeof LastTimeDrink === 'string') {
                LastTimeDrink = new Date(LastTimeDrink);
                if (!(LastTimeDrink instanceof Date)) {
                    this.context.globalState.update('lastDrinkDate', null);
                    this.updateStatusBarTooltip();
                }
            }
        };

        if (LastTimeDrink) {
            this.statusBarItem.tooltip = I18n.t(`drinkStatusBarItemTooltip`, {
                Time: `${
                        LastTimeDrink.toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })
                    } ${
                        LastTimeDrink.toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    }`
            });
        } else {
            this.statusBarItem.tooltip = I18n.t(`drinkStatusBarItemTooltip`, {
                Time: I18n.t(`drinkStatusBarItemTooltipNever`)
            });
        }
    }
}

class HydratedState implements IReminderState {
    private CReminder: DrinkReminder | null = null;

    constructor(private reminder: DrinkReminder) {
        this.CReminder = reminder;
        this.CReminder.setStatusBarItemText(DrinkCodeSettings.drinkStates[ReminderState.Hydrated].statusBar);
    }
    nextState() {
        if (!this.CReminder) return;
        this.CReminder.setReminderState(new DrinkState(this.CReminder));
    }
    showReminder() {
        const reminderTimeout = setTimeout(() => {
            if (!this.CReminder) throw new Error("❌ Error: DrinkReminder Class is null in HydratedState!");
            this.nextState();
            this.CReminder.decreaseInterval();
        }, DrinkCodeSettings.drinkReminderTimeout);
    
        vscode.window.showInformationMessage(DrinkCodeSettings.drinkStates[ReminderState.Hydrated].reminderText, I18n.t(`drinkReminderButton.drank`), I18n.t(`drinkReminderButton.skip`)).then(selection => {
            if (!this.CReminder) throw new Error("❌ Error: DrinkReminder Class is null in HydratedState!");
            if (selection === I18n.t(`drinkReminderButton.drank`)) {
                clearTimeout(reminderTimeout);
                this.CReminder.drankWater();
            } else if (selection === I18n.t(`drinkReminderButton.skip`)) {
                clearTimeout(reminderTimeout);
                this.nextState();
                this.CReminder.decreaseInterval();
            }
        });
    }
}

class DrinkState implements IReminderState {
    private CReminder: DrinkReminder | null = null;

    constructor(private reminder: DrinkReminder) {
        this.CReminder = reminder;
        this.CReminder.setStatusBarItemText(DrinkCodeSettings.drinkStates[ReminderState.Drink].statusBar);
    }
    nextState() {
        if (!this.CReminder) return;
        this.CReminder.setReminderState(new GrabWaterState(this.CReminder));
    }
    showReminder() {
        const reminderTimeout = setTimeout(() => {
            if (!this.CReminder) throw new Error("❌ Error: DrinkReminder Class is null in HydratedState!");
            this.nextState();
            this.CReminder.decreaseInterval();
        }, DrinkCodeSettings.drinkReminderTimeout);

        vscode.window.showInformationMessage(DrinkCodeSettings.drinkStates[ReminderState.Drink].reminderText, I18n.t(`drinkReminderButton.drank`), I18n.t(`drinkReminderButton.skip`)).then(selection => {
            if (!this.CReminder) throw new Error("❌ Error: DrinkReminder Class is null in DrinkState!");
            if (selection === I18n.t(`drinkReminderButton.drank`)) {
                clearTimeout(reminderTimeout);
                this.CReminder.drankWater();
            } else if (selection === I18n.t(`drinkReminderButton.skip`)) {
                clearTimeout(reminderTimeout);
                this.nextState();
                this.CReminder.decreaseInterval();
            }
        });
    }
}

class GrabWaterState implements IReminderState {
    private CReminder: DrinkReminder | null = null;

    constructor(private reminder: DrinkReminder) {
        this.CReminder = reminder;
        this.CReminder.setStatusBarItemText(DrinkCodeSettings.drinkStates[ReminderState.GrabWater].statusBar);
    }
    nextState() {
        if (!this.CReminder) return;
        this.CReminder.setReminderState(new DrinkImmediatelyState(this.CReminder));
    }
    showReminder() {
        const reminderTimeout = setTimeout(() => {
            if (!this.CReminder) throw new Error("❌ Error: DrinkReminder Class is null in HydratedState!");
            this.nextState();
            this.CReminder.decreaseInterval();
        }, DrinkCodeSettings.drinkReminderTimeout);

        vscode.window.showInformationMessage(DrinkCodeSettings.drinkStates[ReminderState.GrabWater].reminderText, I18n.t(`drinkReminderButton.drank`), I18n.t(`drinkReminderButton.skip`)).then(selection => {
            if (!this.CReminder) throw new Error("❌ Error: DrinkReminder Class is null in GrabWaterState!");
            if (selection === I18n.t(`drinkReminderButton.drank`)) {
                clearTimeout(reminderTimeout);
                this.CReminder.drankWater();
            } else if (selection === I18n.t(`drinkReminderButton.skip`)) {
                clearTimeout(reminderTimeout);
                this.nextState();
                this.CReminder.decreaseInterval();
            }
        });
    }
}

class DrinkImmediatelyState implements IReminderState {
    private CReminder: DrinkReminder | null = null;

    constructor(private reminder: DrinkReminder) {
        this.CReminder = reminder;
        this.CReminder.setStatusBarItemText(DrinkCodeSettings.drinkStates[ReminderState.DrinkImmediately].statusBar);
    }
    nextState() {
        if (!this.CReminder) return;
        this.CReminder.setReminderState(new AlertState(this.CReminder));
    }
    showReminder() {
        const reminderTimeout = setTimeout(() => {
            if (!this.CReminder) throw new Error("❌ Error: DrinkReminder Class is null in HydratedState!");
            this.nextState();
            this.CReminder.decreaseInterval();
        }, DrinkCodeSettings.drinkReminderTimeout);

        vscode.window.showInformationMessage(DrinkCodeSettings.drinkStates[ReminderState.DrinkImmediately].reminderText, I18n.t(`drinkReminderButton.drank`), I18n.t(`drinkReminderButton.skip`)).then(selection => {
            if (!this.CReminder) throw new Error("❌ Error: DrinkReminder Class is null in DrinkImmediatelyState!");
            if (selection === I18n.t(`drinkReminderButton.drank`)) {
                clearTimeout(reminderTimeout);
                this.CReminder.drankWater();
            } else if (selection === I18n.t(`drinkReminderButton.skip`)) {
                clearTimeout(reminderTimeout);
                this.nextState();
                this.CReminder.decreaseInterval();
            }
        });
    }
}

class AlertState implements IReminderState {
    private CReminder: DrinkReminder | null = null;

    constructor(private reminder: DrinkReminder) {
        this.CReminder = reminder;
        this.CReminder.setStatusBarItemText(DrinkCodeSettings.drinkStates[ReminderState.Alert].statusBar);
    }
    nextState() {
        if (!this.CReminder) return;
        this.CReminder.setReminderState(new AlertState(this.CReminder)); // Stay in this state
    }
    showReminder() {
        const reminderTimeout = setTimeout(() => {
            if (!this.CReminder) throw new Error("❌ Error: DrinkReminder Class is null in HydratedState!");
            this.nextState();
            this.CReminder.decreaseInterval();
        }, DrinkCodeSettings.drinkReminderTimeout);

        vscode.window.showInformationMessage(DrinkCodeSettings.drinkStates[ReminderState.Alert].reminderText, I18n.t(`drinkReminderButton.drank`), I18n.t(`drinkReminderButton.skip`)).then(selection => {
            if (!this.CReminder) throw new Error("❌ Error: DrinkReminder Class is null in AlertState!");
            if (selection === I18n.t(`drinkReminderButton.drank`)) {
                clearTimeout(reminderTimeout);
                this.CReminder.drankWater();
            } else if (selection === I18n.t(`drinkReminderButton.skip`)) {
                clearTimeout(reminderTimeout);
                this.nextState();
                this.CReminder.decreaseInterval();
            }
        });
    }
}

function TextToUnicodeBold(text: string): string {
    const boldOffset = 0x1D5D4;
    return text.split('').map(char => {
        if (char >= 'A' && char <= 'Z') {
            return String.fromCodePoint(boldOffset + char.charCodeAt(0) - 0x41);
        } else if (char >= 'a' && char <= 'z') {
            return String.fromCodePoint(boldOffset + char.charCodeAt(0) - 0x61 + 26);
        } else {
            return char;
        }
    }).join('');
};