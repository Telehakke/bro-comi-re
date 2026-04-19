import type { History } from "./appState";

export class HistoryManager {
    readonly histories: readonly History[];

    constructor(histories?: readonly History[]) {
        this.histories = histories ?? [];
    }

    readonly getIndex = (name: string): number | undefined => {
        return this.histories.find((h) => h.name === name)?.index;
    };

    readonly add = (name: string): HistoryManager => {
        const history: History = { name, index: 0 };
        const newHistories = [history, ...this.histories];
        if (newHistories.length > 100) {
            return new HistoryManager(newHistories.slice(0, 99));
        }
        return new HistoryManager(newHistories);
    };

    readonly update = (history: History): HistoryManager => {
        const result = this.histories.map((h) =>
            h.name === history.name ? history : h,
        );
        return new HistoryManager(result);
    };

    readonly moveToHead = (name: string): HistoryManager => {
        const index = this.histories.findIndex((h) => h.name === name);
        if (index <= 0) return this;

        const array = [...this.histories];
        const [element] = array.splice(index, 1);
        array.unshift(element);
        return new HistoryManager(array);
    };
}
