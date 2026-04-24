import { createAppState, defaultAppState, type AppState } from "./appState";

const KEY = "appState";

export class LocalStorage {
    static getAppState(): AppState {
        const data = window.localStorage.getItem(KEY);
        if (data == null) return defaultAppState;

        return createAppState(JSON.parse(data));
    }

    static setAppState(appState: AppState): void {
        window.localStorage.setItem(KEY, JSON.stringify(appState));
    }
}
