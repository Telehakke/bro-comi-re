import { useAtomValue, useSetAtom } from "jotai";
import { EllipsisVertical } from "lucide-react";
import type { JSX, ReactNode } from "react";
import { Atom } from "../../../atoms";

export const MenuButton = (): JSX.Element => {
    const shouldShowInfo = useAtomValue(Atom.shouldShowInfo);

    const className = {
        _: "data-[visible=false]:opacity-0",
        fadeInOut:
            "data-[visible=true]:animate-fade-in data-[visible=false]:animate-fade-out",
    };

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
    const setIsOpenSideMenu = useSetAtom(Atom.isOpenSideMenu);

    const className = {
        _: "group rounded-full transition select-none",
        position: "fixed top-4 left-4",
        outline: "outline-blue-500/75 focus-visible:outline-2",
    };

    return (
        <button
            className={Object.values(className).join(" ")}
            onClick={() => setIsOpenSideMenu(true)}
        >
            {props.children}
        </button>
    );
};

const Icon = (): JSX.Element => {
    const className = {
        _: "size-10 p-2 rounded-full opacity-50 transition",
        bg: "bg-neutral-500",
        hoverBg: "group-hover:bg-neutral-600",
        activeBg: " group-active:bg-neutral-700",
        border: "border border-neutral-200",
        stroke: "stroke-white",
    };

    return <EllipsisVertical className={Object.values(className).join(" ")} />;
};
