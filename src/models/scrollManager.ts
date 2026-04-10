import type {
    MovementDirection,
    ViewSplitCount,
    WritingType,
} from "./appState";

const MIN = 0;
const CENTER = 50;
const MAX = 100;

export class ScrollManager {
    readonly horizontalPercentage: number | undefined;
    readonly verticalPercentage: number | undefined;

    constructor(horizontalPercentage?: number, verticalPercentage?: number) {
        this.horizontalPercentage =
            horizontalPercentage == null
                ? undefined
                : Math.max(Math.min(horizontalPercentage, MAX), MIN);
        this.verticalPercentage =
            verticalPercentage == null
                ? undefined
                : Math.max(Math.min(verticalPercentage, MAX), MIN);
    }

    static readonly create = (
        viewer: HTMLElement,
        image: HTMLImageElement,
    ): ScrollManager => {
        const diffW = image.clientWidth - viewer.clientWidth;
        const diffH = image.clientHeight - viewer.clientHeight;
        return new ScrollManager(
            diffW > 0
                ? (Math.ceil(viewer.scrollLeft) / diffW) * 100
                : undefined,
            diffH > 0 ? (Math.ceil(viewer.scrollTop) / diffH) * 100 : undefined,
        );
    };

    readonly isHorizontalMin = (): boolean => {
        if (this.horizontalPercentage == null) return true;
        return this.horizontalPercentage === MIN;
    };

    readonly isHorizontalMax = (): boolean => {
        if (this.horizontalPercentage == null) return true;
        return this.horizontalPercentage === MAX;
    };

    readonly applyScroll = (
        viewer: HTMLElement,
        image: HTMLImageElement,
    ): void => {
        const x =
            ((image.clientWidth - viewer.clientWidth) *
                (this.horizontalPercentage ?? 0)) /
            100;
        const y =
            ((image.clientHeight - viewer.clientHeight) *
                (this.verticalPercentage ?? 0)) /
            100;
        viewer.scroll(x, y);
    };

    readonly next = (
        movementDirection: MovementDirection,
        writingType: WritingType,
        viewSplitCount: ViewSplitCount,
    ): ScrollManager => {
        const vOrigin = this.getVerticalOrigin();
        const hOrigin = this.getHorizontalOrigin();
        let x: number | undefined = this.horizontalPercentage;
        let y: number | undefined = this.verticalPercentage;
        switch (movementDirection) {
            case "vertical":
                y = vOrigin.next(writingType, viewSplitCount).VALUE;
                if (vOrigin.isEnd(writingType)) {
                    x = hOrigin.next(writingType, viewSplitCount).VALUE;
                }
                break;
            case "horizontal":
                x = hOrigin.next(writingType, viewSplitCount).VALUE;
                if (hOrigin.isEnd(writingType)) {
                    y = vOrigin.next(writingType, viewSplitCount).VALUE;
                }
                break;
        }
        return new ScrollManager(x, y);
    };

    readonly previous = (
        movementDirection: MovementDirection,
        writingType: WritingType,
        viewSplitCount: ViewSplitCount,
    ): ScrollManager => {
        const vOrigin = this.getVerticalOrigin();
        const hOrigin = this.getHorizontalOrigin();
        let x: number | undefined = this.horizontalPercentage;
        let y: number | undefined = this.verticalPercentage;
        switch (movementDirection) {
            case "vertical":
                y = vOrigin.previous(writingType, viewSplitCount).VALUE;
                if (vOrigin.isStart(writingType)) {
                    x = hOrigin.previous(writingType, viewSplitCount).VALUE;
                }
                break;
            case "horizontal":
                x = hOrigin.previous(writingType, viewSplitCount).VALUE;
                if (hOrigin.isStart(writingType)) {
                    y = vOrigin.previous(writingType, viewSplitCount).VALUE;
                }
                break;
        }
        return new ScrollManager(x, y);
    };

    readonly shouldMoveToNextPage = (writingType: WritingType): boolean => {
        const vOrigin = this.getVerticalOrigin();
        const hOrigin = this.getHorizontalOrigin();
        return vOrigin.isEnd(writingType) && hOrigin.isEnd(writingType);
    };

    readonly shouldMoveToPreviousPage = (writingType: WritingType): boolean => {
        const vOrigin = this.getVerticalOrigin();
        const hOrigin = this.getHorizontalOrigin();
        return vOrigin.isStart(writingType) && hOrigin.isStart(writingType);
    };

    private readonly getVerticalOrigin = (): Origin => {
        if (this.verticalPercentage == null) return VFit;

        const h = Math.round(this.verticalPercentage);
        if (h === MIN) return Top;
        if (MIN < h && h < CENTER) return Up;
        if (h === CENTER) return VCenter;
        if (CENTER < h && h < MAX) return Down;
        return Bottom;
    };

