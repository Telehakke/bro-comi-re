import {
    defaultAppState,
    type AppState,
    type ContentFit,
    type DisplayMode,
    type History,
    type TapAreaLength,
    type ViewSplitCount,
    type WritingType,
} from "./appState";
import { LocalStorage } from "./localStorage";

type AppStore = AppState &
    Readonly<{
        setAppState: (value: AppState) => AppStore;
        setContentFit: (value: ContentFit) => AppStore;
        setDisplayMode: (value: DisplayMode) => AppStore;
        setHistories: (value: readonly History[]) => AppStore;
        setOnSharpeningFilter: (value: boolean) => AppStore;
        setScrollSpeed: (value: number) => AppStore;
        setSharpeningFilterStrength: (value: number) => AppStore;
        setShouldAdvance: (value: boolean) => AppStore;
        setShouldShowFullscreenButton: (value: boolean) => AppStore;
        setShouldShowInvertButton: (value: boolean) => AppStore;
        setTapAreaWidth: (value: TapAreaLength) => AppStore;
        setTapAreaHeight: (value: TapAreaLength) => AppStore;
        setViewSplitCount: (value: ViewSplitCount) => AppStore;
        setWritingType: (value: WritingType) => AppStore;
        setZoomStep: (value: number) => AppStore;
    }>;

export const appStore: AppStore = {
    ...defaultAppState,
    setAppState(value) {
        const obj: AppStore = { ...this, ...value };
        LocalStorage.setAppState(obj);
        return obj;
    },
    setContentFit(value) {
        const obj: AppStore = { ...this, contentFit: value };
        LocalStorage.setAppState(obj);
        return obj;
    },
    setDisplayMode(value) {
        const obj: AppStore = { ...this, displayMode: value };
        LocalStorage.setAppState(obj);
        return obj;
    },
    setHistories(value) {
        const obj: AppStore = { ...this, histories: value };
        LocalStorage.setAppState(obj);
        return obj;
    },
    setOnSharpeningFilter(value) {
        const obj: AppStore = { ...this, onSharpeningFilter: value };
        LocalStorage.setAppState(obj);
        return obj;
    },
    setScrollSpeed(value) {
        const obj: AppStore = { ...this, scrollSpeed: value };
        LocalStorage.setAppState(obj);
        return obj;
    },
    setSharpeningFilterStrength(value) {
        const obj: AppStore = { ...this, sharpeningFilterStrength: value };
        LocalStorage.setAppState(obj);
        return obj;
    },
    setShouldAdvance(value) {
        const obj: AppStore = { ...this, shouldAdvance: value };
        LocalStorage.setAppState(obj);
        return obj;
    },
    setShouldShowFullscreenButton(value) {
        const obj: AppStore = { ...this, shouldShowFullscreenButton: value };
        LocalStorage.setAppState(obj);
        return obj;
    },
    setShouldShowInvertButton(value) {
        const obj: AppStore = { ...this, shouldShowInvertButton: value };
        LocalStorage.setAppState(obj);
        return obj;
    },
    setTapAreaWidth(value) {
        const obj: AppStore = { ...this, tapAreaWidth: value };
        LocalStorage.setAppState(obj);
        return obj;
    },
    setTapAreaHeight(value) {
        const obj: AppStore = { ...this, tapAreaHeight: value };
        LocalStorage.setAppState(obj);
        return obj;
    },
    setViewSplitCount(value) {
        const obj: AppStore = { ...this, viewSplitCount: value };
        LocalStorage.setAppState(obj);
        return obj;
    },
    setWritingType(value) {
        const obj: AppStore = { ...this, writingType: value };
        LocalStorage.setAppState(obj);
        return obj;
    },
    setZoomStep(value) {
        const obj: AppStore = { ...this, zoomStep: value };
        LocalStorage.setAppState(obj);
        return obj;
    },
};
