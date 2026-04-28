import { useAtomValue, useSetAtom } from "jotai";
import { Droplet, DropletOff } from "lucide-react";
import type { JSX, ReactNode } from "react";
import { AppStateAtom, Atom } from "../atoms";

export const InvertFilterButton = (): JSX.Element => {
    const shouldShowInvertButton = useAtomValue(
        AppStateAtom.shouldShowInvertButton,
    );
    const shouldShowInfo = useAtomValue(Atom.shouldShowInfo);

    const className = {
        _: "data-[visible=false]:opacity-0",
        fadeInOut:
            "data-[visible=true]:animate-fade-in data-[visible=false]:animate-fade-out",
    };

    if (!shouldShowInvertButton) return <></>;
    return (
        <div
            className={Object.values(className).join(" ")}
            data-visible={shouldShowInfo}
        >
            <Button>
                <Icon />
            </Button>
        </div>
    );
};

const Button = (props: { children: ReactNode }): JSX.Element => {
    const setOnInvertFilter = useSetAtom(Atom.onInvertFilter);

    const className = {
        _: "group rounded-full transition select-none",
        position: "fixed top-4 left-18",
        outline: "outline-blue-500/75 focus-visible:outline-2",
    };

    return (
        <button
            className={Object.values(className).join(" ")}
            onClick={() => setOnInvertFilter((v) => !v)}
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
        return <Droplet className={Object.values(className).join(" ")} />;
    } else {
        return <DropletOff className={Object.values(className).join(" ")} />;
    }
};
