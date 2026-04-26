import { atom, useAtomValue, useSetAtom } from "jotai";
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";
import React, {
    useEffect,
    useRef,
    type CSSProperties,
    type JSX,
    type ReactNode,
} from "react";
import { ActionAtom, Atom } from "../atoms";
import { ScrollManager } from "../models/scrollManager";
import type { Content, Viewer } from "../models/types";
import { ZoomManager } from "../models/zoomManager";

const onChevronLeftAtom = atom(false);
const onChevronRightAtom = atom(false);

const zoomInAtom = atom(null, (get, set, viewer: Viewer, content: Content) => {
    if (viewer == null || content == null) return;

    set(Atom.scrollManager, (s) => s.update(viewer, content));
    const { zoomStep } = get(Atom.appStore);
    const zoom = get(Atom.zoomManager).zoomIn(zoomStep);
    set(Atom.zoomManager, zoom);
    set(Atom.messageManager, (m) => m.setMessage(`${zoom.scale}%`));
});

const zoomOutAtom = atom(null, (get, set, viewer: Viewer, content: Content) => {
    if (viewer == null || content == null) return;

    set(Atom.scrollManager, (s) => s.update(viewer, content));
    const { zoomStep } = get(Atom.appStore);
    const zoom = get(Atom.zoomManager).zoomOut(zoomStep);
    set(Atom.zoomManager, zoom);
    set(Atom.messageManager, (m) => m.setMessage(`${zoom.scale}%`));
});

const goToLeftAtom = atom(
    null,
    (get, set, viewer: Viewer, content: Content) => {
        if (viewer == null || content == null) return;

        const { writingType } = get(Atom.appStore);
        if (writingType === "vertical") {
            if (get(Atom.fileManager).hasNextFile()) {
                set(ActionAtom.moveToNextPage);
                set(ActionAtom.scrollToStart, viewer, content);
            }
        } else {
            if (get(Atom.fileManager).hasPreviousFile()) {
                set(ActionAtom.moveToPreviousPage);
                set(ActionAtom.scrollToEnd, viewer, content);
            }
        }
    },
);

const goToRightAtom = atom(
    null,
    (get, set, viewer: Viewer, content: Content) => {
        if (viewer == null || content == null) return;

        const { writingType } = get(Atom.appStore);
        if (writingType === "vertical") {
            if (get(Atom.fileManager).hasPreviousFile()) {
                set(ActionAtom.moveToPreviousPage);
                set(ActionAtom.scrollToEnd, viewer, content);
            }
        } else {
            if (get(Atom.fileManager).hasNextFile()) {
                set(ActionAtom.moveToNextPage);
                set(ActionAtom.scrollToStart, viewer, content);
            }
        }
    },
);

export const ImageView = ({
    viewerRef,
    contentRef,
}: {
    viewerRef: React.RefObject<Viewer>;
    contentRef: React.RefObject<Content>;
}): JSX.Element => {
    const timerRef = useRef<number | undefined>(undefined);
    const setZoomManager = useSetAtom(Atom.zoomManager);
    const setShouldShowInfo = useSetAtom(Atom.shouldShowInfo);
    const zoomIn = useSetAtom(zoomInAtom);
    const zoomOut = useSetAtom(zoomOutAtom);
    const goToLeft = useSetAtom(goToLeftAtom);
    const goToRight = useSetAtom(goToRightAtom);

    return (
        <Viewer
            viewerRef={viewerRef}
            contentRef={contentRef}
            onResize={(width, height) => {
                setZoomManager((z) => z.setViewerSize({ width, height }));
            }}
            onClick={() => {
                window.clearTimeout(timerRef.current);
                timerRef.current = window.setTimeout(() => {
                    setShouldShowInfo((v) => !v);
                }, 300);
            }}
            onDoubleClick={() => {
                window.clearTimeout(timerRef.current);
                zoomIn(viewerRef.current, contentRef.current);
            }}
            onRightClick={() => {
                zoomOut(viewerRef.current, contentRef.current);
            }}
            onLongPress={() => {
                zoomOut(viewerRef.current, contentRef.current);
            }}
            onLeftSidePull={() =>
                goToLeft(viewerRef.current, contentRef.current)
            }
            onRightSidePull={() =>
                goToRight(viewerRef.current, contentRef.current)
            }
        >
            <Img viewerRef={viewerRef} contentRef={contentRef} />
            <ChevronLeft />
            <ChevronRight />
        </Viewer>
    );
};

/* -------------------------------------------------------------------------- */

