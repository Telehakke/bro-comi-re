import { useSetAtom } from "jotai";
import { useEffect, useRef, type JSX, type ReactNode } from "react";
import { Atom } from "../../../atoms";
import { PullManager } from "../../../models/pullManager";
import type { ViewerBody, ViewerContent } from "../../../models/types";
import { Viewer } from "../../../models/viewer";

export const BodyView = ({
    body,
    content,
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
    content: React.RefObject<ViewerContent>;
    onResize: (width: number, height: number) => void;
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
    const setOnChevronLeft = useSetAtom(Atom.onChevronLeft);
    const setOnChevronRight = useSetAtom(Atom.onChevronRight);
    const setIsUserScrolled = useSetAtom(Atom.isUserScrolled);

    useEffect(() => {
        if (body.current == null) return;

        const observer = new ResizeObserver(() => {
            const { clientWidth, clientHeight } = body.current!;
            onResize(clientWidth, clientHeight);
        });
        observer.observe(body.current);
        return (): void => observer.disconnect();
    }, [body, onResize]);

    return (
        <div
            className="fixed inset-0 flex h-dvh w-dvw overflow-scroll overscroll-contain bg-black select-none"
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
                const viewer = Viewer.create(body.current, content.current);
                if (viewer.isReachedLimitX()) {
                    pullManager.current.add(prevX.current - x);
                    if (pullManager.current.canLeftPull()) {
                        setOnChevronLeft(true);
                    } else if (pullManager.current.canRightPull()) {
                        setOnChevronRight(true);
                    } else {
                        setOnChevronLeft(false);
                        setOnChevronRight(false);
                    }
                }
                prevX.current = x;
            }}
            onTouchEnd={() => {
                window.clearTimeout(timerId.current);
                setOnChevronLeft(false);
                setOnChevronRight(false);
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
