export class SmoothScroll {
    private readonly max = 1;
    private readonly increaseValue = 0.1;
    private weighting = 0;

    readonly position = (x: number, y: number): [number, number] => {
        if (this.weighting >= this.max) {
            return [x, y];
        }
        this.weighting += this.increaseValue;
        return [x * this.weighting, y * this.weighting];
    };
}
