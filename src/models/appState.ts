import { isBoolean, isNotNull } from "./typeGuards";
import { FilterStrength, ScrollSpeed, ZoomStep } from "./validator";

export type AppState = Readonly<{
    histories: readonly History[];
    movementDirection: MovementDirection;
    onSharpeningFilter: boolean;
    scrollSpeed: number;
    sharpeningFilterStrength: number;
    shouldAdvance: boolean;
    viewSplitCount: ViewSplitCount;
    writingType: WritingType;
    zoomStep: number;
}>;

export const defaultAppState: AppState = {
    histories: [],
    movementDirection: "vertical",
    onSharpeningFilter: false,
    scrollSpeed: 2,
    sharpeningFilterStrength: 3,
    shouldAdvance: false,
    viewSplitCount: "four",
    writingType: "vertical",
    zoomStep: 50,
};

/* -------------------------------------------------------------------------- */

export const createAppState = (value: unknown): AppState => {
    if (!isNotNull(value)) return defaultAppState;

    const v = value as AppState;
    const obj: AppState = {
        histories: ensureHistories(v.histories, defaultAppState.histories),
        movementDirection: ensureMovementDirection(
            v.movementDirection,
            defaultAppState.movementDirection,
        ),
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

export const MovementDirectionEnum = {
    vertical: { value: "vertical", label: "垂直" },
    horizontal: { value: "horizontal", label: "水平" },
} as const;

export type MovementDirection = keyof typeof MovementDirectionEnum;

export const isMovementDirection = (
    value: unknown,
): value is MovementDirection => {
    return Object.keys(MovementDirectionEnum).some((v) => v === value);
};

const ensureMovementDirection = (
    value: unknown,
    defaultValue: MovementDirection,
): MovementDirection => {
    return isMovementDirection(value) ? value : defaultValue;
};

/* -------------------------------------------------------------------------- */

export const ViewSplitCountEnum = {
    four: { value: "four", label: "4" },
    six: { value: "six", label: "6" },
    nine: { value: "nine", label: "9" },
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
    vertical: { value: "vertical", label: "縦書き" },
    horizontal: { value: "horizontal", label: "横書き" },
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
