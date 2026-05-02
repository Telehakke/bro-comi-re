import { useAtomValue } from "jotai";
import type { JSX } from "react";
import { AppStateAtom, Atom } from "../atoms";
import { LinearProgress } from "./common/LinearProgress";

export const Progress = (): JSX.Element => {
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
            <Part />
        </div>
    );
};

export const Part = (): JSX.Element => {
    const writingType = useAtomValue(AppStateAtom.writingType);
    const file = useAtomValue(Atom.fileManager);

    const className = {
        _: "opacity-50",
        scale: writingType === "vertical" && "-scale-x-100",
    };

    return (
        <LinearProgress
            className={Object.values(className).join(" ")}
            min={0}
            max={file.length - 1}
            value={file.index}
        />
    );
};
