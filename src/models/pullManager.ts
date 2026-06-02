const TRIGGER = 100;

export class PullManager {
    private count: number;

    constructor() {
        this.count = 0;
    }

    readonly add = (value: number): void => {
        this.count += value;
    };

    readonly reset = (): void => {
        this.count = 0;
    };

    readonly canLeftPull = (): boolean => {
        return this.count < -TRIGGER;
    };

    readonly canRightPull = (): boolean => {
        return this.count > TRIGGER;
    };
}
