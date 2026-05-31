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
    onSubClick,
    onLeftSidePull,
    onRightSidePull,
    children,
}: {
    body: React.RefObject<ViewerBody>;
    onResize: () => void;
    onClick: () => void;
    onDoubleClick: () => void;
    onSubClick: () => void;
    onLeftSidePull: () => void;
    onRightSidePull: () => void;
    children: ReactNode;
}): JSX.Element => {
    const timerId = useRef<number | undefined>(undefined);
    const beginPosition = useRef({ x: 0, y: 0 });
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
                if (!canClick.current) {
                    canClick.current = true;
                    return;
                }
                onClick();
            }}
            onDoubleClick={() => {
                if (!canDoubleClick.current) {
                    canDoubleClick.current = true;
                    return;
                }
                onDoubleClick();
            }}
            onContextMenu={(ev) => {
                // ブラウザデフォルトのメニューを開かない
                ev.preventDefault();

                if (!canRightClick.current) {
                    canRightClick.current = true;
                    return;
                }
                onSubClick();
            }}
            onTouchStart={(ev) => {
                timerId.current = window.setTimeout(() => {
                    if (!canLongPress.current) {
                        canLongPress.current = true;
                        return;
                    }
                    onSubClick();
                    canClick.current = false;
                    canDoubleClick.current = false;
                    canRightClick.current = false;
                }, 500);
                const x = ev.targetTouches[0].clientX;
                const y = ev.targetTouches[0].clientY;
                beginPosition.current = { x, y };
                prevX.current = x;
                pullManager.current = new PullManager();
            }}
            onTouchMove={(ev) => {
                setIsUserScrolled(true);
                const x = ev.targetTouches[0].clientX;
                const y = ev.targetTouches[0].clientY;

                // ロングプレスの判定をされやすくする
                const deltaX = Math.abs(beginPosition.current.x - x);
                const deltaY = Math.abs(beginPosition.current.y - y);
                if (Math.max(deltaX, deltaY) >= 20) {
                    window.clearTimeout(timerId.current);
                }

                // スクロール限界からさらにスクロールした時の処理
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
