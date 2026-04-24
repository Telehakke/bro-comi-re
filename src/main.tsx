import { getDefaultStore } from "jotai";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ActionAtom, Atom } from "./atoms";
import { LocalStorage } from "./models/localStorage";

const defaultStore = getDefaultStore();
const appState = LocalStorage.getAppState();
defaultStore.set(Atom.appStore, (a) => a.setAppState(appState));

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        defaultStore.set(ActionAtom.updateHistory);
    }
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
