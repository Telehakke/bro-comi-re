import type { ViewSplitCount, WritingType } from "./appState";

const MIN = 0;
const CENTER = 50;
const MAX = 100;

export class ScrollManager {
    readonly x: number;
    readonly y: number;

    constructor(horizontalPercentage?: number, verticalPercentage?: number) {
        this.x = Math.max(Math.min(horizontalPercentage ?? MIN, MAX), MIN);
        this.y = Math.max(Math.min(verticalPercentage ?? MIN, MAX), MIN);
    }

    static readonly fromWritingType = (
        writingType: WritingType,
        end: boolean = false,
    ): ScrollManager => {
        if (end) {
            switch (writingType) {
                case "vertical":
                    return new ScrollManager(Leftmost.VALUE, Bottom.VALUE);
                case "horizontal":
                    return new ScrollManager(Rightmost.VALUE, Bottom.VALUE);
            }
        } else {
            switch (writingType) {
                case "vertical":
                    return new ScrollManager(Rightmost.VALUE, Top.VALUE);
                case "horizontal":
                    return new ScrollManager(Leftmost.VALUE, Top.VALUE);
            }
        }
    };

    static readonly fromElement = (
        viewer: HTMLDivElement,
        content: HTMLDivElement,
    ): ScrollManager => {
        const diffW = content.clientWidth - viewer.clientWidth;
        const diffH = content.clientHeight - viewer.clientHeight;
        return new ScrollManager(
            diffW == 0 ? 0 : (Math.ceil(viewer.scrollLeft) / diffW) * 100,
            diffH == 0 ? 0 : (Math.ceil(viewer.scrollTop) / diffH) * 100,
        );
    };

    readonly update = (
        viewer: HTMLDivElement,
        content: HTMLDivElement,
    ): ScrollManager => {
        const diffW = content.clientWidth - viewer.clientWidth;
        const diffH = content.clientHeight - viewer.clientHeight;
        return new ScrollManager(
            diffW > 0 ? (Math.ceil(viewer.scrollLeft) / diffW) * 100 : this.x,
            diffH > 0 ? (Math.ceil(viewer.scrollTop) / diffH) * 100 : this.y,
        );
    };

    readonly isHorizontalMin = (): boolean => {
        return this.x === MIN;
    };

    readonly isHorizontalMax = (): boolean => {
        return this.x === MAX;
    };

    readonly applyScroll = (
        viewer: HTMLElement,
        content: HTMLDivElement,
    ): void => {
        const x =
            ((content.clientWidth - viewer.clientWidth) * (this.x ?? 0)) / 100;
        const y =
            ((content.clientHeight - viewer.clientHeight) * (this.y ?? 0)) /
            100;
        viewer.scroll(x, y);
    };

    readonly next = (
        writingType: WritingType,
        viewSplitCount: ViewSplitCount,
        viewer: HTMLDivElement,
        content: HTMLDivElement,
    ): ScrollManager => {
        const diffH = content.clientHeight - viewer.clientHeight;
        const vOrigin = this.getVerticalOrigin();
        const hOrigin = this.getHorizontalOrigin();
        let x: number | undefined = undefined;
        let y: number | undefined = undefined;
        if (diffH <= 0) {
            x = hOrigin.next(writingType, viewSplitCount).VALUE;
        } else {
            y = vOrigin.next(writingType, viewSplitCount).VALUE;
            if (vOrigin.isEnd(writingType)) {
                x = hOrigin.next(writingType, viewSplitCount).VALUE;
            }
        }
        return new ScrollManager(x ?? this.x, y ?? this.y);
    };

    readonly previous = (
        writingType: WritingType,
        viewSplitCount: ViewSplitCount,
        viewer: HTMLDivElement,
        content: HTMLDivElement,
    ): ScrollManager => {
        const diffH = content.clientHeight - viewer.clientHeight;
        const vOrigin = this.getVerticalOrigin();
        const hOrigin = this.getHorizontalOrigin();
        let x: number | undefined = undefined;
        let y: number | undefined = undefined;
        if (diffH <= 0) {
            x = hOrigin.previous(writingType, viewSplitCount).VALUE;
        } else {
            y = vOrigin.previous(writingType, viewSplitCount).VALUE;
            if (vOrigin.isStart(writingType)) {
                x = hOrigin.previous(writingType, viewSplitCount).VALUE;
            }
        }
        return new ScrollManager(x ?? this.x, y ?? this.y);
    };