    private readonly getHorizontalOrigin = (): Origin => {
        if (this.horizontalPercentage == null) return HFit;

        const w = Math.round(this.horizontalPercentage);
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

const VFit: Origin = {
    NAME: "vFit",
    VALUE: undefined,
    isStart() {
        return true;
    },
    isEnd() {
        return true;
    },
    next() {
        return this;
    },
    previous() {
        return this;
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

const HFit: Origin = {
    NAME: "hFit",
    VALUE: undefined,
    isStart() {
        return true;
    },
    isEnd() {
        return true;
    },
    next() {
        return this;
    },
    previous() {
        return this;
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
        vertical: { four: Bottom, six: VCenter, nine: VCenter },
        horizontal: { four: Bottom, six: VCenter, nine: VCenter },
    },
    [Up.NAME]: {
        vertical: { four: Bottom, six: VCenter, nine: VCenter },
        horizontal: { four: Bottom, six: VCenter, nine: VCenter },
    },
    [VCenter.NAME]: {
        vertical: { four: Bottom, six: Bottom, nine: Bottom },
        horizontal: { four: Bottom, six: Bottom, nine: Bottom },
    },
    [Down.NAME]: {
        vertical: { four: Bottom, six: Bottom, nine: Bottom },
        horizontal: { four: Bottom, six: Bottom, nine: Bottom },
    },
    [Bottom.NAME]: {
        vertical: { four: Top, six: Top, nine: Top },
        horizontal: { four: Top, six: Top, nine: Top },
    },
    [Leftmost.NAME]: {
        vertical: { four: Rightmost, six: Rightmost, nine: Rightmost },
        horizontal: { four: Rightmost, six: Rightmost, nine: HCenter },
    },
    [Left.NAME]: {
        vertical: { four: Leftmost, six: Leftmost, nine: Leftmost },
        horizontal: { four: Rightmost, six: Rightmost, nine: HCenter },
    },
    [HCenter.NAME]: {
        vertical: { four: Leftmost, six: Leftmost, nine: Leftmost },
        horizontal: { four: Rightmost, six: Rightmost, nine: Rightmost },
    },
    [Right.NAME]: {
        vertical: { four: Leftmost, six: Leftmost, nine: HCenter },
        horizontal: { four: Rightmost, six: Rightmost, nine: Rightmost },
    },
    [Rightmost.NAME]: {
        vertical: { four: Leftmost, six: Leftmost, nine: HCenter },
        horizontal: { four: Leftmost, six: Leftmost, nine: Leftmost },
    },
} as const;

const PreviousMap: Record<
    string,
    Record<WritingType, Record<ViewSplitCount, Origin>>
> = {
    [Top.NAME]: {
        vertical: { four: Bottom, six: Bottom, nine: Bottom },
        horizontal: { four: Bottom, six: Bottom, nine: Bottom },
    },
    [Up.NAME]: {
        vertical: { four: Top, six: Top, nine: Top },
        horizontal: { four: Top, six: Top, nine: Top },
    },
    [VCenter.NAME]: {
        vertical: { four: Top, six: Top, nine: Top },
        horizontal: { four: Top, six: Top, nine: Top },
    },
    [Down.NAME]: {
        vertical: { four: Top, six: VCenter, nine: VCenter },
        horizontal: { four: Top, six: VCenter, nine: VCenter },
    },
    [Bottom.NAME]: {
        vertical: { four: Top, six: VCenter, nine: VCenter },
        horizontal: { four: Top, six: VCenter, nine: VCenter },
    },
    [Leftmost.NAME]: {
        vertical: { four: Rightmost, six: Rightmost, nine: HCenter },
        horizontal: { four: Rightmost, six: Rightmost, nine: Rightmost },
    },
    [Left.NAME]: {
        vertical: { four: Rightmost, six: Rightmost, nine: HCenter },
        horizontal: { four: Leftmost, six: Leftmost, nine: Leftmost },
    },
    [HCenter.NAME]: {
        vertical: { four: Rightmost, six: Rightmost, nine: Rightmost },
        horizontal: { four: Leftmost, six: Leftmost, nine: Leftmost },
    },
    [Right.NAME]: {
        vertical: { four: Rightmost, six: Rightmost, nine: Rightmost },
        horizontal: { four: Leftmost, six: Leftmost, nine: HCenter },
    },
    [Rightmost.NAME]: {
        vertical: { four: Leftmost, six: Leftmost, nine: Leftmost },
        horizontal: { four: Leftmost, six: Leftmost, nine: HCenter },
    },
} as const;
