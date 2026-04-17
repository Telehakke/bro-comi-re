import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
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
import { ZoomManager } from "../models/zoomManager";

type Viewer = HTMLDivElement | null;
type Image = HTMLImageElement | null;

const onChevronLeftAtom = atom(false);
const onChevronRightAtom = atom(false);

const zoomInAtom = atom(null, (get, set) => {
    const appStore = get(Atom.appStore);
    const zoomManager = get(Atom.zoomManager).zoomIn(appStore.zoomStep);
    set(Atom.zoomManager, zoomManager);
    set(Atom.messageManager, (m) => m.setMessage(`${zoomManager.scale}%`));
});

const zoomOutAtom = atom(null, (get, set) => {
    const appStore = get(Atom.appStore);
    const zoomManager = get(Atom.zoomManager).zoomOut(appStore.zoomStep);
    set(Atom.zoomManager, zoomManager);
    set(Atom.messageManager, (m) => m.setMessage(`${zoomManager.scale}%`));
});

const goToLeftAtom = atom(null, (get, set, viewer: Viewer, image: Image) => {
    if (viewer == null || image == null) return;
    const { writingType } = get(Atom.appStore);
    if (writingType === "vertical") {
        set(ActionAtom.moveToNextPage);
        set(ActionAtom.scrollToStart, viewer, image);
    } else {
        set(ActionAtom.moveToPreviousPage);
        set(ActionAtom.scrollToEnd, viewer, image);
    }
    set(ActionAtom.updateHistory);
});

const goToRightAtom = atom(null, (get, set, viewer: Viewer, image: Image) => {
    if (viewer == null || image == null) return;
    const { writingType } = get(Atom.appStore);
    if (writingType === "vertical") {
        set(ActionAtom.moveToPreviousPage);
        set(ActionAtom.scrollToEnd, viewer, image);
    } else {
        set(ActionAtom.moveToNextPage);
        set(ActionAtom.scrollToStart, viewer, image);
    }
    set(ActionAtom.updateHistory);
});

export const ImageView = ({
    viewerRef,
    imageRef,
}: {
    viewerRef: React.RefObject<HTMLDivElement | null>;
    imageRef: React.RefObject<HTMLImageElement | null>;
}): JSX.Element => {
    const setZoomManager = useSetAtom(Atom.zoomManager);
    const setScrollManager = useSetAtom(Atom.scrollManager);
    const zoomIn = useSetAtom(zoomInAtom);
    const zoomOut = useSetAtom(zoomOutAtom);
    const goToLeft = useSetAtom(goToLeftAtom);
    const goToRight = useSetAtom(goToRightAtom);

    return (
        <Viewer
            viewerRef={viewerRef}
            imageRef={imageRef}
            onResize={(width, height) =>
                setZoomManager((z) => z.setViewerSize({ width, height }))
            }
            onScroll={(element) => {
                const image = imageRef.current;
                if (image == null) return;
                setScrollManager(
                    ScrollManager.createFromElement(element, image),
                );
            }}
            onDoubleClick={zoomIn}
            onRightClick={zoomOut}
            onLongPress={zoomOut}
            onLeftSidePull={() => goToLeft(viewerRef.current, imageRef.current)}
            onRightSidePull={() =>
                goToRight(viewerRef.current, imageRef.current)
            }
        >
            <Img viewerRef={viewerRef} imageRef={imageRef} />
            <ChevronLeft />
            <ChevronRight />
        </Viewer>
    );
};

/* -------------------------------------------------------------------------- */

const Viewer = ({
    viewerRef,
    imageRef,
    children,
    onResize,
    onScroll,
    onDoubleClick,
    onRightClick,
    onLongPress,
    onLeftSidePull,
    onRightSidePull,
}: {
    viewerRef: React.RefObject<HTMLDivElement | null>;
    imageRef: React.RefObject<HTMLImageElement | null>;
    onResize: (width: number, height: number) => void;
    onScroll: (element: HTMLDivElement) => void;
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
    const canDoubleClick = useRef(true);
    const setOnChevronLeft = useSetAtom(onChevronLeftAtom);
    const setOnChevronRight = useSetAtom(onChevronRightAtom);

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
            onScroll={(ev) => onScroll(ev.currentTarget)}
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
                    canDoubleClick.current = false;
                }, 500);
                prevX.current = ev.targetTouches[0].clientX;
                scrollCount.current = 0;
                canDoubleClick.current = true;
            }}
            onTouchMove={(ev) => {
                window.clearTimeout(timerId.current);

                const viewer = viewerRef.current;
                const image = imageRef.current;
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
        >
            {children}
        </div>
    );
};

