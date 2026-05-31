import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, type CSSProperties, type JSX, type RefObject } from "react";
import { AppStateAtom, Atom } from "../../../atoms";
import type { ContentFit } from "../../../models/appState";
import type {
    ViewerBody,
    ViewerCanvas,
    ViewerManager,
} from "../../../models/viewerManager";
import { ZoomManager } from "../../../models/zoomManager";

const applyScrollAtom = atom(null, (get) => {
    get(Atom.scrollManager).applyScroll(get(Atom.viewerManager));
});

export const Content = ({
    body,
    canvas,
}: {
    body: RefObject<ViewerBody>;
    canvas: RefObject<ViewerCanvas>;
}): JSX.Element => {
    const sharpeningFilter = useAtomValue(Atom.sharpeningFilter);
    const filterStrength = useAtomValue(AppStateAtom.sharpeningFilterStrength);
    const onSharpeningFilter = useAtomValue(AppStateAtom.onSharpeningFilter);
    const onInvertFilter = useAtomValue(Atom.onInvertFilter);
    const viewerManager = useAtomValue(Atom.viewerManager);
    const zoomManager = useAtomValue(Atom.zoomManager);
    const applyScroll = useSetAtom(applyScrollAtom);
    const contentFit = useAtomValue(AppStateAtom.contentFit);

    useEffect(() => {
        if (canvas.current == null) return;

        if (!sharpeningFilter.hasSVG()) {
            sharpeningFilter.addSVG();
            sharpeningFilter.setStrength(filterStrength);
        }
        if (onSharpeningFilter) {
            sharpeningFilter.applyFilter(canvas.current);
        } else {
            sharpeningFilter.clearFilter(canvas.current);
        }
    }, [canvas, filterStrength, onSharpeningFilter, sharpeningFilter]);

    useEffect(() => {
        if (body.current == null) return;

        const observer = new MutationObserver(() => {
            // 拡大・縮小されるとスクロールする
            applyScroll();
        });
        observer.observe(body.current, {
            attributes: true,
            subtree: true,
            attributeFilter: ["width", "height"],
        });
        return (): void => observer.disconnect();
    }, [applyScroll, canvas, body]);

    return (
        <div
            className={`flex ${onInvertFilter ? "invert" : ""}`}
            style={contentStyle(zoomManager, contentFit, viewerManager)}
        >
            <CanvasView canvasRef={canvas} />
        </div>
    );
};

const contentStyle = (
    zoomManager: ZoomManager,
    contentFit: ContentFit,
    viewerManager: ViewerManager,
): CSSProperties => {
    const scale = `${zoomManager.scale}%`;
    if (viewerManager.isImageWiderThanViewer() == null) {
        return { width: "100%", height: "100%" };
    }
    switch (contentFit) {
        case "all":
            return {
                width: viewerManager.isImageWiderThanViewer() ? scale : "100%",
                height: viewerManager.isImageWiderThanViewer() ? "100%" : scale,
            };
        case "fill":
            return {
                width: viewerManager.isImageWiderThanViewer() ? "100%" : scale,
                height: viewerManager.isImageWiderThanViewer() ? scale : "100%",
            };
    }
};

/* -------------------------------------------------------------------------- */

const CanvasView = ({
    canvasRef,
}: {
    canvasRef: RefObject<ViewerCanvas>;
}): JSX.Element => {
    const imageBlobManager = useAtomValue(Atom.imageBlobManager);
    const [viewerManager, setViewerManager] = useAtom(Atom.viewerManager);
    const contentFit = useAtomValue(AppStateAtom.contentFit);

    useEffect(() => {
        let isMounted = true;
        const canvas = canvasRef.current;
        if (canvas == null) return;
        const ctx = canvas.getContext("2d");
        if (ctx == null) return;

        Promise.all([
            loadImage(imageBlobManager.currentLeft.blob),
            loadImage(imageBlobManager.currentRight.blob),
        ]).then(([img1, img2]) => {
            // 描画が間に合わないほどの間隔でファイルが渡された場合、描画をスキップする
            if (!isMounted) return;

            const width = (img1?.width ?? 0) + (img2?.width ?? 0);
            const height = Math.max(img1?.height ?? 0, img2?.height ?? 0);
            setViewerManager((v) =>
                v.setCanvas(canvas).setImageSize({ width, height }),
            );

            // canvasのstyleを先に更新させるため、描画を遅延する
            window.setTimeout(() => {
                canvas.width = width;
                canvas.height = height;
                if (img1 != null) ctx.drawImage(img1, 0, 0);
                if (img2 != null) ctx.drawImage(img2, img1?.width ?? 0, 0);
            }, 10);
        });
        return (): void => {
            isMounted = false;
        };
    }, [canvasRef, imageBlobManager, setViewerManager]);

    return (
        <canvas
            className="m-auto"
            style={{
                paddingLeft: "env(safe-area-inset-left)",
                paddingRight: "env(safe-area-inset-right)",
                ...canvasStyle(contentFit, viewerManager),
            }}
            ref={canvasRef}
        />
    );
};

const loadImage = async (
    blob?: Blob,
): Promise<HTMLImageElement | undefined> => {
    return new Promise((resolve) => {
        if (blob == null) {
            resolve(undefined);
            return;
        }

        const img = new Image();
        img.onload = (): void => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = (): void => {
            URL.revokeObjectURL(url);
            resolve(undefined);
        };

        const url = URL.createObjectURL(blob);
        img.src = url;
    });
};

const canvasStyle = (
    contentFit: ContentFit,
    viewerManager: ViewerManager,
): CSSProperties => {
    if (viewerManager.isImageWiderThanViewer() == null) {
        return { width: "100%", height: "100%", objectFit: "contain" };
    }
    switch (contentFit) {
        case "all":
            return {
                width: viewerManager.isImageWiderThanViewer() ? "100%" : "auto",
                height: viewerManager.isImageWiderThanViewer()
                    ? "auto"
                    : "100%",
            };
        case "fill":
            return {
                width: viewerManager.isImageWiderThanViewer() ? "auto" : "100%",
                height: viewerManager.isImageWiderThanViewer()
                    ? "100%"
                    : "auto",
            };
    }
};
