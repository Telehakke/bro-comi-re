import type { History } from "./appState";

export class HistoryManager {
    readonly histories: readonly History[];

    constructor(histories?: readonly History[]) {
        this.histories = histories ?? [];
    }

    readonly getIndex = (name: string): number | undefined => {
        return this.histories.find((h) => h.name === name)?.index;
    };

    readonly addHistory = (history: History): HistoryManager => {
        return new HistoryManager([...this.histories, history]);
    };

    readonly update = (history: History): HistoryManager => {
        const result = this.histories.map((h) =>
            h.name === history.name ? history : h,
        );
        return new HistoryManager(result);
    };
}
