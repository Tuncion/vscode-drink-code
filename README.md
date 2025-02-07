<h1 align="center">Welcome to Drink Code 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <img src="https://img.shields.io/badge/vscode-%5E1.96.0-blue.svg" />
  <a href="https://www.gnu.org/licenses/gpl-3.0.de.html" target="_blank">
    <img alt="License: gpl--3.0" src="https://img.shields.io/badge/License-gpl--3.0-yellow.svg" />
  </a>
</p>

> Stay on top of your hydration game while you code! "Drink Code" helps developers maintain their health by sending gentle reminders to drink water during coding sessions.

### 🏠 [Homepage](https://tuncion.de)

## ✨ Demo
**Drink Reminder Notify:**\
![Drink Notify](https://i.imgur.com/iUcTFlA.png)

**Drink Status Bar:**\
![Drink Status Bar - Hydrated](https://i.imgur.com/dqbs8ND.png)\
![Drink Status Bar - DRINK NOW](https://i.imgur.com/ooQaILM.png)

_... more states available!_

## Languages

🌍 **"Drink Code" is available in the following languages:**
- 🇨🇿 Czech (cs)
- 🇩🇪 German (de)
- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇭🇺 Hungarian (hu)
- 🇯🇵 Japanese (ja)
- 🇰🇷 Korean (ko)
- 🇵🇱 Polish (pl)
- 🇧🇷 Portuguese (Brazil) (pt-br)
- 🇷🇺 Russian (ru)
- 🇹🇷 Turkish (tr)
- 🇨🇳 Chinese (Simplified) (zh-cn)
- 🇹🇼 Chinese (Traditional) (zh-tw)

### ⚡ Available Configuration

| Configuration Key               | Description                                                                                      | Default Value    | Example                                                                 |
|----------------------------------|--------------------------------------------------------------------------------------------------|------------------|-------------------------------------------------------------------------|
| `drink-code.drinkInterval`       | Interval in milliseconds to remind you to drink water.                                           | `30 * 60 * 1000` (30 minutes)  | `drink-code.drinkInterval: 1800000`                                     |
| `drink-code.drinkSkipFactor`     | Factor to skip the next reminder (e.g. 2 means the interval will be halved every time you skip). | `2`              | `drink-code.drinkSkipFactor: 2`                                         |
| `drink-code.drinkReminderTimeout`| Timeout in milliseconds to dismiss the reminder.                                                 | `2 * 60 * 1000` (2 minutes) | `drink-code.drinkReminderTimeout: 120000`                               |
| `drink-code.drinkMinInterval`    | Minimum interval in milliseconds to remind you to drink water (used for decreasing the interval).| `5 * 60 * 1000` (5 minutes) | `drink-code.drinkMinInterval: 300000`                                   |
| `drink-code.drinkStates`         | States to remind you to drink water. Each state has a `statusBar` and `reminderText`. If only a subset of states is defined (e.g., only states 0 and 1), the remaining states (2, 3, 4, etc.) will use the default settings. | `[]` (Default uses built-in states) | `drink-code.drinkStates: [ { "statusBar": "Hydrated", "reminderText": "You are hydrated" }, { "statusBar": "Drink", "reminderText": "Time to drink" } ]` |

## Prerequisites

- vscode ^1.96.0

## Install

```sh
npm install
```

## Author

👤 **Tuncion**

* Website: https://tuncion.de
* Github: [@Tuncion](https://github.com/Tuncion)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/Tuncion/vscode-drink-code/issues). You can also take a look at the [contributing guide](https://github.com/Tuncion/vscode-drink-code/blob/master/CONTRIBUTION.md).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2025 [Tuncion](https://github.com/Tuncion).<br />
This project is [gpl--3.0](https://www.gnu.org/licenses/gpl-3.0.de.html) licensed.