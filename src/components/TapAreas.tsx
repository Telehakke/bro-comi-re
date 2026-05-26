import { atom, useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useRef, useState, type JSX } from "react";
import { ActionAtom, AppStateAtom, Atom } from "../atoms";
import { TapAreaLengthEnum } from "../models/appState";
import { SmoothScroll } from "../models/smoothScroll";

const handleLeftEdgeClickAtom = atom(null, (get, set) => {
    set(ActionAtom.updateScrollManager);
    const { shouldAdvance, writingType } = get(Atom.appStore);
    if (shouldAdvance) {
        set(ActionAtom.goToNextAtom);
    } else if (writingType === "vertical") {
        set(ActionAtom.goToNextAtom);
    } else if (writingType === "horizontal") {
        set(ActionAtom.goToPreviousAtom);
    }
});

const handleLeftEdgeSubClickAtom = atom(null, (get, set) => {
    set(ActionAtom.updateScrollManager);
    const { shouldAdvance, writingType } = get(Atom.appStore);
    if (shouldAdvance) {
        set(ActionAtom.goToPreviousAtom);
    } else if (writingType === "vertical") {
        set(ActionAtom.goToPreviousAtom);
    } else if (writingType === "horizontal") {
        set(ActionAtom.goToNextAtom);
    }
});

const handleRightEdgeClickAtom = atom(null, (get, set) => {
    set(ActionAtom.updateScrollManager);
    const { shouldAdvance, writingType } = get(Atom.appStore);
    if (shouldAdvance) {
        set(ActionAtom.goToNextAtom);
    } else if (writingType === "vertical") {
        set(ActionAtom.goToPreviousAtom);
    } else if (writingType === "horizontal") {
        set(ActionAtom.goToNextAtom);
    }
});

const handleRightEdgeSubClickAtom = atom(null, (get, set) => {
    set(ActionAtom.updateScrollManager);
    const { shouldAdvance, writingType } = get(Atom.appStore);
    if (shouldAdvance) {
        set(ActionAtom.goToPreviousAtom);
    } else if (writingType === "vertical") {
        set(ActionAtom.goToNextAtom);
    } else if (writingType === "horizontal") {
        set(ActionAtom.goToPreviousAtom);
    }
});

const handleBottomClickAtom = atom(null, (_, set) => {
    set(ActionAtom.updateScrollManager);
    set(ActionAtom.goToNextAtom);
});

const handleBottomSubClickAtom = atom(null, (_, set) => {
    set(ActionAtom.updateScrollManager);
    set(ActionAtom.goToPreviousAtom);
});

/* -------------------------------------------------------------------------- */

type Delta = { x: number; y: number };

const handleHorizontalScrollAtom = atom(null, (get, set, delta: Delta) => {
    const body = get(Atom.viewerManager).body;
    if (body == null) return;

    const { scrollSpeed } = get(Atom.appStore);
    const x = scrollSpeed * delta.x + body.scrollLeft;
    const y = body.scrollTop;
    body.scroll(x, y);
    set(Atom.isUserScrolled, true);
});

const handleVerticalScrollAtom = atom(null, (get, set, delta: Delta) => {
    const body = get(Atom.viewerManager).body;
    if (body == null) return;

    const { scrollSpeed } = get(Atom.appStore);
    const x = body.scrollLeft;
    const y = scrollSpeed * delta.y + body.scrollTop;
    body.scroll(x, y);
    set(Atom.isUserScrolled, true);
});

/* -------------------------------------------------------------------------- */

export const TapAreas = (): JSX.Element => {
    const tapAreaWidth = useAtomValue(AppStateAtom.tapAreaWidth);
    const tapAreaHeight = useAtomValue(AppStateAtom.tapAreaHeight);
    const handleLeftEdgeClick = useSetAtom(handleLeftEdgeClickAtom);
    const handleLeftEdgeSubClick = useSetAtom(handleLeftEdgeSubClickAtom);
    const handleRightEdgeClick = useSetAtom(handleRightEdgeClickAtom);
    const handleRightEdgeSubClick = useSetAtom(handleRightEdgeSubClickAtom);
    const handleBottomClick = useSetAtom(handleBottomClickAtom);
    const handleBottomSubClick = useSetAtom(handleBottomSubClickAtom);
    const handleHorizontalScroll = useSetAtom(handleVerticalScrollAtom);
    const horizontalScroll = useSetAtom(handleHorizontalScrollAtom);

    return (
        <>
            <TapArea
                className="inset-x-0 bottom-0"
                style={{ height: TapAreaLengthEnum[tapAreaHeight].length }}
                onClick={() => handleBottomClick()}
                onSubClick={() => handleBottomSubClick()}
                onScroll={(delta) => horizontalScroll(delta)}
            />
            <TapArea
                className="inset-y-0 left-0"
                style={{ width: TapAreaLengthEnum[tapAreaWidth].length }}
                onClick={() => handleLeftEdgeClick()}
                onSubClick={() => handleLeftEdgeSubClick()}
                onScroll={(delta) => handleHorizontalScroll(delta)}
            />
            <TapArea
                className="inset-y-0 right-0"
                style={{ width: TapAreaLengthEnum[tapAreaWidth].length }}
                onClick={() => handleRightEdgeClick()}
                onSubClick={() => handleRightEdgeSubClick()}
                onScroll={(delta) => handleHorizontalScroll(delta)}
            />
        </>
    );
};

const TapArea = (props: {
    className: string;
    style: React.CSSProperties;
    onClick: () => void;
    onSubClick: () => void;
    onScroll: (delta: Delta) => void;
}): JSX.Element => {
    const div = useRef<HTMLDivElement | null>(null);
    const timerId = useRef<number | undefined>(undefined);
    const prevClient = useRef({ x: 0, y: 0 });
    const smoothScroll = useRef(new SmoothScroll());
    const canClick = useRef(true);
    const canRightClick = useRef(true);
    const canLongPress = useRef(true);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const el = div.current;
        if (el == null) return;

        const handleTouchMove = (ev: TouchEvent): void => {
            ev.preventDefault();
            setIsActive(true);
            window.clearTimeout(timerId.current);
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

    const handleContextMenu = (
        ev: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ): void => {
        ev.preventDefault();
        window.clearTimeout(timerId.current);
        if (!canRightClick.current) return;
        props.onSubClick();
        canLongPress.current = false;
    };

    const handleTouchStart = (ev: React.TouchEvent<HTMLDivElement>): void => {
        setIsActive(true);
        timerId.current = window.setTimeout(() => {
            if (!canLongPress) return;
            props.onSubClick();
            canClick.current = false;
            canRightClick.current = false;
        }, 500);
        const { clientX, clientY } = ev.changedTouches[0];
        prevClient.current = { x: clientX, y: clientY };
        smoothScroll.current = new SmoothScroll();
        canClick.current = true;
        canRightClick.current = true;
        canLongPress.current = true;
    };

    const handleTouchEnd = (): void => {
        window.clearTimeout(timerId.current);
        setIsActive(false);
    };

    const className = {
        _: "fixed transition select-none",
        activeBg: isActive && "bg-blue-500/15",
        props: props.className,
    };

    return (
        <div
            className={Object.values(className).join(" ")}
            style={props.style}
            ref={div}
            onMouseDown={() => {
                setIsActive(true);
            }}
            onMouseUp={() => {
                setIsActive(false);
            }}
            onMouseLeave={() => {
                setIsActive(false);
            }}
            onClick={() => {
                if (canClick.current) props.onClick();
            }}
            onContextMenu={handleContextMenu}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        />
    );
};
