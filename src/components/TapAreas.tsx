import { atom, useSetAtom } from "jotai";
import React, { useEffect, useRef, useState, type JSX } from "react";
import { ActionAtom, Atom } from "../atoms";
import { SmoothScroll } from "../models/smoothScroll";
import type { Content, Viewer } from "../models/types";

const leftClickAtom = atom(
    null,
    (get, set, viewer: Viewer, content: Content) => {
        if (viewer == null || content == null) return;

        if (get(Atom.isUserScrolled)) {
            set(Atom.isUserScrolled, false);
            set(Atom.scrollManager, (s) => s.update(viewer, content));
        }

        const { shouldAdvance, writingType } = get(Atom.appStore);
        if (shouldAdvance) {
            set(goToNextAtom, viewer, content);
        } else if (writingType === "vertical") {
            set(goToNextAtom, viewer, content);
        } else if (writingType === "horizontal") {
            set(goToPreviousAtom, viewer, content);
        }
    },
);

const rightClickAtom = atom(
    null,
    (get, set, viewer: Viewer, content: Content) => {
        if (viewer == null || content == null) return;

        if (get(Atom.isUserScrolled)) {
            set(Atom.isUserScrolled, false);
            set(Atom.scrollManager, (s) => s.update(viewer, content));
        }

        const { shouldAdvance, writingType } = get(Atom.appStore);
        if (shouldAdvance) {
            set(goToNextAtom, viewer, content);
        } else if (writingType === "vertical") {
            set(goToPreviousAtom, viewer, content);
        } else if (writingType === "horizontal") {
            set(goToNextAtom, viewer, content);
        }
    },
);

const bottomClickAtom = atom(
    null,
    (get, set, viewer: Viewer, content: Content) => {
        if (viewer == null || content == null) return;

        if (get(Atom.isUserScrolled)) {
            set(Atom.isUserScrolled, false);
            set(Atom.scrollManager, (s) => s.update(viewer, content));
        }

        const { shouldAdvance } = get(Atom.appStore);
        if (shouldAdvance) {
            set(goToPreviousAtom, viewer, content);
        }
    },
);

const goToNextAtom = atom(
    null,
    (get, set, viewer: HTMLDivElement, content: HTMLDivElement) => {
        const { writingType } = get(Atom.appStore);
        const scroll = get(Atom.scrollManager);
        if (scroll.shouldMoveToNextPage(viewer, content, writingType)) {
            if (get(Atom.fileManager).hasNextFile()) {
                set(ActionAtom.moveToNextPage);
                set(ActionAtom.scrollToStart, viewer, content);
            }
        } else {
            set(ActionAtom.scrollToNext, viewer, content);
        }
    },
);

const goToPreviousAtom = atom(
    null,
    (get, set, viewer: HTMLDivElement, content: HTMLDivElement) => {
        const { writingType } = get(Atom.appStore);
        const scroll = get(Atom.scrollManager);
        if (scroll.shouldMoveToPreviousPage(viewer, content, writingType)) {
            if (get(Atom.fileManager).hasPreviousFile()) {
                set(ActionAtom.moveToPreviousPage);
                set(ActionAtom.scrollToEnd, viewer, content);
            }
        } else {
            set(ActionAtom.scrollToPrevious, viewer, content);
        }
    },
);

/* -------------------------------------------------------------------------- */

type Delta = { x: number; y: number };

const horizontalScrollAtom = atom(
    null,
    (get, set, delta: Delta, content: Viewer) => {
        if (content == null) return;

        const { scrollSpeed } = get(Atom.appStore);
        const x = scrollSpeed * delta.x + content.scrollLeft;
        const y = content.scrollTop;
        content.scroll(x, y);
        set(Atom.isUserScrolled, true);
    },
);

const verticalScrollAtom = atom(
    null,
    (get, set, delta: Delta, content: Viewer) => {
        if (content == null) return;

        const { scrollSpeed } = get(Atom.appStore);
        const x = content.scrollLeft;
        const y = scrollSpeed * delta.y + content.scrollTop;
        content.scroll(x, y);
        set(Atom.isUserScrolled, true);
    },
);

