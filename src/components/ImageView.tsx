import { atom, useAtomValue, useSetAtom } from "jotai";
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";
import React, {
    useEffect,
    useRef,
    type CSSProperties,
    type JSX,
    type ReactNode,
} from "react";
import { ActionAtom, AppStateAtom, Atom } from "../atoms";
import { PullManager } from "../models/pullManager";
import type { Body, Content } from "../models/types";
import { Viewer } from "../models/viewer";
import { ZoomManager } from "../models/zoomManager";

const onChevronLeftAtom = atom(false);
const onChevronRightAtom = atom(false);

const zoomInAtom = atom(null, (get, set, viewer: Viewer) => {
    set(Atom.scrollManager, (s) => s.update(viewer));
    const { zoomStep } = get(Atom.appStore);
    const zoom = get(Atom.zoomManager).zoomIn(zoomStep);
    set(Atom.zoomManager, zoom);
    set(Atom.messageManager, (m) => m.setMessage(`${zoom.scale}%`));
});

const zoomOutAtom = atom(null, (get, set, viewer: Viewer) => {
    set(Atom.scrollManager, (s) => s.update(viewer));
    const { zoomStep } = get(Atom.appStore);
    const zoom = get(Atom.zoomManager).zoomOut(zoomStep);
    set(Atom.zoomManager, zoom);
    set(Atom.messageManager, (m) => m.setMessage(`${zoom.scale}%`));
});

const goToLeftAtom = atom(null, (get, set) => {
    const { writingType } = get(Atom.appStore);
    switch (writingType) {
        case "vertical":
            set(ActionAtom.moveToNextPage);
            set(ActionAtom.positionStart);
            break;
        case "horizontal":
            set(ActionAtom.moveToPreviousPage);
            set(ActionAtom.positionEnd);
            break;
    }
});

const goToRightAtom = atom(null, (get, set) => {
    const { writingType } = get(Atom.appStore);
    switch (writingType) {
        case "vertical":
            set(ActionAtom.moveToPreviousPage);
            set(ActionAtom.positionEnd);
            break;

        case "horizontal":
            set(ActionAtom.moveToNextPage);
            set(ActionAtom.positionStart);
            break;
    }
});

export const ImageView = ({
    body,
    content,
}: {
    body: React.RefObject<Body>;
    content: React.RefObject<Content>;
}): JSX.Element => {
    const timerId = useRef<number | undefined>(undefined);
    const setZoomManager = useSetAtom(Atom.zoomManager);
    const setShouldShowInfo = useSetAtom(Atom.shouldShowInfo);
    const zoomIn = useSetAtom(zoomInAtom);
    const zoomOut = useSetAtom(zoomOutAtom);
    const goToLeft = useSetAtom(goToLeftAtom);
    const goToRight = useSetAtom(goToRightAtom);

    const createViewer = (): Viewer => {
        return Viewer.create(body.current, content.current);
    };

    return (
        <Body
            body={body}
            content={content}
            onResize={(width, height) =>
                setZoomManager((z) => z.setBodySize({ width, height }))
            }
            onClick={() => {
                window.clearTimeout(timerId.current);
                timerId.current = window.setTimeout(() => {
                    setShouldShowInfo((v) => !v);
                }, 300);
            }}
            onDoubleClick={() => {
                window.clearTimeout(timerId.current);
                zoomIn(createViewer());
            }}
            onRightClick={() => zoomOut(createViewer())}
            onLongPress={() => zoomOut(createViewer())}
            onLeftSidePull={() => goToLeft()}
            onRightSidePull={() => goToRight()}
        >
            <Img body={body} content={content} />
            <ChevronLeft />
            <ChevronRight />
        </Body>
    );
};

/* -------------------------------------------------------------------------- */

