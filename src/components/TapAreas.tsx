import { atom, useSetAtom } from "jotai";
import React, { useEffect, useRef, useState, type JSX } from "react";
import { ActionAtom, Atom } from "../atoms";

type Viewer = HTMLDivElement | null;
type Image = HTMLImageElement | null;

const viewerBottomClickAtom = atom(
    null,
    (get, set, viewer: Viewer, image: Image) => {
        if (viewer == null || image == null) return;

        if (get(Atom.isUserScrolled)) {
            set(Atom.scrollManager, (s) => s.update(viewer, image));
            set(Atom.isUserScrolled, false);
        }
        const { shouldAdvance } = get(Atom.appStore);
        if (shouldAdvance) {
            set(ActionAtom.goToPrevious, viewer, image);
        }
    },
);

const viewerLeftClickAtom = atom(
    null,
    (get, set, viewer: Viewer, image: Image) => {
        if (viewer == null || image == null) return;

        if (get(Atom.isUserScrolled)) {
            set(Atom.scrollManager, (s) => s.update(viewer, image));
            set(Atom.isUserScrolled, false);
        }
        const { shouldAdvance, writingType } = get(Atom.appStore);
        if (shouldAdvance) {
            set(ActionAtom.goToNext, viewer, image);
            return;
        }
        if (writingType === "vertical") {
            set(ActionAtom.goToNext, viewer, image);
            return;
        }
        if (writingType === "horizontal") {
            set(ActionAtom.goToPrevious, viewer, image);
            return;
        }
    },
);

const viewerRightClickAtom = atom(
    null,
    (get, set, viewer: Viewer, image: Image) => {
        if (viewer == null || image == null) return;

        if (get(Atom.isUserScrolled)) {
            set(Atom.scrollManager, (s) => s.update(viewer, image));
            set(Atom.isUserScrolled, false);
        }
        const { shouldAdvance, writingType } = get(Atom.appStore);
        if (shouldAdvance) {
            set(ActionAtom.goToNext, viewer, image);
            return;
        }
        if (writingType === "vertical") {
            set(ActionAtom.goToPrevious, viewer, image);
            return;
        }
        if (writingType === "horizontal") {
            set(ActionAtom.goToNext, viewer, image);
            return;
        }
    },
);

const horizontalScrollAtom = atom(
    null,
    (get, set, deltaX: number, viewer: Viewer) => {
        if (viewer == null) return;

        const { scrollSpeed } = get(Atom.appStore);
        const x = scrollSpeed * deltaX + viewer.scrollLeft;
        const y = viewer.scrollTop;
        viewer.scroll(x, y);
        set(Atom.isUserScrolled, true);
    },
);

const verticalScrollAtom = atom(
    null,
    (get, set, deltaY: number, viewer: Viewer) => {
        if (viewer == null) return;

        const { scrollSpeed } = get(Atom.appStore);
        const x = viewer.scrollLeft;
        const y = scrollSpeed * deltaY + viewer.scrollTop;
        viewer.scroll(x, y);
        set(Atom.isUserScrolled, true);
    },
);

/* -------------------------------------------------------------------------- */

export const TapAreas = ({
    viewerRef,
    imageRef,
}: {
    viewerRef: React.RefObject<HTMLDivElement | null>;
    imageRef: React.RefObject<HTMLImageElement | null>;
}): JSX.Element => {
    const viewerBottomClick = useSetAtom(viewerBottomClickAtom);
    const viewerLeftClick = useSetAtom(viewerLeftClickAtom);
    const viewerRightClick = useSetAtom(viewerRightClickAtom);
    const verticalScroll = useSetAtom(verticalScrollAtom);
    const horizontalScroll = useSetAtom(horizontalScrollAtom);

    return (
        <>
            <TapArea
                className="inset-x-0 bottom-0 h-18"
                onClick={() =>
                    viewerBottomClick(viewerRef.current, imageRef.current)
                }
                onScroll={(deltaX) =>
                    horizontalScroll(deltaX, viewerRef.current)
                }
            />
            <TapArea
                className="inset-y-0 left-0 w-18"
                onClick={() =>
                    viewerLeftClick(viewerRef.current, imageRef.current)
                }
                onScroll={(_, deltaY) =>
                    verticalScroll(deltaY, viewerRef.current)
                }
            />
            <TapArea
                className="inset-y-0 right-0 w-18"
                onClick={() =>
                    viewerRightClick(viewerRef.current, imageRef.current)
                }
                onScroll={(_, deltaY) =>
                    verticalScroll(deltaY, viewerRef.current)
                }
            />
        </>
    );
};

const TapArea = (props: {
    className: string;
    onClick: () => void;
    onScroll: (deltaX: number, deltaY: number) => void;
}): JSX.Element => {
    const divRef = useRef<HTMLDivElement | null>(null);
    const timerRef = useRef<number | undefined>(undefined);
    const prevClient = useRef({ x: 0, y: 0 });
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const div = divRef.current;
        if (div == null) return;

        const handleTouchmove = (ev: TouchEvent): void => {
            ev.preventDefault();
            const x = ev.changedTouches[0].clientX;
            const y = ev.changedTouches[0].clientY;
            props.onScroll(prevClient.current.x - x, prevClient.current.y - y);
            prevClient.current = { x, y };
        };

        const handleWheel = (ev: WheelEvent): void => {
            ev.preventDefault();
            setIsActive(true);
            window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => {
                setIsActive(false);
            }, 200);
            props.onScroll(ev.deltaX, ev.deltaY);
        };

        const option: AddEventListenerOptions = { passive: false };
        div.addEventListener("touchmove", handleTouchmove, option);
        div.addEventListener("wheel", handleWheel, option);
        return (): void => {
            div.removeEventListener("touchmove", handleTouchmove, option);
            div.removeEventListener("wheel", handleWheel, option);
        };
    }, [props]);

    const handleTouchStart = (ev: React.TouchEvent<HTMLDivElement>): void => {
        const { clientX, clientY } = ev.changedTouches[0];
        prevClient.current = { x: clientX, y: clientY };
        setIsActive(true);
    };

    const handleTouchEnd = (): void => {
        setIsActive(false);
    };

    const className = {
        _: "fixed transition select-none ",
        activeBg: "active:bg-blue-500/15",
        activeBg2: isActive && "bg-blue-500/15",
        props: props.className,
    };

    return (
        <div
            className={Object.values(className).join(" ")}
            ref={divRef}
            onClick={props.onClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        />
    );
};