/* -------------------------------------------------------------------------- */

export const TapAreas = ({
    viewerRef,
    contentRef,
}: {
    viewerRef: React.RefObject<Viewer>;
    contentRef: React.RefObject<Content>;
}): JSX.Element => {
    const leftClick = useSetAtom(leftClickAtom);
    const rightClick = useSetAtom(rightClickAtom);
    const bottomClick = useSetAtom(bottomClickAtom);
    const verticalScroll = useSetAtom(verticalScrollAtom);
    const horizontalScroll = useSetAtom(horizontalScrollAtom);

    return (
        <>
            <TapArea
                className="inset-y-0 left-0 w-18"
                onClick={() => leftClick(viewerRef.current, contentRef.current)}
                onScroll={(delta) => verticalScroll(delta, viewerRef.current)}
            />
            <TapArea
                className="inset-y-0 right-0 w-18"
                onClick={() =>
                    rightClick(viewerRef.current, contentRef.current)
                }
                onScroll={(delta) => verticalScroll(delta, viewerRef.current)}
            />
            <TapArea
                className="inset-x-0 bottom-0 h-18"
                onClick={() =>
                    bottomClick(viewerRef.current, contentRef.current)
                }
                onScroll={(delta) => horizontalScroll(delta, viewerRef.current)}
            />
        </>
    );
};

const TapArea = (props: {
    className: string;
    onClick: () => void;
    onScroll: (delta: Delta) => void;
}): JSX.Element => {
    const divRef = useRef<HTMLDivElement | null>(null);
    const timerRef = useRef<number | undefined>(undefined);
    const prevClientRef = useRef({ x: 0, y: 0 });
    const smoothScrollRef = useRef(new SmoothScroll());
    const canClickRef = useRef(true);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const div = divRef.current;
        if (div == null) return;

        const handleTouchMove = (ev: TouchEvent): void => {
            ev.preventDefault();
            const prevClient = prevClientRef.current;
            const smoothScroll = smoothScrollRef.current;
            const { clientX, clientY } = ev.changedTouches[0];
            const diffX = prevClient.x - clientX;
            const diffY = prevClient.y - clientY;
            smoothScroll.add(diffX, diffY);
            props.onScroll({
                x: smoothScroll.averageX(),
                y: smoothScroll.averageY(),
            });
            prevClientRef.current = { x: clientX, y: clientY };
            canClickRef.current = false;
        };

        const handleWheel = (ev: WheelEvent): void => {
            ev.preventDefault();
            setIsActive(true);
            const smoothScroll = smoothScrollRef.current;
            smoothScroll.add(ev.deltaX, ev.deltaY);
            props.onScroll({
                x: smoothScroll.averageX(),
                y: smoothScroll.averageY(),
            });
            window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => {
                smoothScrollRef.current = new SmoothScroll();
                setIsActive(false);
            }, 300);
        };

        const option: AddEventListenerOptions = { passive: false };
        div.addEventListener("touchmove", handleTouchMove, option);
        div.addEventListener("wheel", handleWheel, option);
        return (): void => {
            div.removeEventListener("touchmove", handleTouchMove, option);
            div.removeEventListener("wheel", handleWheel, option);
        };
    }, [props]);

    const handleTouchStart = (ev: React.TouchEvent<HTMLDivElement>): void => {
        const { clientX, clientY } = ev.changedTouches[0];
        prevClientRef.current = { x: clientX, y: clientY };
        smoothScrollRef.current = new SmoothScroll();
        canClickRef.current = true;
        setIsActive(true);
    };

    const handleTouchEnd = (ev: React.TouchEvent<HTMLDivElement>): void => {
        ev.preventDefault();
        setIsActive(false);
        if (canClickRef.current) props.onClick();
    };

    const className = {
        _: "fixed transition select-none",
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
