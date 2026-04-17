import { useAtom } from "jotai";
import { useEffect, useRef, type JSX } from "react";
import { Atom } from "../atoms";

export const Notification = (): JSX.Element => {
    const divRef = useRef<HTMLDivElement | null>(null);
    const timerRef = useRef<number | undefined>(undefined);
    const [messageManager, setMessageManager] = useAtom(Atom.messageManager);

    useEffect(() => {
        if (messageManager.visibility == "visible") {
            window.clearInterval(timerRef.current);
            timerRef.current = window.setTimeout(() => {
                setMessageManager((m) => m.hidden());
            }, 1000);
        }

        const div = divRef.current;
        if (div == null) return;

        const handleAnimationend = (): void => {
            if (messageManager.visibility !== "hidden") return;
            setMessageManager((m) => m.none());
        };
        div.addEventListener("animationend", handleAnimationend);
        return (): void => {
            div.removeEventListener("animationend", handleAnimationend);
        };
    }, [messageManager, setMessageManager]);

    const className = {
        _: "fixed bottom-8 inset-x-0 w-max rounded-md px-2 py-1 tabular-nums data-[state=hidden]:opacity-0",
        position: "absolute bottom-4 left-1/2 z-11 -translate-x-1/2",
        text: "text-neutral-100",
        bg: "bg-neutral-900",
        animation:
            "data-[state=visible]:animate-fade-in data-[state=hidden]:animate-fade-out",
    };

    if (messageManager.value == null) return <></>;
    if (messageManager.visibility == "none") return <></>;
    return (
        <div
            className={Object.values(className).join(" ")}
            ref={divRef}
            data-state={messageManager.visibility}
        >
            {messageManager.value}
        </div>
    );
};