const Body = ({
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
    body: React.RefObject<Body>;
    content: React.RefObject<Content>;
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
    const setOnChevronLeft = useSetAtom(onChevronLeftAtom);
    const setOnChevronRight = useSetAtom(onChevronRightAtom);
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

/* -------------------------------------------------------------------------- */

const applyScrollAtom = atom(null, (get, _, viewer: Viewer) => {
    get(Atom.scrollManager).applyScroll(viewer);
});

const Img = ({
    body,
    content,
}: {
    body: React.RefObject<Body>;
    content: React.RefObject<Content>;
}): JSX.Element => {
    const leftBlob = useAtomValue(Atom.imageBlobManager).currentLeft.blob;
    const rightBlob = useAtomValue(Atom.imageBlobManager).currentRight.blob;
    const sharpeningFilter = useAtomValue(Atom.sharpeningFilter);
    const filterStrength = useAtomValue(AppStateAtom.sharpeningFilterStrength);
    const onSharpeningFilter = useAtomValue(AppStateAtom.onSharpeningFilter);
    const applyScroll = useSetAtom(applyScrollAtom);

    useEffect(() => {
        if (content.current == null) return;

        if (!sharpeningFilter.hasSVG()) {
            sharpeningFilter.addSVG();
            sharpeningFilter.setStrength(filterStrength);
        }
        if (onSharpeningFilter) {
            sharpeningFilter.applyFilter(content.current);
        } else {
            sharpeningFilter.clearFilter(content.current);
        }
    }, [content, filterStrength, onSharpeningFilter, sharpeningFilter]);

    useEffect(() => {
        if (content.current == null) return;

        const observer = new MutationObserver(() => {
            // <LeftImage>と<RightImage>が拡大・縮小されるとスクロールする
            applyScroll(Viewer.create(body.current, content.current));
        });
        observer.observe(content.current, { attributes: true, subtree: true });
        return (): void => observer.disconnect();
    }, [applyScroll, content, body]);

    return (
        <div className="m-auto">
            <div
                className={`relative grid size-max items-start ${leftBlob != null && rightBlob != null && "grid-cols-2"}`}
                ref={content}
            >
                <LeftImage body={body} content={content} />
                <RightImage body={body} content={content} />
                <div className="absolute inset-0" />
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */

const setupAtom = atom(null, (get, set, viewer: Viewer) => {
    const scroll = get(Atom.scrollManager);
    scroll.applyScroll(viewer);
    if (viewer.content == null) return;

    const width = viewer.content.clientWidth;
    const height = viewer.content.clientHeight;
    set(Atom.zoomManager, (z) => z.setContentSize({ width, height }));
});

const LeftImage = ({
    body,
    content,
}: {
    body: React.RefObject<Body>;
    content: React.RefObject<Content>;
}): JSX.Element => {
    const image = useRef<HTMLImageElement | null>(null);
    const leftBlob = useAtomValue(Atom.imageBlobManager).currentLeft.blob;
    const rightBlob = useAtomValue(Atom.imageBlobManager).currentRight.blob;
    const zoomManager = useAtomValue(Atom.zoomManager);
    const setup = useSetAtom(setupAtom);

    useEffect(() => {
        if (image.current == null || leftBlob == null) return;

        const imageURL = URL.createObjectURL(leftBlob);
        image.current.src = imageURL;
        return (): void => URL.revokeObjectURL(imageURL);
    }, [leftBlob, image]);

    if (leftBlob == null) return <></>;
    return (
        <img
            className="size-auto justify-self-end object-contain"
            style={leftImgStyle(zoomManager, rightBlob)}
            ref={image}
            onLoad={() => setup(Viewer.create(body.current, content.current))}
        />
    );
};

const leftImgStyle = (
    zoomManager: ZoomManager,
    rightBlob?: Blob,
): CSSProperties => {
    const scale = zoomManager.scale;
    return {
        maxWidth: rightBlob == null ? `${scale}dvw` : `${scale / 2}dvw`,
        maxHeight: `${scale}dvh`,
        WebkitTouchCallout: "none",
    };
};

/* -------------------------------------------------------------------------- */

const RightImage = ({
    body,
    content,
}: {
    body: React.RefObject<Body>;
    content: React.RefObject<Content>;
}): JSX.Element => {
    const image = useRef<HTMLImageElement | null>(null);
    const leftBlob = useAtomValue(Atom.imageBlobManager).currentLeft.blob;
    const rightBlob = useAtomValue(Atom.imageBlobManager).currentRight.blob;
    const zoomManager = useAtomValue(Atom.zoomManager);
    const setup = useSetAtom(setupAtom);

    useEffect(() => {
        if (image.current == null || rightBlob == null) return;

        const imageURL = URL.createObjectURL(rightBlob);
        image.current.src = imageURL;
        return (): void => URL.revokeObjectURL(imageURL);
    }, [rightBlob]);

    if (rightBlob == null) return <></>;
    return (
        <img
            className="size-auto object-contain"
            style={rightImgStyle(zoomManager, leftBlob)}
            ref={image}
            onLoad={() => setup(Viewer.create(body.current, content.current))}
        />
    );
};

const rightImgStyle = (
    zoomManager: ZoomManager,
    leftBlob?: Blob,
): CSSProperties => {
    const scale = zoomManager.scale;
    return {
        maxWidth: leftBlob == null ? `${scale}dvw` : `${scale / 2}dvw`,
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
