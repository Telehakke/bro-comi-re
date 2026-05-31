import { atom } from "jotai";
import { selectAtom } from "jotai/utils";
import { appStore } from "./models/appStore";
import { FileManager } from "./models/fileManager";
import { HistoryManager } from "./models/historyManager";
import { ImageBlobManager } from "./models/imageBlobManager";
import { MessageManager, type Visibility } from "./models/messageManager";
import { ScrollManager } from "./models/scrollManager";
import { SharpeningFilter } from "./models/sharpeningFilter";
import { ViewerManager } from "./models/viewerManager";
import { ZoomManager } from "./models/zoomManager";

export const Atom = {
    appStore: atom(appStore),
    fileManager: atom(new FileManager()),
    historyManager: atom(new HistoryManager()),
    imageBlobManager: atom(ImageBlobManager.forCurrent()),
    infoState: atom<Visibility>("visible"),
    isOpenSideMenu: atom(false),
    isUserScrolled: atom(false),
    messageManager: atom(MessageManager.create()),
    onChevron: atom<"left" | "right" | "none">("none"),
    onFullscreen: atom(false),
    onInvertFilter: atom(false),
    scrollManager: atom(new ScrollManager()),
    sharpeningFilter: atom(() => new SharpeningFilter()),
    shouldShowViewer: atom(false),
    viewerManager: atom(new ViewerManager(null, null)),
    zipFileName: atom<string | undefined>(undefined),
    zoomManager: atom(new ZoomManager()),
} as const;

// prettier-ignore
export const AppStateAtom = {
    contentFit: selectAtom(Atom.appStore, (a) => a.contentFit),
    displayMode: selectAtom(Atom.appStore, (a) => a.displayMode),
    histories: selectAtom(Atom.appStore, (a) => a.histories),
    onSharpeningFilter: selectAtom(Atom.appStore, (a) => a.onSharpeningFilter),
    scrollSpeed: selectAtom(Atom.appStore, (a) => a.scrollSpeed),
    sharpeningFilterStrength: selectAtom(Atom.appStore, (a) => a.sharpeningFilterStrength),
    shouldAdvance: selectAtom(Atom.appStore, (a) => a.shouldAdvance),
    shouldShowFullscreenButton: selectAtom(Atom.appStore, (a) => a.shouldShowFullscreenButton),
    shouldShowInvertButton: selectAtom(Atom.appStore, (a) => a.shouldShowInvertButton),
    tapAreaWidth: selectAtom(Atom.appStore, (a) => a.tapAreaWidth),
    tapAreaHeight: selectAtom(Atom.appStore, (a) => a.tapAreaHeight),
    viewSplitCount: selectAtom(Atom.appStore, (a) => a.viewSplitCount),
    writingType: selectAtom(Atom.appStore, (a) => a.writingType),
    zoomStep: selectAtom(Atom.appStore, (a) => a.zoomStep),
} as const;

/* -------------------------------------------------------------------------- */