    readonly shouldMoveToNextPage = (
        viewer: HTMLElement,
        content: HTMLDivElement,
        writingType: WritingType,
    ): boolean => {
        const diffW = content.clientWidth - viewer.clientWidth;
        const diffH = content.clientHeight - viewer.clientHeight;
        const result1 =
            diffW <= 0 ? true : this.getHorizontalOrigin().isEnd(writingType);
        const result2 =
            diffH <= 0 ? true : this.getVerticalOrigin().isEnd(writingType);
        return result1 && result2;
    };

    readonly shouldMoveToPreviousPage = (
        viewer: HTMLElement,
        content: HTMLDivElement,
        writingType: WritingType,
    ): boolean => {
        const diffW = content.clientWidth - viewer.clientWidth;
        const diffH = content.clientHeight - viewer.clientHeight;
        const result1 =
            diffW <= 0 ? true : this.getHorizontalOrigin().isStart(writingType);
        const result2 =
            diffH <= 0 ? true : this.getVerticalOrigin().isStart(writingType);
        return result1 && result2;
    };

    private readonly getVerticalOrigin = (): Origin => {
        const h = Math.round(this.y);
        if (h === MIN) return Top;
        if (MIN < h && h < CENTER) return Up;
        if (h === CENTER) return VCenter;
        if (CENTER < h && h < MAX) return Down;
        return Bottom;
    };

    private readonly getHorizontalOrigin = (): Origin => {
        const w = Math.round(this.x);
        if (w === MIN) return Leftmost;
        if (MIN < w && w < CENTER) return Left;
        if (w === CENTER) return HCenter;
        if (CENTER < w && w < MAX) return Right;
        return Rightmost;
    };
}

/* -------------------------------------------------------------------------- */
type Origin = Readonly<{
    NAME: string;
    VALUE: number | undefined;
    isStart: (writingType: WritingType) => boolean;
    isEnd: (writingType: WritingType) => boolean;
    next: (writingType: WritingType, viewSplitCount: ViewSplitCount) => Origin;
    previous: (
        writingType: WritingType,
        viewSplitCount: ViewSplitCount,
    ) => Origin;
}>;

/* -------------------------------------------------------------------------- */

// -----Top--------- 0
//      Up
// -----VCenter----- 50
//      Down
// -----Bottom------ 100

const Top: Origin = {
    NAME: "Top",
    VALUE: MIN,
    isStart(writingType) {
        return IsStartMap[this.NAME][writingType];
    },
    isEnd(writingType) {
        return IsEndMap[this.NAME][writingType];
    },
    next(writingType, viewSplitCount) {
        return NextMap[this.NAME][writingType][viewSplitCount];
    },
    previous(writingType, viewSplitCount) {
        return PreviousMap[this.NAME][writingType][viewSplitCount];
    },
};

const Up: Origin = {
    NAME: "Up",
    VALUE: undefined,
    isStart(writingType) {
        return IsStartMap[this.NAME][writingType];
    },
    isEnd(writingType) {
        return IsEndMap[this.NAME][writingType];
    },
    next(writingType, viewSplitCount) {
        return NextMap[this.NAME][writingType][viewSplitCount];
    },
    previous(writingType, viewSplitCount) {
        return PreviousMap[this.NAME][writingType][viewSplitCount];
    },
};

const VCenter: Origin = {
    NAME: "VCenter",
    VALUE: CENTER,
    isStart(writingType) {
        return IsStartMap[this.NAME][writingType];
    },
    isEnd(writingType) {
        return IsEndMap[this.NAME][writingType];
    },
    next(writingType, viewSplitCount) {
        return NextMap[this.NAME][writingType][viewSplitCount];
    },
    previous(writingType, viewSplitCount) {
        return PreviousMap[this.NAME][writingType][viewSplitCount];
    },
};

