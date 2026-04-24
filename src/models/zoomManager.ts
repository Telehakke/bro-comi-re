type Size = Readonly<{
    width: number;
    height: number;
}>;

const MIN = 100;
const MAX = 1000;

export class ZoomManager {
    readonly scale: number;
    readonly viewerSize: Size | undefined;
    readonly imageSize: Size | undefined;

    constructor(scale?: number, viewerSize?: Size, imageSize?: Size) {
        this.scale = scale ?? MIN;
        this.viewerSize = viewerSize;
        this.imageSize = imageSize;
    }

    readonly setViewerSize = (size: Size): ZoomManager => {
        return this.copyWith({ viewerSize: size });
    };

    readonly setImageSize = (size: Size): ZoomManager => {
        return this.copyWith({ imageSize: size });
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
        viewerSize,
        imageSize,
    }: Partial<{
        scale: number;
        viewerSize: Size;
        imageSize: Size;
    }>): ZoomManager => {
        return new ZoomManager(
            scale ?? this.scale,
            viewerSize ?? this.viewerSize,
            imageSize ?? this.imageSize,
        );
    };
}
