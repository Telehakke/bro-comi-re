import {
    defaultAppState,
    type AppState,
    type History,
    type MovementDirection,
    type ViewSplitCount,
    type WritingType,
} from "./appState";
import { localStorage } from "./localStorage";

type AppStore = AppState &
    Readonly<{
        setAppState: (value: AppState) => AppStore;
        setHistories: (value: readonly History[]) => AppStore;
        setMovementDirection: (value: MovementDirection) => AppStore;
        setOnSharpeningFilter: (value: boolean) => AppStore;
        setScrollSpeed: (value: number) => AppStore;
        setSharpeningFilterStrength: (value: number) => AppStore;
        setShouldAdvance: (value: boolean) => AppStore;
        setViewSplitCount: (value: ViewSplitCount) => AppStore;
        setWritingType: (value: WritingType) => AppStore;
        setZoomStep: (value: number) => AppStore;
    }>;

export const appStore: AppStore = {
    ...defaultAppState,
    setAppState(value) {
        const obj: AppStore = { ...this, ...value };
        localStorage.setAppState(obj);
        return obj;
    },
    setHistories(value) {
        const obj: AppStore = { ...this, histories: value };
        localStorage.setAppState(obj);
        return obj;
    },
    setMovementDirection(value) {
        const obj: AppStore = { ...this, movementDirection: value };
        localStorage.setAppState(obj);
        return obj;
    },
    setOnSharpeningFilter(value) {
        const obj: AppStore = { ...this, onSharpeningFilter: value };
        localStorage.setAppState(obj);
        return obj;
    },
    setScrollSpeed(value) {
        const obj: AppStore = { ...this, scrollSpeed: value };
        localStorage.setAppState(obj);
        return obj;
    },
    setSharpeningFilterStrength(value) {
        const obj: AppStore = { ...this, sharpeningFilterStrength: value };
        localStorage.setAppState(obj);
        return obj;
    },
    setShouldAdvance(value) {
        const obj: AppStore = { ...this, shouldAdvance: value };
        localStorage.setAppState(obj);
        return obj;
    },
    setViewSplitCount(value) {
        const obj: AppStore = { ...this, viewSplitCount: value };
        localStorage.setAppState(obj);
        return obj;
    },
    setWritingType(value) {
        const obj: AppStore = { ...this, writingType: value };
        localStorage.setAppState(obj);
        return obj;
    },
    setZoomStep(value) {
        const obj: AppStore = { ...this, zoomStep: value };
        localStorage.setAppState(obj);
        return obj;
    },
};
