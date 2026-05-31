import { useAtomValue } from "jotai";
import type { JSX } from "react";
import { AppStateAtom, Atom } from "../atoms";
import { LinearProgress } from "./common/LinearProgress";

export const Progress = (): JSX.Element => {
    const writingType = useAtomValue(AppStateAtom.writingType);
    const file = useAtomValue(Atom.fileManager);

    const className = {
        _: "opacity-50",
        scale: writingType === "vertical" ? "-scale-x-100" : undefined,
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
