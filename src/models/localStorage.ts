import { createAppState, defaultAppState, type AppState } from "./appState";

type LocalStorage = Readonly<{
    getAppState: () => AppState;
    setAppState: (appState: AppState) => void;
}>;

const KEY = "appState";

export const localStorage: LocalStorage = {
    getAppState() {
        const data = window.localStorage.getItem(KEY);
        if (data == null) return defaultAppState;

        const obj = createAppState(JSON.parse(data));
        return obj;
    },
    setAppState(appState) {
        window.localStorage.setItem(KEY, JSON.stringify(appState));
    },
};