export const ActionAtom = {
    goToNextAtom: atom(null, (get, set) => {
        const appStore = get(Atom.appStore);
        const viewerManager = get(Atom.viewerManager);
        const scroll = get(Atom.scrollManager);
        if (scroll.shouldMoveToNextPage({ ...appStore, viewerManager })) {
            if (get(Atom.fileManager).hasNextFile()) {
                set(ActionAtom.moveToNextPage);
                set(ActionAtom.positionStart);
            }
        } else {
            set(ActionAtom.scrollToNext);
        }
    }),
    goToPreviousAtom: atom(null, (get, set) => {
        const appStore = get(Atom.appStore);
        const viewerManager = get(Atom.viewerManager);
        const scroll = get(Atom.scrollManager);
        if (scroll.shouldMoveToPreviousPage({ ...appStore, viewerManager })) {
            if (get(Atom.fileManager).hasPreviousFile()) {
                set(ActionAtom.moveToPreviousPage);
                set(ActionAtom.positionEnd);
            }
        } else {
            set(ActionAtom.scrollToPrevious);
        }
    }),
    moveToIndexPage: atom(null, async (get, set, index: number) => {
        const file = get(Atom.fileManager).setIndex(index);
        set(Atom.fileManager, file);

        const appStore = get(Atom.appStore);
        const leftIndex = file.getLeftIndex({ ...appStore });
        const rightIndex = file.getRightIndex({ ...appStore });
        const imageBlob = ImageBlobManager.forCurrent(
            { id: leftIndex, blob: await file.getBlob(leftIndex) },
            { id: rightIndex, blob: await file.getBlob(rightIndex) },
        );
        set(Atom.imageBlobManager, imageBlob);
        set(Atom.messageManager, (m) => m.setMessage(file.progress()));
    }),
    moveToNextPage: atom(null, async (get, set) => {
        const appStore = get(Atom.appStore);
        const file = get(Atom.fileManager).nextIndex({ ...appStore });
        set(Atom.fileManager, file);

        const imageBlob = get(Atom.imageBlobManager).shiftToPrev();
        const leftIndex = file.getLeftIndex({ ...appStore });
        const leftBlob =
            imageBlob.getCurrentLeftBlobWithId(leftIndex) ??
            (await file.getBlob(leftIndex));
        const rightIndex = file.getRightIndex({ ...appStore });
        const rightBlob =
            imageBlob.getCurrentRightBlobWithId(rightIndex) ??
            (await file.getBlob(rightIndex));
        const newImageBlob = imageBlob.setCurrent(
            { id: leftIndex, blob: leftBlob },
            { id: rightIndex, blob: rightBlob },
        );
        set(Atom.imageBlobManager, newImageBlob);
        set(Atom.messageManager, (m) => m.setMessage(file.progress()));
    }),
    moveToPreviousPage: atom(null, async (get, set) => {
        const appStore = get(Atom.appStore);
        const file = get(Atom.fileManager).prevIndex({ ...appStore });
        set(Atom.fileManager, file);

        const imageBlob = get(Atom.imageBlobManager).shiftToNext();
        const leftIndex = file.getLeftIndex({ ...appStore });
        const leftBlob =
            imageBlob.getCurrentLeftBlobWithId(leftIndex) ??
            (await file.getBlob(leftIndex));
        const rightIndex = file.getRightIndex({ ...appStore });
        const rightBlob =
            imageBlob.getCurrentRightBlobWithId(rightIndex) ??
            (await file.getBlob(rightIndex));
        const newImageBlob = imageBlob.setCurrent(
            { id: leftIndex, blob: leftBlob },
            { id: rightIndex, blob: rightBlob },
        );
        set(Atom.imageBlobManager, newImageBlob);
        set(Atom.messageManager, (m) => m.setMessage(file.progress()));
    }),
    positionStart: atom(null, (get, set) => {
        const { writingType } = get(Atom.appStore);
        set(Atom.scrollManager, ScrollManager.fromWritingType(writingType));
    }),
    positionEnd: atom(null, (get, set) => {
        const { writingType } = get(Atom.appStore);
        set(
            Atom.scrollManager,
            ScrollManager.fromWritingType(writingType, true),
        );
    }),
    scrollToNext: atom(null, (get, set) => {
        const appStore = get(Atom.appStore);
        const viewerManager = get(Atom.viewerManager);
        const scroll = get(Atom.scrollManager).next({
            ...appStore,
            viewerManager,
        });
        set(Atom.scrollManager, scroll);
        scroll.applyScroll(viewerManager);
    }),
    scrollToPrevious: atom(null, (get, set) => {
        const appStore = get(Atom.appStore);
        const viewerManager = get(Atom.viewerManager);
        const scroll = get(Atom.scrollManager).previous({
            ...appStore,
            viewerManager,
        });
        set(Atom.scrollManager, scroll);
        scroll.applyScroll(viewerManager);
    }),
    updateHistory: atom(null, (get, set) => {
        const zipFileName = get(Atom.zipFileName);
        if (zipFileName == null) return;

        const history = get(Atom.historyManager).update({
            name: zipFileName,
            index: get(Atom.fileManager).index,
        });
        set(Atom.historyManager, history);
        set(Atom.appStore, (a) => a.setHistories(history.histories));
    }),
    updateScrollManager: atom(null, (get, set) => {
        if (!get(Atom.isUserScrolled)) return;
        set(Atom.isUserScrolled, false);
        set(Atom.scrollManager, (s) => s.update(get(Atom.viewerManager)));
    }),
} as const;
