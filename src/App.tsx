import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useRef, type JSX } from "react";
import { Atom } from "./atoms";
import { ImageView } from "./components/ImageView";
import { MenuButton, SideMenu } from "./components/SideMenu";
import { TapAreas } from "./components/TapAreas";
import { Toast } from "./components/Toast";
import { FileManager } from "./models/fileManager";
import { HistoryManager } from "./models/historyManager";
import { ScrollManager } from "./models/scrollManager";

export const App = (): JSX.Element => {
    const viewerRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const zoomManager = useAtomValue(Atom.zoomManager);
    const [fileManager, setFileManager] = useAtom(Atom.fileManager);
    const setImageBlob = useSetAtom(Atom.imageBlob);
    const [appStore, setAppStore] = useAtom(Atom.appStore);
    const setToastMessage = useSetAtom(Atom.toastMessage);
    const [historyManager, setHistoryManager] = useAtom(Atom.historyManager);
    const zipFileName = useAtomValue(Atom.zipFileName);

    const handleBottomClick = (): void => {
        if (!appStore.shouldAdvance) return;

        const viewer = viewerRef.current;
        const image = imgRef.current;
        if (viewer == null || image == null) return;

        const scrollManager = ScrollManager.create(viewer, image);
        if (scrollManager.shouldMoveToPreviousPage(appStore.writingType)) {
            setFileManager((f) => {
                const newFileManager = f.decrementIndex();
                newFileManager.getBlob().then((blob) => {
                    setImageBlob(blob);
                    scrollManager
                        .previous(
                            appStore.movementDirection,
                            appStore.writingType,
                            appStore.viewSplitCount,
                        )
                        .applyScroll(viewer, image);
                });
                setToastMessage({
                    text: newFileManager.progress() ?? "",
                    state: "visible",
                });
                if (zipFileName != null) {
                    const newHistoryManager = historyManager.update({
                        name: zipFileName,
                        index: newFileManager.index,
                    });
                    setHistoryManager(newHistoryManager);
                    setAppStore((a) =>
                        a.setHistories(newHistoryManager.histories),
                    );
                }
                return newFileManager;
            });
        } else {
            scrollManager
                .previous(
                    appStore.movementDirection,
                    appStore.writingType,
                    appStore.viewSplitCount,
                )
                .applyScroll(viewer, image);
        }
    };

    const handleLeftClick = (): void => {
        const viewer = viewerRef.current;
        const image = imgRef.current;
        if (viewer == null || image == null) return;

        if (appStore.shouldAdvance) {
            const scrollManager = ScrollManager.create(viewer, image);
            if (scrollManager.shouldMoveToNextPage(appStore.writingType)) {
                setFileManager((f) => {
                    const newFileManager = f.incrementIndex();
                    newFileManager.getBlob().then((blob) => {
                        setImageBlob(blob);
                        scrollManager
                            .next(
                                appStore.movementDirection,
                                appStore.writingType,
                                appStore.viewSplitCount,
                            )
                            .applyScroll(viewer, image);
                    });
                    setToastMessage({
                        text: newFileManager.progress() ?? "",
                        state: "visible",
                    });
                    if (zipFileName != null) {
                        const newHistoryManager = historyManager.update({
                            name: zipFileName,
                            index: newFileManager.index,
                        });
                        setHistoryManager(newHistoryManager);
                        setAppStore((a) =>
                            a.setHistories(newHistoryManager.histories),
                        );
                    }
                    return newFileManager;
                });
            } else {
                scrollManager
                    .next(
                        appStore.movementDirection,
                        appStore.writingType,
                        appStore.viewSplitCount,
                    )
                    .applyScroll(viewer, image);
            }

            return;
        }

        if (appStore.writingType === "vertical") {
            const scrollManager = ScrollManager.create(viewer, image);
            if (scrollManager.shouldMoveToNextPage(appStore.writingType)) {
                setFileManager((f) => {
                    const newFileManager = f.incrementIndex();
                    newFileManager.getBlob().then((blob) => {
                        setImageBlob(blob);
                        scrollManager
                            .next(
                                appStore.movementDirection,
                                appStore.writingType,
                                appStore.viewSplitCount,
                            )
                            .applyScroll(viewer, image);
                    });
                    setToastMessage({
                        text: newFileManager.progress() ?? "",
                        state: "visible",
                    });
                    if (zipFileName != null) {
                        const newHistoryManager = historyManager.update({
                            name: zipFileName,
                            index: newFileManager.index,
                        });
                        setHistoryManager(newHistoryManager);
                        setAppStore((a) =>
                            a.setHistories(newHistoryManager.histories),
                        );
                    }
                    return newFileManager;
                });
            } else {
                scrollManager
                    .next(
                        appStore.movementDirection,
                        appStore.writingType,
                        appStore.viewSplitCount,
                    )
                    .applyScroll(viewer, image);
            }
        }
        if (appStore.writingType === "horizontal") {
            const scrollManager = ScrollManager.create(viewer, image);
            if (scrollManager.shouldMoveToPreviousPage(appStore.writingType)) {
                setFileManager((f) => {
                    const newFileManager = f.decrementIndex();
                    newFileManager.getBlob().then((blob) => {
                        setImageBlob(blob);
                        scrollManager
                            .previous(
                                appStore.movementDirection,
                                appStore.writingType,
                                appStore.viewSplitCount,
                            )
                            .applyScroll(viewer, image);
                    });
                    setToastMessage({
                        text: newFileManager.progress() ?? "",
                        state: "visible",
                    });
                    if (zipFileName != null) {
                        const newHistoryManager = historyManager.update({
                            name: zipFileName,
                            index: newFileManager.index,
                        });
                        setHistoryManager(newHistoryManager);
                        setAppStore((a) =>
                            a.setHistories(newHistoryManager.histories),
                        );
                    }
                    return newFileManager;
                });
            } else {
                scrollManager
                    .previous(
                        appStore.movementDirection,
                        appStore.writingType,
                        appStore.viewSplitCount,
                    )
                    .applyScroll(viewer, image);
            }
        }
    };

    const handleRightClick = (): void => {
        const viewer = viewerRef.current;
        const image = imgRef.current;
        if (viewer == null || image == null) return;

        if (appStore.shouldAdvance) {
            const scrollManager = ScrollManager.create(viewer, image);
            if (scrollManager.shouldMoveToNextPage(appStore.writingType)) {
                setFileManager((f) => {
                    const newFileManager = f.incrementIndex();
                    newFileManager.getBlob().then((blob) => {
                        setImageBlob(blob);
                        scrollManager
                            .next(
                                appStore.movementDirection,
                                appStore.writingType,
                                appStore.viewSplitCount,
                            )
                            .applyScroll(viewer, image);
                    });
                    setToastMessage({
                        text: newFileManager.progress() ?? "",
                        state: "visible",
                    });
                    if (zipFileName != null) {
                        const newHistoryManager = historyManager.update({
                            name: zipFileName,
                            index: newFileManager.index,
                        });
                        setHistoryManager(newHistoryManager);
                        setAppStore((a) =>
                            a.setHistories(newHistoryManager.histories),
                        );
                    }
                    return newFileManager;
                });
            } else {
                scrollManager
                    .next(
                        appStore.movementDirection,
                        appStore.writingType,
                        appStore.viewSplitCount,
                    )
                    .applyScroll(viewer, image);
            }

            return;
        }

        if (appStore.writingType === "horizontal") {
            const scrollManager = ScrollManager.create(viewer, image);
            if (scrollManager.shouldMoveToNextPage(appStore.writingType)) {
                setFileManager((f) => {
                    const newFileManager = f.incrementIndex();
                    newFileManager.getBlob().then((blob) => {
                        setImageBlob(blob);
                        scrollManager
                            .next(
                                appStore.movementDirection,
                                appStore.writingType,
                                appStore.viewSplitCount,
                            )
                            .applyScroll(viewer, image);
                    });
                    setToastMessage({
                        text: newFileManager.progress() ?? "",
                        state: "visible",
                    });
                    if (zipFileName != null) {
                        const newHistoryManager = historyManager.update({
                            name: zipFileName,
                            index: newFileManager.index,
                        });
                        setHistoryManager(newHistoryManager);
                        setAppStore((a) =>
                            a.setHistories(newHistoryManager.histories),
                        );
                    }
                    return newFileManager;
                });
            } else {
                scrollManager
                    .next(
                        appStore.movementDirection,
                        appStore.writingType,
                        appStore.viewSplitCount,
                    )
                    .applyScroll(viewer, image);
            }
        }
        if (appStore.writingType === "vertical") {
            const scrollManager = ScrollManager.create(viewer, image);
            if (scrollManager.shouldMoveToPreviousPage(appStore.writingType)) {
                setFileManager((f) => {
                    const newFileManager = f.decrementIndex();
                    newFileManager.getBlob().then((blob) => {
                        setImageBlob(blob);
                        scrollManager
                            .previous(
                                appStore.movementDirection,
                                appStore.writingType,
                                appStore.viewSplitCount,
                            )
                            .applyScroll(viewer, image);
                    });
                    setToastMessage({
                        text: newFileManager.progress() ?? "",
                        state: "visible",
                    });
                    if (zipFileName != null) {
                        const newHistoryManager = historyManager.update({
                            name: zipFileName,
                            index: newFileManager.index,
                        });
                        setHistoryManager(newHistoryManager);
                        setAppStore((a) =>
                            a.setHistories(newHistoryManager.histories),
                        );
                    }
                    return newFileManager;
                });
            } else {
                scrollManager
                    .previous(
                        appStore.movementDirection,
                        appStore.writingType,
                        appStore.viewSplitCount,
                    )
                    .applyScroll(viewer, image);
            }
        }
    };

    const handleHorizontalScroll = (deltaX: number): void => {
        const viewer = viewerRef.current;
        if (viewer == null) return;

        const x = viewer.scrollLeft + deltaX * (zoomManager.scale / 100);
        const y = viewer.scrollTop;
        viewer.scroll(x, y);
    };

    const handleVerticalScroll = (deltaY: number): void => {
        const viewer = viewerRef.current;
        if (viewer == null) return;

        const x = viewer.scrollLeft;
        const y = viewer.scrollTop + deltaY * (zoomManager.scale / 100);
        viewer.scroll(x, y);
    };

    return (
        <>
            {!fileManager.hasFiles() && (
                <div className="m-auto grid h-dvh w-max grid-cols-2 place-items-center gap-4">
                    <OpenImageFiles />
                    <OpenZipFile />
                </div>
            )}
            {fileManager.hasFiles() && (
                <div className="h-1000">
                    <ImageView viewerRef={viewerRef} imgRef={imgRef} />
                    <TapAreas
                        onBottomClick={handleBottomClick}
                        onLeftClick={handleLeftClick}
                        onRightClick={handleRightClick}
                        onHorizontalScroll={handleHorizontalScroll}
                        onVerticalScroll={handleVerticalScroll}
                    />
                    <MenuButton />
                    <Toast />
                    <SideMenu />
                </div>
            )}
        </>
    );
};

