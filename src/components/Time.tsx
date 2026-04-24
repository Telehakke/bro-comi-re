import { useAtomValue } from "jotai";
import { useEffect, useState, type JSX } from "react";
import { Atom } from "../atoms";

export const Time = (): JSX.Element => {
    const shouldShowInfo = useAtomValue(Atom.shouldShowInfo);

    const className = {
        _: "data-[visible=false]:opacity-0",
        fadeInOut:
            "data-[visible=true]:animate-fade-in data-[visible=false]:animate-fade-out",
    };

    return (
        <div
            className={Object.values(className).join(" ")}
            data-visible={shouldShowInfo}
        >
            <Text />
        </div>
    );
};

const Text = (): JSX.Element => {
    const [text, setText] = useState("");

    useEffect(() => {
        const routine = (): void => {
            const now = new Date();
            setText(formattedTime(now));
            window.setTimeout(routine, timeout(now));
        };
        routine();
    }, []);

    const className = {
        _: "tabular-nums opacity-50 select-none",
        position: "fixed top-4 right-4",
    };

    return (
        <div className={Object.values(className).join(" ")}>
            <p className="text-black" style={{ WebkitTextStroke: "2px #000" }}>
                {text}
            </p>
            <p className="absolute inset-0 text-white">{text}</p>
        </div>
    );
};

const formattedTime = (date: Date): string => {
    const hour = zeroPadding(date.getHours());
    const minute = zeroPadding(date.getMinutes());
    return `${hour}:${minute}`;
};

const zeroPadding = (value: number): string => {
    return value.toString().padStart(2, "0");
};

const timeout = (date: Date): number => {
    return 60000 - date.getSeconds() * 1000 - date.getMilliseconds();
};
