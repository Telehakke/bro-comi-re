import { useAtom } from "jotai";
import { useEffect, useRef, type JSX } from "react";
import { Atom } from "../atoms";
import { FullscreenButton } from "./FullscreenButton";
import { InvertFilterButton } from "./InvertFilterButton";
import { Progress } from "./Progress";
import { MenuButton } from "./sideMenu/sub/MenuButton";
import { Time } from "./Time";

export const Infos = ({
    paddingLeft,
    paddingRight,
}: {
    paddingLeft: string;
    paddingRight: string;
}): JSX.Element => {
    const divRef = useRef<HTMLDivElement | null>(null);
    const [infoState, setInfoState] = useAtom(Atom.infoState);

    useEffect(() => {
        const div = divRef.current;
        if (div == null) return;

        const handleAnimationEnd = (): void => {
            if (infoState === "hidden") {
                setInfoState("none");
            }
        };
        div.addEventListener("animationend", handleAnimationEnd);
        return (): void =>
            div.removeEventListener("animationend", handleAnimationEnd);
    }, [infoState, setInfoState]);

    if (infoState === "none") return <></>;
    return (
        <div
            className="data-[state=visible]:animate-fade-in data-[state=hidden]:animate-fade-out data-[state=hidden]:opacity-0"
            ref={divRef}
            data-state={infoState}
        >
            <div
                className="fixed top-4 left-4 flex gap-4"
                style={{ paddingLeft }}
            >
                <MenuButton />
                <InvertFilterButton />
                <FullscreenButton />
            </div>
            <div className="fixed top-4 right-4" style={{ paddingRight }}>
                <Time />
            </div>
            <div
                className="fixed inset-x-0 bottom-0"
                style={{ paddingLeft, paddingRight }}
            >
                <Progress />
            </div>
        </div>
    );
};
