const LENGTH = 10;
const INIT_VALUE = [...Array(LENGTH)].map(() => 0);

export class SmoothScroll {
    private value: { x: number[]; y: number[] };

    constructor() {
        this.value = { x: [...INIT_VALUE], y: [...INIT_VALUE] };
    }

    readonly add = (x: number, y: number): void => {
        this.value.x.shift();
        this.value.x.push(x);
        this.value.y.shift();
        this.value.y.push(y);
    };

    readonly averageX = (): number => {
        return this.value.x.reduce((acc, v) => acc + v, 0) / LENGTH;
    };

    readonly averageY = (): number => {
        return this.value.y.reduce((acc, v) => acc + v, 0) / LENGTH;
    };
}
