import { useAtomValue } from "jotai";
import { useEffect, useState, type JSX } from "react";
import { Atom } from "../atoms";

export const Time = (): JSX.Element => {
    const shouldShowInfo = useAtomValue(Atom.shouldShowInfo);
    const [text, setText] = useState("");

    useEffect(() => {
        const routine = (): void => {
            const now = new Date();
            const hour = zeroPadding(now.getHours());
            const minute = zeroPadding(now.getMinutes());
            setText(`${hour}:${minute}`);
            const delay =
                60000 - now.getSeconds() * 1000 - now.getMilliseconds();
            setTimeout(routine, delay);
        };
        routine();
    }, []);

    return (
        <div
            className="data-[visible=true]:animate-fade-in data-[visible=false]:animate-fade-out data-[visible=false]:opacity-0"
            data-visible={shouldShowInfo}
        >
            <div className="fixed top-4 right-4 tabular-nums opacity-50 select-none">
                <p
                    className="text-black select-none"
                    style={{ WebkitTextStroke: "2px #000" }}
                >
                    {text}
                </p>
                <p className="absolute inset-0 text-white">{text}</p>
            </div>
        </div>
    );
};

const zeroPadding = (value: number): string => {
    return value.toString().padStart(2, "0");
};
