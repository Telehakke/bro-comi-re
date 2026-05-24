import { useAtomValue } from "jotai";
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";
import type { JSX } from "react";
import { Atom } from "../atoms";

export const ChevronLeft = (): JSX.Element => {
    const onChevron = useAtomValue(Atom.onChevron);

    if (onChevron != "left") return <></>;
    return (
        <div className="grid h-full place-items-center">
            <CircleChevronLeft className="size-15 stroke-green-500" />
        </div>
    );
};

export const ChevronRight = (): JSX.Element => {
    const onChevron = useAtomValue(Atom.onChevron);

    if (onChevron != "right") return <></>;
    return (
        <div className="grid h-full place-items-center">
            <CircleChevronRight className="size-15 stroke-green-500" />
        </div>
    );
};
