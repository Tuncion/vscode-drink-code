export enum ReminderState {
    Hydrated,
    Drink,
    GrabWater,
    DrinkImmediately,
    Alert
}

export interface IDrinkCodeSettings {
    drinkInterval: number;
    drinkSkipFactor: number;
    drinkReminderTimeout: number;
    drinkMinInterval: number;
    drinkStates: Record<number, { statusBar: string; reminderText: string }>;
}

export interface IReminderState {
    nextState(): void;
    showReminder(): void;
}