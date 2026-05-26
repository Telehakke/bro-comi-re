export type ViewerBody = HTMLDivElement | null;
export type ViewerCanvas = HTMLCanvasElement | null;

export class ViewerManager {
    readonly body: ViewerBody;
    readonly canvas: ViewerCanvas;

    constructor(body: ViewerBody, canvas: ViewerCanvas) {
        this.body = body;
        this.canvas = canvas;
    }

    readonly setBody = (body: ViewerBody): ViewerManager => {
        return new ViewerManager(body, this.canvas);
    };

    readonly setCanvas = (canvas: ViewerCanvas): ViewerManager => {
        return new ViewerManager(this.body, canvas);
    };

    /** ビューアー内の水平方向の空間の合計 */
    readonly spaceWidth = (): number => {
        if (this.body == null || this.canvas == null) return 0;
        return this.canvas.clientWidth - this.body.clientWidth;
    };

    /** ビューアー内の垂直方向の空間の合計 */
    readonly spaceHeight = (): number => {
        if (this.body == null || this.canvas == null) return 0;
        return this.canvas.clientHeight - this.body.clientHeight;
    };

    /**
     *  ビューアーの水平方向のスクロール位置をパーセンテージで返す\
     *  水平方向にスクロールできない場合、undefinedを返す
     */
    readonly positionX = (): number | undefined => {
        if (this.body == null) return undefined;
        const w = this.spaceWidth();
        return w > 0 ? (Math.ceil(this.body.scrollLeft) / w) * 100 : undefined;
    };

    /**
     *  ビューアーの垂直方向のスクロール位置をパーセンテージで返す\
     *  垂直方向にスクロールできない場合、undefinedを返す
     */
    readonly positionY = (): number | undefined => {
        if (this.body == null) return undefined;
        const h = this.spaceHeight();
        return h > 0 ? (Math.ceil(this.body.scrollTop) / h) * 100 : undefined;
    };

    /** 水平方向のスクロール限界に達しているかどうか */
    readonly isReachedLimitX = (): boolean => {
        const x = this.positionX() ?? 0;
        return x <= 0 || x >= 100;
    };

    /** ビューアー縦横比よりもキャンバスの方が横に長いかどうか */
    isCanvasWiderThanViewer = (): boolean | undefined => {
        if (this.body == null || this.canvas == null) return undefined;
        if (this.body.clientHeight === 0) return undefined;
        if (this.canvas.height === 0) return undefined;

        const bodyRatio = this.body.clientWidth / this.body.clientHeight;
        const canvasRatio = this.canvas.width / this.canvas.height;
        return bodyRatio <= canvasRatio;
    };

    /** ビューアーをスクロール */
    readonly scroll = (x: number, y: number): void => {
        this.body?.scroll(x, y);
    };
}
