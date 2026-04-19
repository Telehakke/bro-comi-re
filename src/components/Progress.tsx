import { useAtomValue } from "jotai";
import type { JSX } from "react";
import { Atom } from "../atoms";
import { LinearProgress } from "./common/LinearProgress";

export const Progress = (): JSX.Element => {
    const { writingType } = useAtomValue(Atom.appStore);
    const fm = useAtomValue(Atom.fileManager);
    const shouldShowInfo = useAtomValue(Atom.shouldShowInfo);

    return (
        <div
            className="data-[visible=true]:animate-fade-in data-[visible=false]:animate-fade-out data-[visible=false]:opacity-0"
            data-visible={shouldShowInfo}
        >
            <LinearProgress
                className={`fixed inset-x-0 bottom-0 opacity-50 ${writingType === "vertical" && "-scale-x-100"}`}
                min={0}
                max={fm.files.length - 1}
                value={fm.index}
            />
        </div>
    );
};
