import { useAtomValue } from "jotai";
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";
import type { JSX } from "react";
import { Atom } from "../../../atoms";

export const ChevronLeft = (): JSX.Element => {
    const onChevronLeft = useAtomValue(Atom.onChevronLeft);

    if (!onChevronLeft) return <></>;
    return (
        <div className="fixed inset-y-0 left-4 grid place-items-center">
            <CircleChevronLeft className="size-15 stroke-green-500" />
        </div>
    );
};

export const ChevronRight = (): JSX.Element => {
    const onChevronRight = useAtomValue(Atom.onChevronRight);

    if (!onChevronRight) return <></>;
    return (
        <div className="fixed inset-y-0 right-4 grid place-items-center">
            <CircleChevronRight className="size-15 stroke-green-500" />
        </div>
    );
};
