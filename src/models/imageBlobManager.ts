export type BlobData = Readonly<{
    id: number | undefined;
    blob: Blob | undefined;
}>;

export class ImageBlobManager {
    private prevLeft: BlobData;
    private prevRight: BlobData;
    readonly currentLeft: BlobData;
    readonly currentRight: BlobData;
    private nextLeft: BlobData;
    private nextRight: BlobData;

    private constructor(
        prevLeft?: BlobData,
        prevRight?: BlobData,
        currentLeft?: BlobData,
        currentRight?: BlobData,
        nextLeft?: BlobData,
        nextRight?: BlobData,
    ) {
        this.prevLeft = prevLeft ?? { id: undefined, blob: undefined };
        this.prevRight = prevRight ?? { id: undefined, blob: undefined };
        this.currentLeft = currentLeft ?? { id: undefined, blob: undefined };
        this.currentRight = currentRight ?? { id: undefined, blob: undefined };
        this.nextLeft = nextLeft ?? { id: undefined, blob: undefined };
        this.nextRight = nextRight ?? { id: undefined, blob: undefined };
    }

    static readonly forCurrent = (
        left?: BlobData,
        right?: BlobData,
    ): ImageBlobManager => {
        return new ImageBlobManager(
            undefined,
            undefined,
            left,
            right,
            undefined,
            undefined,
        );
    };

    readonly setCurrent = (
        left?: BlobData,
        right?: BlobData,
    ): ImageBlobManager => {
        return new ImageBlobManager(
            this.prevLeft,
            this.prevRight,
            left,
            right,
            this.nextLeft,
            this.nextRight,
        );
    };

    readonly getCurrentLeftBlobWithId = (id?: number): Blob | undefined => {
        return this.currentLeft.id === id ? this.currentLeft.blob : undefined;
    };

    readonly getCurrentRightBlobWithId = (id?: number): Blob | undefined => {
        return this.currentRight.id === id ? this.currentRight.blob : undefined;
    };

    readonly setPrevLeft = (id?: number, blob?: Blob): void => {
        this.prevLeft = { id: id, blob: blob };
    };

    readonly setPrevRight = (id?: number, blob?: Blob): void => {
        this.prevRight = { id: id, blob: blob };
    };

    readonly setNextLeft = (id?: number, blob?: Blob): void => {
        this.nextLeft = { id: id, blob: blob };
    };

    readonly setNextRight = (id?: number, blob?: Blob): void => {
        this.nextRight = { id: id, blob: blob };
    };

    /** 次へBlobDataを移すことで、prevを解放する */
    readonly shiftToNext = (): ImageBlobManager => {
        return new ImageBlobManager(
            undefined,
            undefined,
            this.prevLeft,
            this.prevRight,
            this.currentLeft,
            this.currentRight,
        );
    };

    /** 前へBlobDataを移すことで、nextを解放する */
    readonly shiftToPrev = (): ImageBlobManager => {
        return new ImageBlobManager(
            this.currentLeft,
            this.currentRight,
            this.nextLeft,
            this.nextRight,
            undefined,
            undefined,
        );
    };
}
