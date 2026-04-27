type Size = Readonly<{
    width: number;
    height: number;
}>;

const MIN = 100;
const MAX = 1000;

export class ZoomManager {
    readonly scale: number;
    readonly bodySize: Size | undefined;
    readonly contentSize: Size | undefined;

    constructor(scale?: number, viewerSize?: Size, imageSize?: Size) {
        this.scale = scale ?? MIN;
        this.bodySize = viewerSize;
        this.contentSize = imageSize;
    }

    readonly setBodySize = (size: Size): ZoomManager => {
        return this.copyWith({ bodySize: size });
    };

    readonly setContentSize = (size: Size): ZoomManager => {
        return this.copyWith({ contentSize: size });
    };

    readonly zoomOut = (step: number): ZoomManager => {
        return this.copyWith({ scale: Math.max(this.scale - step, MIN) });
    };

    readonly zoomIn = (step: number): ZoomManager => {
        return this.copyWith({ scale: Math.min(this.scale + step, MAX) });
    };

    readonly reset = (): ZoomManager => {
        return this.copyWith({ scale: MIN });
    };

    private readonly copyWith = ({
        scale,
        bodySize,
        contentSize,
    }: Partial<{
        scale: number;
        bodySize: Size;
        contentSize: Size;
    }>): ZoomManager => {
        return new ZoomManager(
            scale ?? this.scale,
            bodySize ?? this.bodySize,
            contentSize ?? this.contentSize,
        );
    };
}
