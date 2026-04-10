import {
    defaultAppState,
    type AppState,
    type History,
    type MovementDirection,
    type ViewSplitCount,
    type WritingType,
} from "./appState";

type AppStore = AppState &
    Readonly<{
        setAppState: (obj: AppState) => AppStore;
        setHistories: (value: readonly History[]) => AppStore;
        setMovementDirection: (value: MovementDirection) => AppStore;
        setOnSharpeningFilter: (value: boolean) => AppStore;
        setSharpeningFilterStrength: (value: number) => AppStore;
        setShouldAdvance: (value: boolean) => AppStore;
        setViewSplitCount: (value: ViewSplitCount) => AppStore;
        setWritingType: (value: WritingType) => AppStore;
        setZoomStep: (value: number) => AppStore;
    }>;

export const appStore: AppStore = {
    ...defaultAppState,
    setAppState(obj) {
        return { ...this, ...obj };
    },
    setHistories(value) {
        return { ...this, histories: value };
    },
    setMovementDirection(value) {
        return { ...this, movementDirection: value };
    },
    setOnSharpeningFilter(value) {
        return { ...this, onSharpeningFilter: value };
    },
    setSharpeningFilterStrength(value) {
        return { ...this, sharpeningFilterStrength: value };
    },
    setShouldAdvance(value) {
        return { ...this, shouldAdvance: value };
    },
    setViewSplitCount(value) {
        return { ...this, viewSplitCount: value };
    },
    setWritingType(value) {
        return { ...this, writingType: value };
    },
    setZoomStep(value) {
        return { ...this, zoomStep: value };
    },
};
