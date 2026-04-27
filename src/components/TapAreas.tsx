import { atom, useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useRef, useState, type JSX } from "react";
import { ActionAtom, AppStateAtom, Atom } from "../atoms";
import { TapAreaLengthEnum } from "../models/appState";
import { SmoothScroll } from "../models/smoothScroll";
import type { Body, Content } from "../models/types";
import { Viewer } from "../models/viewer";

const leftClickAtom = atom(null, (get, set, viewer: Viewer) => {
    if (get(Atom.isUserScrolled)) {
        set(Atom.isUserScrolled, false);
        set(Atom.scrollManager, (s) => s.update(viewer));
    }

    const { shouldAdvance, writingType } = get(Atom.appStore);
    if (shouldAdvance) {
        set(goToNextAtom, viewer);
    } else if (writingType === "vertical") {
        set(goToNextAtom, viewer);
    } else if (writingType === "horizontal") {
        set(goToPreviousAtom, viewer);
    }
});

const rightClickAtom = atom(null, (get, set, viewer: Viewer) => {
    if (get(Atom.isUserScrolled)) {
        set(Atom.isUserScrolled, false);
        set(Atom.scrollManager, (s) => s.update(viewer));
    }

    const { shouldAdvance, writingType } = get(Atom.appStore);
    if (shouldAdvance) {
        set(goToNextAtom, viewer);
    } else if (writingType === "vertical") {
        set(goToPreviousAtom, viewer);
    } else if (writingType === "horizontal") {
        set(goToNextAtom, viewer);
    }
});

const bottomClickAtom = atom(null, (get, set, viewer: Viewer) => {
    if (get(Atom.isUserScrolled)) {
        set(Atom.isUserScrolled, false);
        set(Atom.scrollManager, (s) => s.update(viewer));
    }

    const { shouldAdvance } = get(Atom.appStore);
    if (shouldAdvance) {
        set(goToPreviousAtom, viewer);
    }
});

const goToNextAtom = atom(null, (get, set, viewer: Viewer) => {
    const appStore = get(Atom.appStore);
    const scroll = get(Atom.scrollManager);
    if (scroll.shouldMoveToNextPage({ ...appStore, viewer })) {
        if (get(Atom.fileManager).hasNextFile()) {
            set(ActionAtom.moveToNextPage);
            set(ActionAtom.positionStart);
        }
    } else {
        set(ActionAtom.scrollToNext, viewer);
    }
});

const goToPreviousAtom = atom(null, (get, set, viewer: Viewer) => {
    const appStore = get(Atom.appStore);
    const scroll = get(Atom.scrollManager);
    if (scroll.shouldMoveToPreviousPage({ ...appStore, viewer })) {
        if (get(Atom.fileManager).hasPreviousFile()) {
            set(ActionAtom.moveToPreviousPage);
            set(ActionAtom.positionEnd);
        }
    } else {
        set(ActionAtom.scrollToPrevious, viewer);
    }
});

/* -------------------------------------------------------------------------- */

type Delta = { x: number; y: number };

const horizontalScrollAtom = atom(
    null,
    (get, set, delta: Delta, body: Body) => {
        if (body == null) return;

        const { scrollSpeed } = get(Atom.appStore);
        const x = scrollSpeed * delta.x + body.scrollLeft;
        const y = body.scrollTop;
        body.scroll(x, y);
        set(Atom.isUserScrolled, true);
    },
);

const verticalScrollAtom = atom(null, (get, set, delta: Delta, body: Body) => {
    if (body == null) return;

    const { scrollSpeed } = get(Atom.appStore);
    const x = body.scrollLeft;
    const y = scrollSpeed * delta.y + body.scrollTop;
    body.scroll(x, y);
    set(Atom.isUserScrolled, true);
});

/* -------------------------------------------------------------------------- */

