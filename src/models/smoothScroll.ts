type SmoothScroll = Readonly<{
    values: { x: number[]; y: number[] };
    add: (x: number, y: number) => void;
    averageX: () => number;
    averageY: () => number;
}>;

export const SmoothScroll: SmoothScroll = {
    values: { x: [...Array(5)].map(() => 0), y: [...Array(5)].map(() => 0) },
    add(x, y) {
        this.values.x.shift();
        this.values.x.push(x);
        this.values.y.shift();
        this.values.y.push(y);
    },
    averageX() {
        return (
            this.values.x.reduce((acc, v) => acc + v, 0) / this.values.x.length
        );
    },
    averageY() {
        return (
            this.values.y.reduce((acc, v) => acc + v, 0) / this.values.y.length
        );
    },
};
