// Feel free to look around, but don't change anything here unless you know what you're doing.

import * as vscode from 'vscode';
import { DrinkReminder } from './states';
import { IDrinkCodeSettings, ReminderState } from './interfaces';
import { I18n as CI18n } from './i18n';

let DrinkReminderClass: DrinkReminder | null = null;
let DrinkCodeSettings: IDrinkCodeSettings | null = null;

export async function activate(context: vscode.ExtensionContext) {
	const I18n = await CI18n.create(vscode.env.language);

	DrinkCodeSettings = {
		drinkInterval: 30 * 60 * 1000,
		drinkSkipFactor: 2,
		drinkReminderTimeout: 2 * 60 * 1000,
		drinkMinInterval: 5 * 60 * 1000,
		drinkStates: {
			[ReminderState.Hydrated]: {
				statusBar: I18n.t(`drinkStates.${ReminderState.Hydrated}.statusBar`),
				reminderText: I18n.t(`drinkStates.${ReminderState.Hydrated}.reminderText`),
			},
			[ReminderState.Drink]: {
				statusBar: I18n.t(`drinkStates.${ReminderState.Drink}.statusBar`),
				reminderText: I18n.t(`drinkStates.${ReminderState.Drink}.reminderText`),
			},
			[ReminderState.GrabWater]: {
				statusBar: I18n.t(`drinkStates.${ReminderState.GrabWater}.statusBar`),
				reminderText: I18n.t(`drinkStates.${ReminderState.GrabWater}.reminderText`),
			},
			[ReminderState.DrinkImmediately]: {
				statusBar: I18n.t(`drinkStates.${ReminderState.DrinkImmediately}.statusBar`),
				reminderText: I18n.t(`drinkStates.${ReminderState.DrinkImmediately}.reminderText`),
			},
			[ReminderState.Alert]: {
				statusBar: I18n.t(`drinkStates.${ReminderState.Alert}.statusBar`),
				reminderText: I18n.t(`drinkStates.${ReminderState.Alert}.reminderText`),
			}
		}
	};

	// Load the settings
	const config = vscode.workspace.getConfiguration("drink-code");

	if (config.has("drinkInterval") && config.get("drinkInterval") !== -1) DrinkCodeSettings.drinkInterval = config.get("drinkInterval") as number;
	if (config.has("drinkSkipFactor") && config.get("drinkSkipFactor") !== -1) DrinkCodeSettings.drinkSkipFactor = config.get("drinkSkipFactor") as number;
	if (config.has("drinkReminderTimeout") && config.get("drinkReminderTimeout") !== -1) DrinkCodeSettings.drinkReminderTimeout = config.get("drinkReminderTimeout") as number;
	if (config.has("drinkMinInterval") && config.get("drinkMinInterval") !== -1) DrinkCodeSettings.drinkMinInterval = config.get("drinkMinInterval") as number;
	if (config.has("drinkStates") && config.get("drinkStates", []).length > 0) {
		const drinkStates = config.get("drinkStates") as { statusBar: string; reminderText: string }[];
	
		if (Array.isArray(drinkStates)) {
			drinkStates.forEach((state, index) => {
				if (state && typeof state.statusBar === "string" && typeof state.reminderText === "string" && DrinkCodeSettings) {
					DrinkCodeSettings.drinkStates[index] = {
						statusBar: state.statusBar,
						reminderText: state.reminderText
					};
				}
			});
		}
	}
	// console.log("🚰 DrinkCodeSettings: ", DrinkCodeSettings);

	// Initialize the DrinkReminder class6
	DrinkReminderClass = new DrinkReminder(context, DrinkCodeSettings, I18n);

	// Commands
	const disposable = vscode.commands.registerCommand('drink-code.drinkWater', () => {
		if (!DrinkReminderClass) throw new Error("❌ Error: DrinkReminder Class is null (GLOBAL)!"); 
		DrinkReminderClass.drankWater(true);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