const Down: Origin = {
    NAME: "Down",
    VALUE: undefined,
    isStart(writingType) {
        return IsStartMap[this.NAME][writingType];
    },
    isEnd(writingType) {
        return IsEndMap[this.NAME][writingType];
    },
    next(writingType, viewSplitCount) {
        return NextMap[this.NAME][writingType][viewSplitCount];
    },
    previous(writingType, viewSplitCount) {
        return PreviousMap[this.NAME][writingType][viewSplitCount];
    },
};

const Bottom: Origin = {
    NAME: "Bottom",
    VALUE: MAX,
    isStart(writingType) {
        return IsStartMap[this.NAME][writingType];
    },
    isEnd(writingType) {
        return IsEndMap[this.NAME][writingType];
    },
    next(writingType, viewSplitCount) {
        return NextMap[this.NAME][writingType][viewSplitCount];
    },
    previous(writingType, viewSplitCount) {
        return PreviousMap[this.NAME][writingType][viewSplitCount];
    },
};

/* -------------------------------------------------------------------------- */

// |           |            |
// Leftmost HCenter Rightmost
// |           |            |
// |   Left    |   Right    |
// |           |            |
// 0           50         100

const Leftmost: Origin = {
    NAME: "Leftmost",
    VALUE: MIN,
    isStart(writingType) {
        return IsStartMap[this.NAME][writingType];
    },
    isEnd(writingType) {
        return IsEndMap[this.NAME][writingType];
    },
    next(writingType, viewSplitCount) {
        return NextMap[this.NAME][writingType][viewSplitCount];
    },
    previous(writingType, viewSplitCount) {
        return PreviousMap[this.NAME][writingType][viewSplitCount];
    },
};

const Left: Origin = {
    NAME: "Left",
    VALUE: undefined,
    isStart(writingType) {
        return IsStartMap[this.NAME][writingType];
    },
    isEnd(writingType) {
        return IsEndMap[this.NAME][writingType];
    },
    next(writingType, viewSplitCount) {
        return NextMap[this.NAME][writingType][viewSplitCount];
    },
    previous(writingType, viewSplitCount) {
        return PreviousMap[this.NAME][writingType][viewSplitCount];
    },
};

const HCenter: Origin = {
    NAME: "HCenter",
    VALUE: CENTER,
    isStart(writingType) {
        return IsStartMap[this.NAME][writingType];
    },
    isEnd(writingType) {
        return IsEndMap[this.NAME][writingType];
    },
    next(writingType, viewSplitCount) {
        return NextMap[this.NAME][writingType][viewSplitCount];
    },
    previous(writingType, viewSplitCount) {
        return PreviousMap[this.NAME][writingType][viewSplitCount];
    },
};

const Right: Origin = {
    NAME: "Right",
    VALUE: undefined,
    isStart(writingType) {
        return IsStartMap[this.NAME][writingType];
    },
    isEnd(writingType) {
        return IsEndMap[this.NAME][writingType];
    },
    next(writingType, viewSplitCount) {
        return NextMap[this.NAME][writingType][viewSplitCount];
    },
    previous(writingType, viewSplitCount) {
        return PreviousMap[this.NAME][writingType][viewSplitCount];
    },
};

const Rightmost: Origin = {
    NAME: "Rightmost",
    VALUE: MAX,
    isStart(writingType) {
        return IsStartMap[this.NAME][writingType];
    },
    isEnd(writingType) {
        return IsEndMap[this.NAME][writingType];
    },
    next(writingType, viewSplitCount) {
        return NextMap[this.NAME][writingType][viewSplitCount];
    },
    previous(writingType, viewSplitCount) {
        return PreviousMap[this.NAME][writingType][viewSplitCount];
    },
};

/* -------------------------------------------------------------------------- */

const IsStartMap: Record<string, Record<WritingType, boolean>> = {
    [Top.NAME]: { vertical: true, horizontal: true },
    [Up.NAME]: { vertical: false, horizontal: false },
    [VCenter.NAME]: { vertical: false, horizontal: false },
    [Down.NAME]: { vertical: false, horizontal: false },
    [Bottom.NAME]: { vertical: false, horizontal: false },
    [Leftmost.NAME]: { vertical: false, horizontal: true },
    [Left.NAME]: { vertical: false, horizontal: false },
    [HCenter.NAME]: { vertical: false, horizontal: false },
    [Right.NAME]: { vertical: false, horizontal: false },
    [Rightmost.NAME]: { vertical: true, horizontal: false },
} as const;

