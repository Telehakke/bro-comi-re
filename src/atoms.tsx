import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { createAppState } from "./models/appState";
import { appStore } from "./models/appStore";
import { FileManager } from "./models/fileManager";
import { HistoryManager } from "./models/historyManager";
import { SharpeningFilter } from "./models/sharpeningFilter";
import { ZoomManager } from "./models/zoomManager";

type Toast = { text: string; state: "visible" | "hidden" };
let timerId: number | undefined;

export const Atom = {
    appStore: atomWithStorage("appState", appStore, {
        getItem(key) {
            const data = localStorage.getItem(key);
            return appStore.setAppState(
                createAppState(data == null ? data : JSON.parse(data)),
            );
        },
        setItem(key, newValue) {
            localStorage.setItem(key, JSON.stringify(newValue));
        },
        removeItem(key) {
            localStorage.removeItem(key);
        },
    }),
    fileManager: atom(new FileManager()),
    historyManager: atom(new HistoryManager(appStore.histories)),
    imageBlob: atom<Blob | undefined>(undefined),
    isOpenSideMenu: atom(false),
    sharpeningFilter: atom(() => new SharpeningFilter()),
    toastMessage: atom<Toast, [toast: Toast], void>(
        { text: "", state: "hidden" },
        (_, set, toast) => {
            set(Atom.toastMessage, toast);

            window.clearInterval(timerId);
            timerId = window.setInterval(() => {
                set(Atom.toastMessage, { ...toast, state: "hidden" });
            }, 1000);
        },
    ),
    zipFileName: atom<string | undefined>(undefined),
    zoomManager: atom(new ZoomManager()),
} as const;
