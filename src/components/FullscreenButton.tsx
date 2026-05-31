import { useAtomValue, useSetAtom } from "jotai";
import { Fullscreen, Minimize } from "lucide-react";
import { useEffect, type JSX, type ReactNode } from "react";
import { AppStateAtom, Atom } from "../atoms";

export const FullscreenButton = (): JSX.Element => {
    const shouldShowFullscreenButton = useAtomValue(
        AppStateAtom.shouldShowFullscreenButton,
    );

    if (!shouldShowFullscreenButton) return <></>;
    return (
        <Button>
            <Icon />
        </Button>
    );
};

const Button = (props: { children: ReactNode }): JSX.Element => {
    const setOnFullscreen = useSetAtom(Atom.onFullscreen);

    useEffect(() => {
        const handleFullscreenChange = (): void => {
            setOnFullscreen(document.fullscreenElement != null);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return (): void =>
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange,
            );
    }, [setOnFullscreen]);

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
                        document.exitFullscreen().catch(() => {});
                    } else {
                        document.documentElement
                            .requestFullscreen()
                            .catch(() => {});
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
