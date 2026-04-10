import { useAtomValue } from "jotai";
import { type JSX } from "react";
import { Atom } from "../atoms";

export const Toast = (): JSX.Element => {
    const toastMessage = useAtomValue(Atom.toastMessage);

    const className = {
        _: "fixed bottom-8 inset-x-0 w-max rounded-md px-2 py-1 tabular-nums data-[state=hidden]:opacity-0",
        position: "absolute bottom-4 left-1/2 z-11 -translate-x-1/2",
        text: "text-neutral-100",
        bg: "bg-neutral-900",
        animation:
            "data-[state=visible]:animate-fade-in data-[state=hidden]:animate-fade-out",
    };

    if (toastMessage.text.length === 0) return <></>;
    return (
        <p
            className={Object.values(className).join(" ")}
            style={{ fontSize: "16px" }}
            data-state={toastMessage.state}
        >
            {toastMessage.text}
        </p>
    );
};
