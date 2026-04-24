import { useAtom } from "jotai";
import { useEffect, useRef, type JSX } from "react";
import { Atom } from "../atoms";

export const Notification = (): JSX.Element => {
    const divRef = useRef<HTMLDivElement | null>(null);
    const timerRef = useRef<number | undefined>(undefined);
    const [message, setMessage] = useAtom(Atom.messageManager);

    useEffect(() => {
        if (message.visibility === "visible") {
            window.clearInterval(timerRef.current);
            timerRef.current = window.setTimeout(() => {
                setMessage((m) => m.hidden());
            }, 1000);
        }

        const div = divRef.current;
        if (div == null) return;

        const handleAnimationEnd = (): void => {
            if (message.visibility === "hidden") {
                setMessage((m) => m.none());
            }
        };
        div.addEventListener("animationend", handleAnimationEnd);
        return (): void => {
            div.removeEventListener("animationend", handleAnimationEnd);
        };
    }, [message, setMessage]);

    const className = {
        _: "w-max rounded-md px-2 py-1 tabular-nums",
        opacity: "data-[state=hidden]:opacity-0",
        position: "fixed bottom-8 left-1/2 -translate-x-1/2",
        text: "text-neutral-100",
        bg: "bg-neutral-900",
        animation:
            "data-[state=visible]:animate-fade-in data-[state=hidden]:animate-fade-out",
    };

    if (message.value == null) return <></>;
    if (message.visibility == "none") return <></>;
    return (
        <div
            className={Object.values(className).join(" ")}
            ref={divRef}
            data-state={message.visibility}
        >
            {message.value}
        </div>
    );
};
