import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, type JSX, type ReactNode } from "react";
import { Atom } from "../../../atoms";
import { PullManager } from "../../../models/pullManager";
import type { ViewerBody } from "../../../models/viewerManager";

export const BodyView = ({
    body,
    onResize,
    onClick,
    onDoubleClick,
    onRightClick,
    onLongPress,
    onLeftSidePull,
    onRightSidePull,
    children,
}: {
    body: React.RefObject<ViewerBody>;
    onResize: () => void;
    onClick: () => void;
    onDoubleClick: () => void;
    onRightClick: () => void;
    onLongPress: () => void;
    onLeftSidePull: () => void;
    onRightSidePull: () => void;
    children: ReactNode;
}): JSX.Element => {
    const timerId = useRef<number | undefined>(undefined);
    const prevX = useRef(0);
    const pullManager = useRef(new PullManager());
    const canClick = useRef(true);
    const canDoubleClick = useRef(true);
    const canRightClick = useRef(true);
    const canLongPress = useRef(true);
    const setOnChevron = useSetAtom(Atom.onChevron);
    const setIsUserScrolled = useSetAtom(Atom.isUserScrolled);
    const viewerManager = useAtomValue(Atom.viewerManager);

    useEffect(() => {
        if (body.current == null) return;

        const observer = new ResizeObserver(() => {
            onResize();
        });
        observer.observe(body.current);
        return (): void => observer.disconnect();
    }, [body, onResize]);

    return (
        <div
            className="fixed inset-0 h-dvh w-dvw overflow-scroll overscroll-contain bg-black select-none"
            style={{ scrollbarWidth: "none" }}
            ref={body}
            onClick={() => {
                if (canClick.current) onClick();
            }}
            onDoubleClick={() => {
                if (canDoubleClick.current) onDoubleClick();
            }}
            onContextMenu={(ev) => {
                ev.preventDefault();
                window.clearTimeout(timerId.current);
                if (!canRightClick.current) return;
                onRightClick();
                canLongPress.current = false;
            }}
            onTouchStart={(ev) => {
                timerId.current = window.setTimeout(() => {
                    if (!canLongPress.current) return;
                    onLongPress();
                    canClick.current = false;
                    canDoubleClick.current = false;
                    canRightClick.current = false;
                }, 500);
                prevX.current = ev.targetTouches[0].clientX;
                pullManager.current = new PullManager();
                canClick.current = true;
                canDoubleClick.current = true;
                canRightClick.current = true;
                canLongPress.current = true;
            }}
            onTouchMove={(ev) => {
                window.clearTimeout(timerId.current);
                setIsUserScrolled(true);
                const x = ev.targetTouches[0].clientX;
                if (viewerManager.isReachedLimitX()) {
                    pullManager.current.add(prevX.current - x);
                    if (pullManager.current.canLeftPull()) {
                        setOnChevron("left");
                    } else if (pullManager.current.canRightPull()) {
                        setOnChevron("right");
                    } else {
                        setOnChevron("none");
                    }
                }
                prevX.current = x;
            }}
            onTouchEnd={() => {
                window.clearTimeout(timerId.current);
                setOnChevron("none");
                if (pullManager.current.canLeftPull()) {
                    onLeftSidePull();
                } else if (pullManager.current.canRightPull()) {
                    onRightSidePull();
                }
            }}
            onWheel={() => {
                setIsUserScrolled(true);
            }}
        >
            {children}
        </div>
    );
};
