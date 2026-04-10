import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";
import React, {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type JSX,
} from "react";
import { Atom } from "../atoms";
import { ScrollManager } from "../models/scrollManager";
import { ZoomManager } from "../models/zoomManager";

export const ImageView = ({
    viewerRef,
    imgRef,
}: {
    viewerRef: React.RefObject<HTMLDivElement | null>;
    imgRef: React.RefObject<HTMLImageElement | null>;
}): JSX.Element => {
    const timerId = useRef<number | undefined>(undefined);
    const [zoomManager, setZoomManager] = useAtom(Atom.zoomManager);
    const [imageBlob, setImageBlob] = useAtom(Atom.imageBlob);
    const [src, setSrc] = useState<string | undefined>(undefined);
    const [appStore, setAppStore] = useAtom(Atom.appStore);
    const setToastMessage = useSetAtom(Atom.toastMessage);
    const sharpeningFilter = useAtomValue(Atom.sharpeningFilter);
    const prevX = useRef(0);
    const scrollCount = useRef(0);
    const [onChevronLeft, setOnChevronLeft] = useState(false);
    const [onChevronRight, setOnChevronRight] = useState(false);
    const setFileManager = useSetAtom(Atom.fileManager);
    const zipFileName = useAtomValue(Atom.zipFileName);
    const [historyManager, setHistoryManager] = useAtom(Atom.historyManager);

    useEffect(() => {
        if (!sharpeningFilter.hasSVG()) {
            sharpeningFilter.addSVG();
            const img = imgRef.current;
            if (img != null) {
                sharpeningFilter.applyFilter(img);
            }
        }
        if (!appStore.onSharpeningFilter) {
            sharpeningFilter.clearFilter();
        } else {
            sharpeningFilter.reapply();
            sharpeningFilter.setStrength(appStore.sharpeningFilterStrength);
        }
    }, [appStore, imgRef, sharpeningFilter]);

    useEffect(() => {
        const viewer = viewerRef.current;
        if (viewer == null) return;

        const observer = new ResizeObserver((entries) => {
            entries.forEach(() => {
                const width = viewer.clientWidth;
                const height = viewer.clientHeight;
                setZoomManager((z) => z.setViewerSize({ width, height }));
            });
        });
        observer.observe(viewer);

        return (): void => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (imageBlob == null) return;

        const imageURL = URL.createObjectURL(imageBlob);
        ((): void => {
            setSrc(imageURL);
        })();
        return (): void => {
            URL.revokeObjectURL(imageURL);
        };
    }, [imageBlob, imgRef]);

    return (
        <div
            className="fixed inset-0 flex h-dvh w-dvw overflow-scroll overscroll-contain bg-black select-none"
            ref={viewerRef}
            onDoubleClick={() => {
                setZoomManager((z) => {
                    const newZoomManager = z.zoomIn(appStore.zoomStep);
                    setToastMessage({
                        text: `${newZoomManager.scale}%`,
                        state: "visible",
                    });
                    return newZoomManager;
                });

                const viewer = viewerRef.current;
                const img = imgRef.current;
                if (viewer == null || img == null) return;

                const scrollManager = ScrollManager.create(viewer, img);
                setTimeout(() => {
                    new ScrollManager(
                        scrollManager.horizontalPercentage ?? 50,
                        scrollManager.verticalPercentage ?? 0,
                    ).applyScroll(viewer, img);
                }, 10);
            }}
            onContextMenu={(ev) => {
                ev.preventDefault();
                setZoomManager((z) => {
                    const newZoomManager = z.zoomOut(appStore.zoomStep);
                    setToastMessage({
                        text: `${newZoomManager.scale}%`,
                        state: "visible",
                    });
                    return newZoomManager;
                });

                const viewer = viewerRef.current;
                const img = imgRef.current;
                if (viewer == null || img == null) return;

                const scrollManager = ScrollManager.create(viewer, img);
                setTimeout(() => {
                    new ScrollManager(
                        scrollManager.horizontalPercentage ?? 50,
                        scrollManager.verticalPercentage ?? 0,
                    ).applyScroll(viewer, img);
                }, 10);
            }}
            onTouchStart={(ev) => {
                timerId.current = setTimeout(() => {
                    setZoomManager((z) => {
                        const newZoomManager = z.zoomOut(appStore.zoomStep);
                        setToastMessage({
                            text: `${newZoomManager.scale}%`,
                            state: "visible",
                        });
                        return newZoomManager;
                    });

                    const viewer = viewerRef.current;
                    const img = imgRef.current;
                    if (viewer == null || img == null) return;

                    const scrollManager = ScrollManager.create(viewer, img);
                    setTimeout(() => {
                        new ScrollManager(
                            scrollManager.horizontalPercentage ?? 50,
                            scrollManager.verticalPercentage ?? 0,
                        ).applyScroll(viewer, img);
                    }, 10);
                }, 500);
                prevX.current = ev.targetTouches[0].clientX;
                scrollCount.current = 0;
            }}
            onTouchMove={(ev) => {
                clearTimeout(timerId.current);

                const viewer = viewerRef.current;
                const img = imgRef.current;
                if (viewer == null || img == null) return;

                const scrollManager = ScrollManager.create(viewer, img);
                if (
                    scrollManager.isHorizontalMin() ||
                    scrollManager.isHorizontalMax()
                ) {
                    scrollCount.current +=
                        prevX.current - ev.targetTouches[0].clientX;
                    if (scrollCount.current < -100) {
                        setOnChevronLeft(true);
                    } else if (scrollCount.current > 100) {
                        setOnChevronRight(true);
                    } else {
                        setOnChevronLeft(false);
                        setOnChevronRight(false);
                    }
                    prevX.current = ev.targetTouches[0].clientX;
                }
            }}
            onTouchEnd={() => {
                clearTimeout(timerId.current);
                setOnChevronLeft(false);
                setOnChevronRight(false);

                const viewer = viewerRef.current;
                const img = imgRef.current;
                if (viewer == null || img == null) return;

                if (scrollCount.current < -100) {
                    if (appStore.writingType === "vertical") {
                        setFileManager((f) => {
                            const newFileManager = f.incrementIndex();
                            newFileManager.getBlob().then((blob) => {
                                setImageBlob(blob);
                                const scrollManager = new ScrollManager(0, 100);
                                scrollManager
                                    .next(
                                        appStore.movementDirection,
                                        appStore.writingType,
                                        appStore.viewSplitCount,
                                    )
                                    .applyScroll(viewer, img);
                                setToastMessage({
                                    text: newFileManager.progress() ?? "",
                                    state: "visible",
                                });
                                if (zipFileName != null) {
                                    const newHistoryManager =
                                        historyManager.update({
                                            name: zipFileName,
                                            index: newFileManager.index,
                                        });
                                    setHistoryManager(newHistoryManager);
                                    setAppStore((a) =>
                                        a.setHistories(
                                            newHistoryManager.histories,
                                        ),
                                    );
                                }
                            });
                            return newFileManager;
                        });
                    } else {
                        setFileManager((f) => {
                            const newFileManager = f.decrementIndex();
                            newFileManager.getBlob().then((blob) => {
                                setImageBlob(blob);
                                const scrollManager = new ScrollManager(0, 0);
                                scrollManager
                                    .previous(
                                        appStore.movementDirection,
                                        appStore.writingType,
                                        appStore.viewSplitCount,
                                    )
                                    .applyScroll(viewer, img);
                                setToastMessage({
                                    text: newFileManager.progress() ?? "",
                                    state: "visible",
                                });
                                if (zipFileName != null) {
                                    const newHistoryManager =
                                        historyManager.update({
                                            name: zipFileName,
                                            index: newFileManager.index,
                                        });
                                    setHistoryManager(newHistoryManager);
                                    setAppStore((a) =>
                                        a.setHistories(
                                            newHistoryManager.histories,
                                        ),
                                    );
                                }
                            });
                            return newFileManager;
                        });
                    }
                    return;
                }
                if (scrollCount.current > 100) {
                    if (appStore.writingType === "vertical") {
                        setFileManager((f) => {
                            const newFileManager = f.decrementIndex();
                            newFileManager.getBlob().then((blob) => {
                                setImageBlob(blob);
                                const scrollManager = new ScrollManager(100, 0);
                                scrollManager
                                    .previous(
                                        appStore.movementDirection,
                                        appStore.writingType,
                                        appStore.viewSplitCount,
                                    )
                                    .applyScroll(viewer, img);
                                setToastMessage({
                                    text: newFileManager.progress() ?? "",
                                    state: "visible",
                                });
                                if (zipFileName != null) {
                                    const newHistoryManager =
                                        historyManager.update({
                                            name: zipFileName,
                                            index: newFileManager.index,
                                        });
                                    setHistoryManager(newHistoryManager);
                                    setAppStore((a) =>
                                        a.setHistories(
                                            newHistoryManager.histories,
                                        ),
                                    );
                                }
                            });
                            return newFileManager;
                        });
                    } else {
                        setFileManager((f) => {
                            const newFileManager = f.incrementIndex();
                            newFileManager.getBlob().then((blob) => {
                                setImageBlob(blob);
                                const scrollManager = new ScrollManager(
                                    100,
                                    100,
                                );
                                scrollManager
                                    .next(
                                        appStore.movementDirection,
                                        appStore.writingType,
                                        appStore.viewSplitCount,
                                    )
                                    .applyScroll(viewer, img);
                                setToastMessage({
                                    text: newFileManager.progress() ?? "",
                                    state: "visible",
                                });
                                if (zipFileName != null) {
                                    const newHistoryManager =
                                        historyManager.update({
                                            name: zipFileName,
                                            index: newFileManager.index,
                                        });
                                    setHistoryManager(newHistoryManager);
                                    setAppStore((a) =>
                                        a.setHistories(
                                            newHistoryManager.histories,
                                        ),
                                    );
                                }
                            });
                            return newFileManager;
                        });
                    }
                    return;
                }
            }}
        >
            <img
                className="relative m-auto max-w-none"
                ref={imgRef}
                style={style(zoomManager)}
                src={src}
                onLoad={(ev) => {
                    const width = ev.currentTarget.naturalWidth;
                    const height = ev.currentTarget.naturalHeight;
                    setZoomManager((z) => z.setImageSize({ width, height }));
                }}
            />
            <div className="fixed inset-0" style={style(zoomManager)} />

            {onChevronLeft && (
                <div className="fixed inset-y-0 left-4 grid place-items-center">
                    <CircleChevronLeft className="size-15 stroke-blue-500" />
                </div>
            )}
            {onChevronRight && (
                <div className="fixed inset-y-0 right-4 grid place-items-center">
                    <CircleChevronRight className="size-15 stroke-blue-500" />
                </div>
            )}
        </div>
    );
};

/* -------------------------------------------------------------------------- */

const style = (zoomManager: ZoomManager): CSSProperties => {
    const isHorizontalFit = zoomManager.isHorizontalFit();
    const scale = zoomManager.scale;
    return {
        width: isHorizontalFit ? `${scale}%` : "auto",
        height: isHorizontalFit ? "auto" : `${scale}%`,
        //WebkitTouchCallout: "none",
    };
};
