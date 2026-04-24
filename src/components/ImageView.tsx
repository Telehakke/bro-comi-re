import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import {
    CircleChevronLeft,
    CircleChevronRight,
    Image as Content,
} from "lucide-react";
import React, {
    useEffect,
    useRef,
    type CSSProperties,
    type JSX,
    type ReactNode,
} from "react";
import { ActionAtom, Atom } from "../atoms";
import { ScrollManager } from "../models/scrollManager";
import { ZoomManager } from "../models/zoomManager";

type Viewer = HTMLDivElement | null;
type Content = HTMLDivElement | null;

const onChevronLeftAtom = atom(false);
const onChevronRightAtom = atom(false);

const zoomInAtom = atom(null, (get, set, viewer: Viewer, content: Content) => {
    if (viewer == null || content == null) return;
    set(Atom.scrollManager, (s) => s.update(viewer, content));

    const appStore = get(Atom.appStore);
    const zoomManager = get(Atom.zoomManager).zoomIn(appStore.zoomStep);
    set(Atom.zoomManager, zoomManager);
    set(Atom.messageManager, (m) => m.setMessage(`${zoomManager.scale}%`));
});

const zoomOutAtom = atom(null, (get, set, viewer: Viewer, content: Content) => {
    if (viewer == null || content == null) return;
    set(Atom.scrollManager, (s) => s.update(viewer, content));

    const appStore = get(Atom.appStore);
    const zoomManager = get(Atom.zoomManager).zoomOut(appStore.zoomStep);
    set(Atom.zoomManager, zoomManager);
    set(Atom.messageManager, (m) => m.setMessage(`${zoomManager.scale}%`));
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
            } else {
                set(Atom.messageManager, (m) =>
                    m.setMessage("最後のファイルです"),
                );
            }
        } else {
            if (get(Atom.fileManager).hasPreviousFile()) {
                set(ActionAtom.moveToPreviousPage);
                set(ActionAtom.scrollToEnd, viewer, content);
            } else {
                set(Atom.messageManager, (m) =>
                    m.setMessage("最初のファイルです"),
                );
            }
        }
        //set(ActionAtom.updateHistory);
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
            } else {
                set(Atom.messageManager, (m) =>
                    m.setMessage("最初のファイルです"),
                );
            }
        } else {
            if (get(Atom.fileManager).hasNextFile()) {
                set(ActionAtom.moveToNextPage);
                set(ActionAtom.scrollToStart, viewer, content);
            } else {
                set(Atom.messageManager, (m) =>
                    m.setMessage("最後のファイルです"),
                );
            }
        }
        //set(ActionAtom.updateHistory);
    },
);

