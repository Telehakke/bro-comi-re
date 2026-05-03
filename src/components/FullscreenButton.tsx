import { useAtomValue, useSetAtom } from "jotai";
import { Fullscreen, Minimize } from "lucide-react";
import type { JSX, ReactNode } from "react";
import { AppStateAtom, Atom } from "../atoms";

export const FullscreenButton = (): JSX.Element => {
    const shouldShowFullscreenButton = useAtomValue(
        AppStateAtom.shouldShowFullscreenButton,
    );
    const shouldShowInfo = useAtomValue(Atom.shouldShowInfo);

    const className = {
        _: "data-[visible=false]:opacity-0",
        fadeInOut:
            "data-[visible=true]:animate-fade-in data-[visible=false]:animate-fade-out",
    };

    if (!shouldShowFullscreenButton) return <></>;
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
    const setOnFullscreen = useSetAtom(Atom.onFullscreen);

    const className = {
        _: "group rounded-full transition select-none",
        outline: "outline-blue-500/75 focus-visible:outline-2",
    };

    return (
        <button
            className={Object.values(className).join(" ")}
            onClick={() => {
                setOnFullscreen((v) => {
                    // iOSではrequestFullscreen()が用意されていないため、
                    // 常にfalseを返す
                    if (!document.documentElement.requestFullscreen)
                        return false;
                    if (v) {
                        document.exitFullscreen();
                    } else {
                        document.documentElement.requestFullscreen();
                    }
                    return !v;
                });
            }}
        >
            {props.children}
        </button>
    );
};

const Icon = (): JSX.Element => {
    const onFullscreen = useAtomValue(Atom.onFullscreen);

    const className = {
        _: "size-10 p-2 rounded-full opacity-50 transition",
        bg: "bg-neutral-500",
        hoverBg: "group-hover:bg-neutral-600",
        activeBg: " group-active:bg-neutral-700",
        border: "border border-neutral-200",
        stroke: "stroke-white",
    };

    if (onFullscreen) {
        return <Minimize className={Object.values(className).join(" ")} />;
    } else {
        return <Fullscreen className={Object.values(className).join(" ")} />;
    }
};
