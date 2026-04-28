import { atom, useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useRef, type CSSProperties, type JSX } from "react";
import { AppStateAtom, Atom } from "../../../atoms";
import type { ViewerBody, ViewerContent } from "../../../models/types";
import { Viewer } from "../../../models/viewer";
import type { ZoomManager } from "../../../models/zoomManager";

const applyScrollAtom = atom(null, (get, _, viewer: Viewer) => {
    get(Atom.scrollManager).applyScroll(viewer);
});

export const Content = ({
    body,
    content,
}: {
    body: React.RefObject<ViewerBody>;
    content: React.RefObject<ViewerContent>;
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
    body: React.RefObject<ViewerBody>;
    content: React.RefObject<ViewerContent>;
}): JSX.Element => {
    const image = useRef<HTMLImageElement | null>(null);
    const leftBlob = useAtomValue(Atom.imageBlobManager).currentLeft.blob;
    const rightBlob = useAtomValue(Atom.imageBlobManager).currentRight.blob;
    const onInvertFilter = useAtomValue(Atom.onInvertFilter);
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
            className={`size-auto justify-self-end object-contain ${onInvertFilter && "invert"}`}
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
    body: React.RefObject<ViewerBody>;
    content: React.RefObject<ViewerContent>;
}): JSX.Element => {
    const image = useRef<HTMLImageElement | null>(null);
    const leftBlob = useAtomValue(Atom.imageBlobManager).currentLeft.blob;
    const rightBlob = useAtomValue(Atom.imageBlobManager).currentRight.blob;
    const onInvertFilter = useAtomValue(Atom.onInvertFilter);
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
            className={`size-auto object-contain ${onInvertFilter && "invert"}`}
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