const Viewer = ({
    viewerRef,
    contentRef,
    children,
    onResize,
    onClick,
    onDoubleClick,
    onRightClick,
    onLongPress,
    onLeftSidePull,
    onRightSidePull,
}: {
    viewerRef: React.RefObject<HTMLDivElement | null>;
    contentRef: React.RefObject<HTMLDivElement | null>;
    onResize: (width: number, height: number) => void;
    onClick: () => void;
    onDoubleClick: () => void;
    onRightClick: () => void;
    onLongPress: () => void;
    onLeftSidePull: () => void;
    onRightSidePull: () => void;
    children: ReactNode;
}): JSX.Element => {
    const timerIdRef = useRef<number | undefined>(undefined);
    const prevXRef = useRef(0);
    const scrollCountRef = useRef(0);
    const canClickRef = useRef(true);
    const canDoubleClickRef = useRef(true);
    const canRightClickRef = useRef(true);
    const canLongPressRef = useRef(true);
    const touchMoveCountRef = useRef(0);
    const setOnChevronLeft = useSetAtom(onChevronLeftAtom);
    const setOnChevronRight = useSetAtom(onChevronRightAtom);
    const setIsUserScrolled = useSetAtom(Atom.isUserScrolled);

    useEffect(() => {
        const viewer = viewerRef.current;
        if (viewer == null) return;

        const observer = new ResizeObserver(() => {
            const { clientWidth, clientHeight } = viewer;
            onResize(clientWidth, clientHeight);
        });
        observer.observe(viewer);
        return (): void => {
            observer.disconnect();
        };
    }, [onResize, viewerRef]);

    return (
        <div
            className="fixed inset-0 flex h-dvh w-dvw overflow-scroll overscroll-contain bg-black select-none"
            style={{ scrollbarWidth: "none" }}
            ref={viewerRef}
            onClick={() => {
                if (canClickRef.current) {
                    onClick();
                }
            }}
            onDoubleClick={() => {
                if (canDoubleClickRef.current) {
                    onDoubleClick();
                }
            }}
            onContextMenu={(ev) => {
                ev.preventDefault();
                window.clearTimeout(timerIdRef.current);
                if (!canRightClickRef.current) return;
                onRightClick();
                canLongPressRef.current = false;
            }}
            onTouchStart={(ev) => {
                timerIdRef.current = window.setTimeout(() => {
                    if (!canLongPressRef.current) return;
                    onLongPress();
                    canClickRef.current = false;
                    canDoubleClickRef.current = false;
                    canRightClickRef.current = false;
                }, 500);
                prevXRef.current = ev.targetTouches[0].clientX;
                scrollCountRef.current = 0;
                canClickRef.current = true;
                canDoubleClickRef.current = true;
                canRightClickRef.current = true;
                canLongPressRef.current = true;
                touchMoveCountRef.current = 0;
            }}
            onTouchMove={(ev) => {
                window.clearTimeout(timerIdRef.current);
                const viewer = viewerRef.current;
                const image = contentRef.current;
                if (viewer == null || image == null) return;

                const x = ev.targetTouches[0].clientX;
                const scroll = ScrollManager.fromElement(viewer, image);
                if (scroll.isHorizontalMin() || scroll.isHorizontalMax()) {
                    scrollCountRef.current += prevXRef.current - x;
                    if (scrollCountRef.current < -100) {
                        setOnChevronLeft(true);
                    } else if (scrollCountRef.current > 100) {
                        setOnChevronRight(true);
                    } else {
                        setOnChevronLeft(false);
                        setOnChevronRight(false);
                    }
                }
                prevXRef.current = x;
            }}
            onTouchEnd={() => {
                window.clearTimeout(timerIdRef.current);
                setOnChevronLeft(false);
                setOnChevronRight(false);

                if (scrollCountRef.current < -100) {
                    onLeftSidePull();
                } else if (scrollCountRef.current > 100) {
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

/* -------------------------------------------------------------------------- */

const applyScrollAtom = atom(
    null,
    (get, _, viewer: Viewer, content: Content) => {
        if (viewer == null || content == null) return;
        get(Atom.scrollManager).applyScroll(viewer, content);
    },
);

const Img = ({
    viewerRef,
    contentRef,
}: {
    viewerRef: React.RefObject<Viewer>;
    contentRef: React.RefObject<Content>;
}): JSX.Element => {
    const leftImageBlob = useAtomValue(Atom.currentLeftImageBlob);
    const rightImageBlob = useAtomValue(Atom.currentRightImageBlob);
    const sharpeningFilter = useAtomValue(Atom.sharpeningFilter);
    const { sharpeningFilterStrength, onSharpeningFilter } = useAtomValue(
        Atom.appStore,
    );
    const applyScroll = useSetAtom(applyScrollAtom);

    useEffect(() => {
        const content = contentRef.current;
        if (content == null) return;

        if (!sharpeningFilter.hasSVG()) {
            sharpeningFilter.addSVG();
            sharpeningFilter.setStrength(sharpeningFilterStrength);
        }
        if (onSharpeningFilter) {
            sharpeningFilter.applyFilter(content);
        } else {
            sharpeningFilter.clearFilter(content);
        }
    }, [
        contentRef,
        onSharpeningFilter,
        sharpeningFilter,
        sharpeningFilterStrength,
    ]);

    useEffect(() => {
        const content = contentRef.current;
        if (content == null) return;

        const observer = new MutationObserver(() => {
            applyScroll(viewerRef.current, content);
        });
        observer.observe(content, { attributes: true, subtree: true });
        return (): void => observer.disconnect();
    }, [applyScroll, contentRef, viewerRef]);

    return (
        <div className="m-auto">
            <div
                className={`relative grid size-max items-start ${leftImageBlob != null && rightImageBlob != null && "grid-cols-2"}`}
                ref={contentRef}
            >
                <LeftImage viewerRef={viewerRef} contentRef={contentRef} />
                <RightImage viewerRef={viewerRef} contentRef={contentRef} />
                <div className="absolute inset-0" />
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */

const setupAtom = atom(null, (get, set, viewer: Viewer, content: Content) => {
    if (viewer == null || content == null) return;

    const scroll = get(Atom.scrollManager);
    scroll.applyScroll(viewer, content);
    const width = content.clientWidth;
    const height = content.clientHeight;
    set(Atom.zoomManager, (z) => z.setImageSize({ width, height }));
});

const LeftImage = ({
    viewerRef,
    contentRef,
}: {
    viewerRef: React.RefObject<Viewer>;
    contentRef: React.RefObject<Content>;
}): JSX.Element => {
    const leftImageRef = useRef<HTMLImageElement | null>(null);
    const leftImageBlob = useAtomValue(Atom.currentLeftImageBlob);
    const rightImageBlob = useAtomValue(Atom.currentRightImageBlob);
    const zoomManager = useAtomValue(Atom.zoomManager);
    const setup = useSetAtom(setupAtom);

    useEffect(() => {
        const image = leftImageRef.current;
        if (image == null || leftImageBlob == null) return;

        const imageURL = URL.createObjectURL(leftImageBlob);
        image.src = imageURL;
        return (): void => URL.revokeObjectURL(imageURL);
    }, [leftImageBlob, leftImageRef]);

    if (leftImageBlob == null) return <></>;
    return (
        <img
            className="size-auto justify-self-end object-contain"
            style={leftImgStyle(zoomManager, rightImageBlob)}
            ref={leftImageRef}
            onLoad={() => setup(viewerRef.current, contentRef.current)}
        />
    );
};

const leftImgStyle = (
    zoomManager: ZoomManager,
    rightImageBlob?: Blob,
): CSSProperties => {
    const scale = zoomManager.scale;
    return {
        maxWidth: rightImageBlob == null ? `${scale}dvw` : `${scale / 2}dvw`,
        maxHeight: `${scale}dvh`,
        WebkitTouchCallout: "none",
    };
};

/* -------------------------------------------------------------------------- */

const RightImage = ({
    viewerRef,
    contentRef,
}: {
    viewerRef: React.RefObject<Viewer>;
    contentRef: React.RefObject<Content>;
}): JSX.Element => {
    const imageRef = useRef<HTMLImageElement | null>(null);
    const leftImageBlob = useAtomValue(Atom.currentLeftImageBlob);
    const rightImageBlob = useAtomValue(Atom.currentRightImageBlob);
    const zoomManager = useAtomValue(Atom.zoomManager);
    const setup = useSetAtom(setupAtom);

    useEffect(() => {
        const image = imageRef.current;
        if (image == null || rightImageBlob == null) return;

        const imageURL = URL.createObjectURL(rightImageBlob);
        image.src = imageURL;
        return (): void => URL.revokeObjectURL(imageURL);
    }, [rightImageBlob]);

    if (rightImageBlob == null) return <></>;
    return (
        <img
            className="size-auto object-contain"
            style={rightImgStyle(zoomManager, leftImageBlob)}
            ref={imageRef}
            onLoad={() => setup(viewerRef.current, contentRef.current)}
        />
    );
};

const rightImgStyle = (
    zoomManager: ZoomManager,
    leftImageBlob?: Blob,
): CSSProperties => {
    const scale = zoomManager.scale;
    return {
        maxWidth: leftImageBlob == null ? `${scale}dvw` : `${scale / 2}dvw`,
        maxHeight: `${scale}dvh`,
        WebkitTouchCallout: "none",
    };
};

/* -------------------------------------------------------------------------- */

const ChevronLeft = (): JSX.Element => {
    const onChevronLeft = useAtomValue(onChevronLeftAtom);

    if (!onChevronLeft) return <></>;
    return (
        <div className="fixed inset-y-0 left-4 grid place-items-center">
            <CircleChevronLeft className="size-15 stroke-green-500" />
        </div>
    );
};

const ChevronRight = (): JSX.Element => {
    const onChevronRight = useAtomValue(onChevronRightAtom);

    if (!onChevronRight) return <></>;
    return (
        <div className="fixed inset-y-0 right-4 grid place-items-center">
            <CircleChevronRight className="size-15 stroke-green-500" />
        </div>
    );
};