export const TapAreas = ({
    body,
    content,
}: {
    body: React.RefObject<Body>;
    content: React.RefObject<Content>;
}): JSX.Element => {
    const tapAreaWidth = useAtomValue(AppStateAtom.tapAreaWidth);
    const tapAreaHeight = useAtomValue(AppStateAtom.tapAreaHeight);
    const leftClick = useSetAtom(leftClickAtom);
    const rightClick = useSetAtom(rightClickAtom);
    const bottomClick = useSetAtom(bottomClickAtom);
    const verticalScroll = useSetAtom(verticalScrollAtom);
    const horizontalScroll = useSetAtom(horizontalScrollAtom);

    return (
        <>
            <TapArea
                className="inset-x-0 bottom-0"
                style={{ height: TapAreaLengthEnum[tapAreaHeight].length }}
                onClick={() =>
                    bottomClick(Viewer.create(body.current, content.current))
                }
                onScroll={(delta) => horizontalScroll(delta, body.current)}
            />
            <TapArea
                className="inset-y-0 left-0"
                style={{ width: TapAreaLengthEnum[tapAreaWidth].length }}
                onClick={() =>
                    leftClick(Viewer.create(body.current, content.current))
                }
                onScroll={(delta) => verticalScroll(delta, body.current)}
            />
            <TapArea
                className="inset-y-0 right-0"
                style={{ width: TapAreaLengthEnum[tapAreaWidth].length }}
                onClick={() =>
                    rightClick(Viewer.create(body.current, content.current))
                }
                onScroll={(delta) => verticalScroll(delta, body.current)}
            />
        </>
    );
};

const TapArea = (props: {
    className: string;
    style: React.CSSProperties;
    onClick: () => void;
    onScroll: (delta: Delta) => void;
}): JSX.Element => {
    const div = useRef<HTMLDivElement | null>(null);
    const timerId = useRef<number | undefined>(undefined);
    const prevClient = useRef({ x: 0, y: 0 });
    const smoothScroll = useRef(new SmoothScroll());
    const canClick = useRef(true);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const el = div.current;
        if (el == null) return;

        const handleTouchMove = (ev: TouchEvent): void => {
            ev.preventDefault();
            const { clientX, clientY } = ev.changedTouches[0];
            const diffX = prevClient.current.x - clientX;
            const diffY = prevClient.current.y - clientY;
            smoothScroll.current.add(diffX, diffY);
            props.onScroll({
                x: smoothScroll.current.averageX(),
                y: smoothScroll.current.averageY(),
            });
            prevClient.current = { x: clientX, y: clientY };
            canClick.current = false;
        };

        const handleWheel = (ev: WheelEvent): void => {
            ev.preventDefault();
            setIsActive(true);
            smoothScroll.current.add(ev.deltaX, ev.deltaY);
            props.onScroll({
                x: smoothScroll.current.averageX(),
                y: smoothScroll.current.averageY(),
            });
            window.clearTimeout(timerId.current);
            timerId.current = window.setTimeout(() => {
                smoothScroll.current = new SmoothScroll();
                setIsActive(false);
            }, 300);
        };

        const option: AddEventListenerOptions = { passive: false };
        el.addEventListener("touchmove", handleTouchMove, option);
        el.addEventListener("wheel", handleWheel, option);
        return (): void => {
            el.removeEventListener("touchmove", handleTouchMove, option);
            el.removeEventListener("wheel", handleWheel, option);
        };
    }, [props]);

    const handleTouchStart = (ev: React.TouchEvent<HTMLDivElement>): void => {
        const { clientX, clientY } = ev.changedTouches[0];
        prevClient.current = { x: clientX, y: clientY };
        smoothScroll.current = new SmoothScroll();
        canClick.current = true;
        setIsActive(true);
    };

    const handleTouchEnd = (ev: React.TouchEvent<HTMLDivElement>): void => {
        ev.preventDefault();
        setIsActive(false);
        if (canClick.current) props.onClick();
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
            style={props.style}
            ref={div}
            onClick={props.onClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        />
    );
};