const OpenImageFiles = (): JSX.Element => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const setFileManager = useSetAtom(Atom.fileManager);
    const setImageBlob = useSetAtom(Atom.imageBlob);
    const setToastMessage = useSetAtom(Atom.toastMessage);

    return (
        <>
            <input
                className="hidden"
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={async (ev) => {
                    const files = ev.currentTarget.files;
                    if (files == null) return;

                    const fileManager = FileManager.fromFiles(
                        Array.from(files),
                    );
                    setFileManager(fileManager);
                    setImageBlob(await fileManager.getBlob());
                    setToastMessage({
                        text: fileManager.progress() ?? "",
                        state: "visible",
                    });
                }}
            />
            <button
                className="h-8 rounded-full border px-2"
                onClick={() => {
                    inputRef.current?.click();
                }}
            >
                画像ファイルを開く
            </button>
        </>
    );
};

const OpenZipFile = (): JSX.Element => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const setFileManager = useSetAtom(Atom.fileManager);
    const setImageBlob = useSetAtom(Atom.imageBlob);
    const setToastMessage = useSetAtom(Atom.toastMessage);
    const setZipFileName = useSetAtom(Atom.zipFileName);
    const [appStore, setAppStore] = useAtom(Atom.appStore);
    const setHistoryManager = useSetAtom(Atom.historyManager);

    return (
        <>
            <input
                className="hidden"
                ref={inputRef}
                type="file"
                accept=".zip"
                onChange={async (ev) => {
                    const file = ev.currentTarget.files?.[0];
                    if (file == null) return;

                    let fileManager = await FileManager.fromZip(file);
                    const historyManager = new HistoryManager(
                        appStore.histories,
                    );
                    const index = historyManager.getIndex(file.name);
                    if (index == null) {
                        const newHistoryManager = historyManager.addHistory({
                            name: file.name,
                            index: 0,
                        });
                        setHistoryManager(newHistoryManager);
                        setAppStore((a) =>
                            a.setHistories(newHistoryManager.histories),
                        );
                    } else {
                        fileManager = fileManager.setIndex(index);
                    }
                    setFileManager(fileManager);
                    setImageBlob(await fileManager.getBlob());
                    setToastMessage({
                        text: fileManager.progress() ?? "",
                        state: "visible",
                    });
                    setZipFileName(file.name);
                }}
            />
            <button
                className="h-8 rounded-full border px-2"
                onClick={() => {
                    inputRef.current?.click();
                }}
            >
                Zipファイルを開く
            </button>
        </>
    );
};