/* -------------------------------------------------------------------------- */

const Img = ({
    viewerRef,
    imageRef,
}: {
    viewerRef: React.RefObject<HTMLDivElement | null>;
    imageRef: React.RefObject<HTMLImageElement | null>;
}): JSX.Element => {
    const divRef = useRef<HTMLDivElement | null>(null);
    const imageBlob = useAtomValue(Atom.imageBlob);
    const sharpeningFilter = useAtomValue(Atom.sharpeningFilter);
    const appStore = useAtomValue(Atom.appStore);
    const [zoomManager, setZoomManager] = useAtom(Atom.zoomManager);
    const scrollManager = useAtomValue(Atom.scrollManager);

    useEffect(() => {
        const image = imageRef.current;
        if (image == null || imageBlob == null) return;

        const imageURL = URL.createObjectURL(imageBlob);
        image.src = imageURL;
        return (): void => {
            URL.revokeObjectURL(imageURL);
        };
    }, [imageBlob, imageRef]);

    useEffect(() => {
        const image = imageRef.current;
        if (image == null) return;

        if (!sharpeningFilter.hasSVG()) {
            sharpeningFilter.addSVG();
            sharpeningFilter.setStrength(appStore.sharpeningFilterStrength);
        }
        if (appStore.onSharpeningFilter) {
            sharpeningFilter.applyFilter(image);
        } else {
            sharpeningFilter.clearFilter(image);
        }
    }, [
        appStore.onSharpeningFilter,
        appStore.sharpeningFilterStrength,
        imageRef,
        sharpeningFilter,
    ]);

    useEffect(() => {
        const viewer = viewerRef.current;
        const image = imageRef.current;
        const div = divRef.current;
        if (viewer == null || image == null || div == null) return;

        const observer = new MutationObserver(() => {
            scrollManager.applyScroll(viewer, image);
            div.style.minWidth = `${image.clientWidth}px`;
            div.style.minHeight = `${image.clientHeight}px`;
        });
        observer.observe(image, { attributes: true });
        return (): void => {
            observer.disconnect();
        };
    }, [imageRef, scrollManager, viewerRef]);

    const handleLoad = (
        ev: React.SyntheticEvent<HTMLImageElement, Event>,
    ): void => {
        const width = ev.currentTarget.naturalWidth;
        const height = ev.currentTarget.naturalHeight;
        setZoomManager((z) => z.setImageSize({ width, height }));
    };

    return (
        <>
            <img
                className="m-auto max-w-none"
                ref={imageRef}
                style={style(zoomManager)}
                onLoad={handleLoad}
            />
            <div className="absolute inset-0" ref={divRef} />
        </>
    );
};

const style = (zoomManager: ZoomManager): CSSProperties => {
    const isHorizontalFit = zoomManager.isHorizontalFit();
    const scale = zoomManager.scale;
    return {
        width: isHorizontalFit ? `${scale}%` : "auto",
        height: isHorizontalFit ? "auto" : `${scale}%`,
        WebkitTouchCallout: "none",
    };
};

/* -------------------------------------------------------------------------- */

const ChevronLeft = (): JSX.Element => {
    const onChevronLeft = useAtomValue(onChevronLeftAtom);

    if (!onChevronLeft) return <></>;
    return (
        <div className="fixed inset-y-0 left-4 grid place-items-center">
            <CircleChevronLeft className="size-15 stroke-blue-500" />
        </div>
    );
};

const ChevronRight = (): JSX.Element => {
    const onChevronRight = useAtomValue(onChevronRightAtom);

    if (!onChevronRight) return <></>;
    return (
        <div className="fixed inset-y-0 right-4 grid place-items-center">
            <CircleChevronRight className="size-15 stroke-blue-500" />
        </div>
    );
};
