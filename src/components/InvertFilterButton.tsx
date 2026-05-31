import { useAtomValue, useSetAtom } from "jotai";
import { Droplet, DropletOff } from "lucide-react";
import type { JSX, ReactNode } from "react";
import { AppStateAtom, Atom } from "../atoms";

export const InvertFilterButton = (): JSX.Element => {
    const shouldShowInvertButton = useAtomValue(
        AppStateAtom.shouldShowInvertButton,
    );

    if (!shouldShowInvertButton) return <></>;
    return (
        <Button>
            <Icon />
        </Button>
    );
};

const Button = (props: { children: ReactNode }): JSX.Element => {
    const setOnInvertFilter = useSetAtom(Atom.onInvertFilter);

    const className = {
        _: "group rounded-full transition select-none",
        outline: "outline-blue-500/75 focus-visible:outline-2",
    };

    return (
        <button
            className={Object.values(className).join(" ")}
            onClick={() => {
                setOnInvertFilter((v) => !v);
            }}
        >
            {props.children}
        </button>
    );
};

const Icon = (): JSX.Element => {
    const onInvertFilter = useAtomValue(Atom.onInvertFilter);

    const className = {
        _: "size-10 p-2 rounded-full opacity-50 transition",
        bg: "bg-neutral-500",
        hoverBg: "group-hover:bg-neutral-600",
        activeBg: " group-active:bg-neutral-700",
        border: "border border-neutral-200",
        stroke: "stroke-white",
    };

    if (onInvertFilter) {
        return <DropletOff className={Object.values(className).join(" ")} />;
    } else {
        return <Droplet className={Object.values(className).join(" ")} />;
    }
};
