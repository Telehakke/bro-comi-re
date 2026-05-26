const MIN = 100;
const MAX = 1000;

export class ZoomManager {
    readonly scale: number;

    constructor(scale?: number) {
        this.scale = scale ?? MIN;
    }

    readonly zoomOut = (step: number): ZoomManager => {
        return new ZoomManager(Math.max(this.scale - step, MIN));
    };

    readonly zoomIn = (step: number): ZoomManager => {
        return new ZoomManager(Math.min(this.scale + step, MAX));
    };

    readonly reset = (): ZoomManager => {
        return new ZoomManager(MIN);
    };
}
