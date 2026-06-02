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
    const beginPosition = useRef({ x: 0, y: 0 });
    const prevPosition = useRef({ x: 0, y: 0 });
    const smoothScroll = useRef(new SmoothScroll());
    const canClick = useRef(true);
    const canRightClick = useRef(true);
    const canLongPress = useRef(true);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const el = div.current;
        if (el == null) return;

        const handleTouchMove = (ev: TouchEvent): void => {
            // 背景要素にスクロールイベントが伝播するのを止める
            ev.preventDefault();

            // Android端末ではスクロール操作時にCSSのactiveが解除されてしまうため、
            // JavaScriptを用いて背景色の表示をコントロールする
            setIsActive(true);

            const x = ev.targetTouches[0].clientX;
            const y = ev.targetTouches[0].clientY;

            // ロングプレスの判定をされやすくする
            const deltaX = Math.abs(beginPosition.current.x - x);
            const deltaY = Math.abs(beginPosition.current.y - y);
            if (Math.max(deltaX, deltaY) >= 10) {
                window.clearInterval(timerId.current);
            }

            const diffX = prevPosition.current.x - x;
            const diffY = prevPosition.current.y - y;
            const [newX, newY] = smoothScroll.current.position(diffX, diffY);
            props.onScroll({ x: newX, y: newY });
            prevPosition.current = { x, y };
        };

        const handleWheel = (ev: WheelEvent): void => {
            // 背景要素にホイールイベントが伝播するのを止める
            ev.preventDefault();

            const deltaX = ev.deltaX;
            const deltaY = ev.deltaY;
            setIsActive(true);
            const [newX, newY] = smoothScroll.current.position(deltaX, deltaY);
            props.onScroll({ x: newX, y: newY });
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
        // ブラウザデフォルトのメニューを開かない
        ev.preventDefault();

        if (!canRightClick.current) {
            canRightClick.current = true;
            return;
        }
        props.onSubClick();
        canLongPress.current = false;
    };

    const handleTouchStart = (ev: React.TouchEvent<HTMLDivElement>): void => {
        setIsActive(true);
        timerId.current = window.setTimeout(() => {
            if (!canLongPress.current) {
                canLongPress.current = true;
                return;
            }
            props.onSubClick();
            canClick.current = false;
            canRightClick.current = false;
        }, 500);
        const x = ev.targetTouches[0].clientX;
        const y = ev.targetTouches[0].clientY;
        beginPosition.current = { x, y };
        prevPosition.current = { x, y };
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
        activeBg: "active:bg-blue-500/15",
        activeBg2: isActive ? "bg-blue-500/15" : undefined,
        props: props.className,
    };

    return (
        <div
            className={Object.values(className).join(" ")}
            style={props.style}
            ref={div}
            onClick={() => {
                if (!canClick.current) {
                    canClick.current = true;
                    return;
                }
                props.onClick();
            }}
            onContextMenu={handleContextMenu}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            // iPhoneでホームバーが表示された際に背景色を消す
            onTouchCancel={() => setIsActive(false)}
        />
    );
};
