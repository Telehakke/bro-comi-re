import { useAtomValue, useSetAtom } from "jotai";
import { Droplet, DropletOff } from "lucide-react";
import type React from "react";
import type { JSX, ReactNode } from "react";
import { AppStateAtom, Atom } from "../atoms";
import type { ViewerBody, ViewerContent } from "../models/types";
import { Viewer } from "../models/viewer";

export const InvertFilterButton = (props: {
    body: React.RefObject<ViewerBody>;
    content: React.RefObject<ViewerContent>;
}): JSX.Element => {
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
            <Button {...props}>
                <Icon />
            </Button>
        </div>
    );
};

const Button = (props: {
    body: React.RefObject<ViewerBody>;
    content: React.RefObject<ViewerContent>;
    children: ReactNode;
}): JSX.Element => {
    const setOnInvertFilter = useSetAtom(Atom.onInvertFilter);
    const setScrollManager = useSetAtom(Atom.scrollManager);

    const className = {
        _: "group rounded-full transition select-none",
        outline: "outline-blue-500/75 focus-visible:outline-2",
    };

    return (
        <button
            className={Object.values(className).join(" ")}
            onClick={() => {
                setOnInvertFilter((v) => !v);
                setScrollManager((s) =>
                    s.update(
                        Viewer.create(
                            props.body.current,
                            props.content.current,
                        ),
                    ),
                );
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
        return <Droplet className={Object.values(className).join(" ")} />;
    } else {
        return <DropletOff className={Object.values(className).join(" ")} />;
    }
};
