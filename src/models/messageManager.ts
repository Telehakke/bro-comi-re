import type { Visibility } from "./types";

export class MessageManager {
    readonly value: string | undefined;
    readonly visibility: Visibility;

    constructor(value: string | undefined, visibility: Visibility) {
        this.value = value;
        this.visibility = visibility;
    }

    static readonly create = (): MessageManager => {
        return new MessageManager(undefined, "none");
    };

    readonly setMessage = (value?: string): MessageManager => {
        return new MessageManager(value, "visible");
    };

    readonly hidden = (): MessageManager => {
        return new MessageManager(this.value, "hidden");
    };

    readonly none = (): MessageManager => {
        return new MessageManager(this.value, "none");
    };
}
