import { getDefaultStore } from "jotai";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Atom } from "./atoms";
import { localStorage } from "./models/localStorage";

const defaultStore = getDefaultStore();
const appState = localStorage.getAppState();
defaultStore.set(Atom.appStore, (a) => a.setAppState(appState));

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
