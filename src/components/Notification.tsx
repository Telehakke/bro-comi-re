import { useAtom } from "jotai";
import { useEffect, useRef, type JSX } from "react";
import { Atom } from "../atoms";

export const Notification = (): JSX.Element => {
    const div = useRef<HTMLDivElement | null>(null);
    const timerId = useRef<number | undefined>(undefined);
    const [message, setMessage] = useAtom(Atom.messageManager);

    useEffect(() => {
        if (message.visibility === "visible") {
            window.clearInterval(timerId.current);
            timerId.current = window.setTimeout(() => {
                setMessage((m) => m.hidden());
            }, 1000);
        }

        const el = div.current;
        if (el == null) return;

        const handleAnimationEnd = (): void => {
            if (message.visibility === "hidden") {
                setMessage((m) => m.none());
            }
        };
        el.addEventListener("animationend", handleAnimationEnd);
        return (): void =>
            el.removeEventListener("animationend", handleAnimationEnd);
    }, [message, setMessage]);

    const className = {
        _: "w-max rounded-md px-2 py-1 tabular-nums",
        opacity: "data-[state=hidden]:opacity-0",
        position: "fixed top-4 left-1/2 -translate-x-1/2",
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
            ref={div}
            data-state={message.visibility}
        >
            {message.value}
        </div>
    );
};
