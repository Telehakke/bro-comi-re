import type { Visibility } from "./types";

export type messageManager = Readonly<{
    value: string | undefined;
    visibility: Visibility;
    setMessage: (value: string | undefined) => messageManager;
    hidden: () => messageManager;
    none: () => messageManager;
}>;

export const messageManager: messageManager = {
    value: undefined,
    visibility: "none",
    setMessage(value) {
        return { ...this, value, visibility: "visible" };
    },
    hidden() {
        return { ...this, visibility: "hidden" };
    },
    none() {
        return { ...this, visibility: "none" };
    },
};