const IsEndMap: Record<string, Record<WritingType, boolean>> = {
    [Top.NAME]: { vertical: false, horizontal: false },
    [Up.NAME]: { vertical: false, horizontal: false },
    [VCenter.NAME]: { vertical: false, horizontal: false },
    [Down.NAME]: { vertical: false, horizontal: false },
    [Bottom.NAME]: { vertical: true, horizontal: true },
    [Leftmost.NAME]: { vertical: true, horizontal: false },
    [Left.NAME]: { vertical: false, horizontal: false },
    [HCenter.NAME]: { vertical: false, horizontal: false },
    [Right.NAME]: { vertical: false, horizontal: false },
    [Rightmost.NAME]: { vertical: false, horizontal: true },
} as const;

const NextMap: Record<
    string,
    Record<WritingType, Record<ViewSplitCount, Origin>>
> = {
    [Top.NAME]: {
        vertical: { four: Bottom, six: VCenter },
        horizontal: { four: Bottom, six: VCenter },
    },
    [Up.NAME]: {
        vertical: { four: Bottom, six: VCenter },
        horizontal: { four: Bottom, six: VCenter },
    },
    [VCenter.NAME]: {
        vertical: { four: Bottom, six: Bottom },
        horizontal: { four: Bottom, six: Bottom },
    },
    [Down.NAME]: {
        vertical: { four: Bottom, six: Bottom },
        horizontal: { four: Bottom, six: Bottom },
    },
    [Bottom.NAME]: {
        vertical: { four: Top, six: Top },
        horizontal: { four: Top, six: Top },
    },
    [Leftmost.NAME]: {
        vertical: { four: Rightmost, six: Rightmost },
        horizontal: { four: Rightmost, six: Rightmost },
    },
    [Left.NAME]: {
        vertical: { four: Leftmost, six: Leftmost },
        horizontal: { four: Rightmost, six: Rightmost },
    },
    [HCenter.NAME]: {
        vertical: { four: Leftmost, six: Leftmost },
        horizontal: { four: Rightmost, six: Rightmost },
    },
    [Right.NAME]: {
        vertical: { four: Leftmost, six: Leftmost },
        horizontal: { four: Rightmost, six: Rightmost },
    },
    [Rightmost.NAME]: {
        vertical: { four: Leftmost, six: Leftmost },
        horizontal: { four: Leftmost, six: Leftmost },
    },
} as const;

const PreviousMap: Record<
    string,
    Record<WritingType, Record<ViewSplitCount, Origin>>
> = {
    [Top.NAME]: {
        vertical: { four: Bottom, six: Bottom },
        horizontal: { four: Bottom, six: Bottom },
    },
    [Up.NAME]: {
        vertical: { four: Top, six: Top },
        horizontal: { four: Top, six: Top },
    },
    [VCenter.NAME]: {
        vertical: { four: Top, six: Top },
        horizontal: { four: Top, six: Top },
    },
    [Down.NAME]: {
        vertical: { four: Top, six: VCenter },
        horizontal: { four: Top, six: VCenter },
    },
    [Bottom.NAME]: {
        vertical: { four: Top, six: VCenter },
        horizontal: { four: Top, six: VCenter },
    },
    [Leftmost.NAME]: {
        vertical: { four: Rightmost, six: Rightmost },
        horizontal: { four: Rightmost, six: Rightmost },
    },
    [Left.NAME]: {
        vertical: { four: Rightmost, six: Rightmost },
        horizontal: { four: Leftmost, six: Leftmost },
    },
    [HCenter.NAME]: {
        vertical: { four: Rightmost, six: Rightmost },
        horizontal: { four: Leftmost, six: Leftmost },
    },
    [Right.NAME]: {
        vertical: { four: Rightmost, six: Rightmost },
        horizontal: { four: Leftmost, six: Leftmost },
    },
    [Rightmost.NAME]: {
        vertical: { four: Leftmost, six: Leftmost },
        horizontal: { four: Leftmost, six: Leftmost },
    },
} as const;