export const ImageView = ({
    viewerRef,
    contentRef,
}: {
    viewerRef: React.RefObject<HTMLDivElement | null>;
    contentRef: React.RefObject<HTMLDivElement | null>;
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
                setZoomManager((z) => {
                    const newState = z.setViewerSize({ width, height });
                    return newState;
                });
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
            onRightClick={() => zoomOut(viewerRef.current, contentRef.current)}
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
    const timerId = useRef<number | undefined>(undefined);
    const prevX = useRef(0);
    const scrollCount = useRef(0);
    const canClick = useRef(true);
    const canDoubleClick = useRef(true);
    const touchMoveCount = useRef(0);
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
            ref={viewerRef}
            onClick={() => {
                if (canClick.current) {
                    onClick();
                }
            }}
            onDoubleClick={() => {
                if (canDoubleClick.current) {
                    onDoubleClick();
                }
            }}
            onContextMenu={(ev) => {
                ev.preventDefault();
                onRightClick();
            }}
            onTouchStart={(ev) => {
                timerId.current = window.setTimeout(() => {
                    onLongPress();
                    canClick.current = false;
                    canDoubleClick.current = false;
                }, 500);
                prevX.current = ev.targetTouches[0].clientX;
                scrollCount.current = 0;
                canClick.current = true;
                canDoubleClick.current = true;
                touchMoveCount.current = 0;
            }}
            onTouchMove={(ev) => {
                setIsUserScrolled(true);
                if (touchMoveCount.current > 5) {
                    window.clearTimeout(timerId.current);
                }
                touchMoveCount.current += 1;

                const viewer = viewerRef.current;
                const image = contentRef.current;
                if (viewer == null || image == null) return;

                const sm = ScrollManager.createFromElement(viewer, image);
                if (sm.isHorizontalMin() || sm.isHorizontalMax()) {
                    const x = ev.targetTouches[0].clientX;
                    scrollCount.current += prevX.current - x;
                    if (scrollCount.current < -100) {
                        setOnChevronLeft(true);
                    } else if (scrollCount.current > 100) {
                        setOnChevronRight(true);
                    } else {
                        setOnChevronLeft(false);
                        setOnChevronRight(false);
                    }
                    prevX.current = x;
                }
            }}
            onTouchEnd={() => {
                window.clearTimeout(timerId.current);
                setOnChevronLeft(false);
                setOnChevronRight(false);

                if (scrollCount.current < -100) {
                    onLeftSidePull();
                } else if (scrollCount.current > 100) {
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

const applyScrollAtom = atom(null, (get, _, viewer: Viewer, image: Content) => {
    if (viewer == null || image == null) return;
    get(Atom.scrollManager).applyScroll(viewer, image);
});

const Img = ({
    viewerRef,
    contentRef: contentRef,
}: {
    viewerRef: React.RefObject<HTMLDivElement | null>;
    contentRef: React.RefObject<HTMLDivElement | null>;
}): JSX.Element => {
    const leftImgRef = useRef<HTMLImageElement | null>(null);
    const rightImgRef = useRef<HTMLImageElement | null>(null);
    const leftImageBlob = useAtomValue(Atom.currentLeftImageBlob);
    const rightImageBlob = useAtomValue(Atom.currentRightImageBlob);
    const sharpeningFilter = useAtomValue(Atom.sharpeningFilter);
    const appStore = useAtomValue(Atom.appStore);
    const [zoomManager, setZoomManager] = useAtom(Atom.zoomManager);
    const scrollManager = useAtomValue(Atom.scrollManager);
    const applyScroll = useSetAtom(applyScrollAtom);

    useEffect(() => {
        const image = leftImgRef.current;
        if (image == null || leftImageBlob == null) return;

        const imageURL = URL.createObjectURL(leftImageBlob);
        image.src = imageURL;
        return (): void => {
            URL.revokeObjectURL(imageURL);
        };
    }, [leftImageBlob]);

    useEffect(() => {
        const image = rightImgRef.current;
        if (image == null || rightImageBlob == null) return;

        const imageURL = URL.createObjectURL(rightImageBlob);
        image.src = imageURL;
        return (): void => {
            URL.revokeObjectURL(imageURL);
        };
    }, [rightImageBlob]);

    useEffect(() => {
        const content = contentRef.current;
        if (content == null) return;

        if (!sharpeningFilter.hasSVG()) {
            sharpeningFilter.addSVG();
            sharpeningFilter.setStrength(appStore.sharpeningFilterStrength);
        }
        if (appStore.onSharpeningFilter) {
            sharpeningFilter.applyFilter(content);
        } else {
            sharpeningFilter.clearFilter(content);
        }
    }, [
        appStore.onSharpeningFilter,
        appStore.sharpeningFilterStrength,
        contentRef,
        sharpeningFilter,
    ]);

    useEffect(() => {
        const content = contentRef.current;
        if (content == null) return;

        const observer = new MutationObserver(() => {
            applyScroll(viewerRef.current, contentRef.current);
        });
        observer.observe(content, { attributes: true, subtree: true });
        return (): void => {
            observer.disconnect();
        };
    }, [applyScroll, contentRef, viewerRef]);

    const handleLeftImgLoad = (): void => {
        const viewer = viewerRef.current;
        const content = contentRef.current;
        if (viewer == null || content == null) return;

        scrollManager.applyScroll(viewer, content);
        const width = content.clientWidth;
        const height = content.clientHeight;
        setZoomManager((z) => z.setImageSize({ width, height }));
    };

    const handleRightImgLoad = (): void => {
        const viewer = viewerRef.current;
        const content = contentRef.current;
        if (viewer == null || content == null) return;

        scrollManager.applyScroll(viewer, content);
        const width = content.clientWidth;
        const height = content.clientHeight;
        setZoomManager((z) => z.setImageSize({ width, height }));
    };

    return (
        <div className="m-auto">
            <div
                className={`relative grid size-max items-start ${leftImageBlob != null && rightImageBlob != null && "grid-cols-2"}`}
                ref={contentRef}
            >
                {leftImageBlob != null && (
                    <img
                        className="size-full max-w-none justify-self-end object-contain"
                        style={leftImgStyle(zoomManager, rightImageBlob)}
                        ref={leftImgRef}
                        onLoad={handleLeftImgLoad}
                    />
                )}
                {rightImageBlob != null && (
                    <img
                        className="size-full max-w-none object-contain"
                        style={rightImgStyle(zoomManager, leftImageBlob)}
                        ref={rightImgRef}
                        onLoad={handleRightImgLoad}
                    />
                )}
                <div className="absolute inset-0" />
            </div>
        </div>
    );
};

const leftImgStyle = (
    zoomManager: ZoomManager,
    rightImageBlob?: Blob,
): CSSProperties => {
    const scale = zoomManager.scale;
    return {
        width: "auto",
        height: "auto",
        maxWidth: rightImageBlob == null ? `${scale}dvw` : `${scale / 2}dvw`,
        maxHeight: `${scale}dvh`,
        WebkitTouchCallout: "none",
    };
};

const rightImgStyle = (
    zoomManager: ZoomManager,
    leftImageBlob?: Blob,
): CSSProperties => {
    const scale = zoomManager.scale;
    return {
        width: "auto",
        height: "auto",
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
