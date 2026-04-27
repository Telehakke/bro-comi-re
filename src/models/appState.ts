import { isBoolean, isNotNull } from "./typeGuards";
import { FilterStrength, ScrollSpeed, ZoomStep } from "./validator";

export type AppState = Readonly<{
    displayMode: DisplayMode;
    histories: readonly History[];
    onSharpeningFilter: boolean;
    scrollSpeed: number;
    sharpeningFilterStrength: number;
    shouldAdvance: boolean;
    tapAreaWidth: TapAreaLength;
    tapAreaHeight: TapAreaLength;
    viewSplitCount: ViewSplitCount;
    writingType: WritingType;
    zoomStep: number;
}>;

export const defaultAppState: AppState = {
    displayMode: "single",
    histories: [],
    onSharpeningFilter: false,
    scrollSpeed: 4,
    sharpeningFilterStrength: 3,
    shouldAdvance: false,
    tapAreaWidth: "s",
    tapAreaHeight: "s",
    viewSplitCount: "four",
    writingType: "vertical",
    zoomStep: 50,
};

/* -------------------------------------------------------------------------- */

export const createAppState = (value: unknown): AppState => {
    if (!isNotNull(value)) return defaultAppState;

    const v = value as AppState;
    const obj: AppState = {
        displayMode: ensureDisplayMode(
            v.displayMode,
            defaultAppState.displayMode,
        ),
        histories: ensureHistories(v.histories, defaultAppState.histories),
        onSharpeningFilter: ensureBoolean(
            v.onSharpeningFilter,
            defaultAppState.onSharpeningFilter,
        ),
        scrollSpeed: ScrollSpeed.ensure(
            v.scrollSpeed,
            defaultAppState.scrollSpeed,
        ),
        sharpeningFilterStrength: FilterStrength.ensure(
            v.sharpeningFilterStrength,
            defaultAppState.sharpeningFilterStrength,
        ),
        shouldAdvance: ensureBoolean(
            v.shouldAdvance,
            defaultAppState.shouldAdvance,
        ),
        tapAreaWidth: ensureTapAreaLength(
            v.tapAreaWidth,
            defaultAppState.tapAreaWidth,
        ),
        tapAreaHeight: ensureTapAreaLength(
            v.tapAreaHeight,
            defaultAppState.tapAreaHeight,
        ),
        viewSplitCount: ensureViewSplitCount(
            v.viewSplitCount,
            defaultAppState.viewSplitCount,
        ),
        writingType: ensureWritingType(
            v.writingType,
            defaultAppState.writingType,
        ),
        zoomStep: ZoomStep.ensure(v.zoomStep, defaultAppState.zoomStep),
    };
    return obj;
};

const ensureBoolean = (value: unknown, defaultValue: boolean): boolean => {
    return isBoolean(value) ? value : defaultValue;
};

/* -------------------------------------------------------------------------- */

export const DisplayModeEnum = {
    single: { value: "single", label: "1" },
    book: { value: "book", label: "1・2" },
    double: { value: "double", label: "2" },
};

export type DisplayMode = keyof typeof DisplayModeEnum;

export const isDisplayMode = (value: unknown): value is DisplayMode => {
    return Object.keys(DisplayModeEnum).some((v) => v === value);
};

const ensureDisplayMode = (
    value: unknown,
    defaultValue: DisplayMode,
): DisplayMode => {
    return isDisplayMode(value) ? value : defaultValue;
};

/* -------------------------------------------------------------------------- */

export type History = {
    name: string;
    index: number;
};

export const isHistory = (value: unknown): value is History => {
    if (!isNotNull(value)) return false;
    if (typeof value.name !== "string") return false;
    if (typeof value.index !== "number") return false;
    return true;
};

export const isHistories = (value: unknown): value is readonly History[] => {
    if (!Array.isArray(value)) return false;
    return value.every((v) => isHistory(v));
};

const ensureHistories = (
    value: unknown,
    defaultValue: readonly History[],
): readonly History[] => {
    return isHistories(value) ? value : defaultValue;
};

/* -------------------------------------------------------------------------- */

export const TapAreaLengthEnum = {
    s: { value: "s", label: "S", length: "75px" },
    m: { value: "m", label: "M", length: "100px" },
    l: { value: "l", label: "L", length: "125px" },
} as const;

export type TapAreaLength = keyof typeof TapAreaLengthEnum;

export const isTapAreaLength = (value: unknown): value is TapAreaLength => {
    return Object.keys(TapAreaLengthEnum).some((v) => v === value);
};

const ensureTapAreaLength = (
    value: unknown,
    defaultValue: TapAreaLength,
): TapAreaLength => {
    return isTapAreaLength(value) ? value : defaultValue;
};

/* -------------------------------------------------------------------------- */

export const ViewSplitCountEnum = {
    four: { value: "four", label: "4" },
    six: { value: "six", label: "6" },
} as const;

export type ViewSplitCount = keyof typeof ViewSplitCountEnum;

export const isViewSplitCount = (value: unknown): value is ViewSplitCount => {
    return Object.keys(ViewSplitCountEnum).some((v) => v === value);
};

const ensureViewSplitCount = (
    value: unknown,
    defaultValue: ViewSplitCount,
): ViewSplitCount => {
    return isViewSplitCount(value) ? value : defaultValue;
};

/* -------------------------------------------------------------------------- */

export const WritingTypeEnum = {
    horizontal: { value: "horizontal", label: "横書き" },
    vertical: { value: "vertical", label: "縦書き" },
} as const;

export type WritingType = keyof typeof WritingTypeEnum;

export const isWritingType = (value: unknown): value is WritingType => {
    return Object.keys(WritingTypeEnum).some((v) => v === value);
};

const ensureWritingType = (
    value: unknown,
    defaultValue: WritingType,
): WritingType => {
    return isWritingType(value) ? value : defaultValue;
};
