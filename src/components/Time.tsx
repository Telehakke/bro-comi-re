import { useEffect, useState, type JSX } from "react";

export const Time = (): JSX.Element => {
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
