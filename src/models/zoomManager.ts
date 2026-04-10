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

    setViewerSize = (size: Size): ZoomManager => {
        return this.copyWith({ viewerSize: size });
    };

    setImageSize = (size: Size): ZoomManager => {
        return this.copyWith({ imageSize: size });
    };

    zoomOut = (step: number): ZoomManager => {
        return this.copyWith({ scale: Math.max(this.scale - step, MIN) });
    };

    zoomIn = (step: number): ZoomManager => {
        return this.copyWith({ scale: Math.min(this.scale + step, MAX) });
    };

    reset = (): ZoomManager => {
        return this.copyWith({ scale: MIN });
    };

    isHorizontalFit = (): boolean => {
        if (this.viewerSize == null || this.imageSize == null) return true;

        const viewerRatio = this.viewerSize.width / this.viewerSize.height;
        const imageRatio = this.imageSize.width / this.imageSize.height;
        return viewerRatio <= imageRatio;
    };

    private copyWith = ({
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
