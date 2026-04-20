import { atom } from "jotai";
import { appStore } from "./models/appStore";
import { FileManager } from "./models/fileManager";
import { HistoryManager } from "./models/historyManager";
import { messageManager } from "./models/messageManager";
import { ScrollManager } from "./models/scrollManager";
import { SharpeningFilter } from "./models/sharpeningFilter";
import { ZoomManager } from "./models/zoomManager";

export const Atom = {
    appStore: atom(appStore),
    fileManager: atom(new FileManager()),
    historyManager: atom(new HistoryManager()),
    isOpenSideMenu: atom(false),
    isUserScrolled: atom(false),
    messageManager: atom(messageManager),
    scrollManager: atom(new ScrollManager()),
    sharpeningFilter: atom(() => new SharpeningFilter()),
    shouldShowInfo: atom(true),
    zipFileName: atom<string | undefined>(undefined),
    zoomManager: atom(new ZoomManager()),
    prevImageBlob: atom<Blob | undefined>(undefined),
    imageBlob: atom<Blob | undefined>(undefined),
    nextImageBlob: atom<Blob | undefined>(undefined),
} as const;

/* -------------------------------------------------------------------------- */

export const ActionAtom = {
    goToNext: atom(
        null,
        (get, set, viewer: HTMLDivElement, image: HTMLImageElement) => {
            const { writingType } = get(Atom.appStore);
            const sm = get(Atom.scrollManager);
            if (sm.shouldMoveToNextPage(viewer, image, writingType)) {
                if (get(Atom.fileManager).hasNextFile()) {
                    set(ActionAtom.moveToNextPage);
                    set(ActionAtom.scrollToStart, viewer, image);
                    set(ActionAtom.updateHistory);
                } else {
                    set(Atom.messageManager, (m) =>
                        m.setMessage("最後のファイルです"),
                    );
                }
            } else {
                set(ActionAtom.scrollToNext, viewer, image);
            }
        },
    ),
    goToPrevious: atom(
        null,
        (get, set, viewer: HTMLDivElement, image: HTMLImageElement) => {
            const { writingType } = get(Atom.appStore);
            const sm = get(Atom.scrollManager);
            if (sm.shouldMoveToPreviousPage(viewer, image, writingType)) {
                if (get(Atom.fileManager).hasPreviousFile()) {
                    set(ActionAtom.moveToPreviousPage);
                    set(ActionAtom.scrollToEnd, viewer, image);
                    set(ActionAtom.updateHistory);
                } else {
                    set(Atom.messageManager, (m) =>
                        m.setMessage("最初のファイルです"),
                    );
                }
            } else {
                set(ActionAtom.scrollToPrevious, viewer, image);
            }
        },
    ),
    moveToNextPage: atom(null, async (get, set) => {
        const fm = get(Atom.fileManager).incrementIndex();
        set(Atom.fileManager, fm);
        set(Atom.messageManager, (m) => m.setMessage(fm.progress()));

        set(Atom.prevImageBlob, get(Atom.imageBlob));

        const current = get(Atom.nextImageBlob);
        set(Atom.imageBlob, current != null ? current : await fm.getBlob());

        fm.getBlob(fm.index + 1).then((blob) => {
            set(Atom.nextImageBlob, blob);
        });
    }),
    moveToPreviousPage: atom(null, async (get, set) => {
        const fm = get(Atom.fileManager).decrementIndex();
        set(Atom.fileManager, fm);
        set(Atom.messageManager, (m) => m.setMessage(fm.progress()));

        set(Atom.nextImageBlob, get(Atom.imageBlob));

        const current = get(Atom.prevImageBlob);
        set(Atom.imageBlob, current != null ? current : await fm.getBlob());

        fm.getBlob(fm.index - 1).then((blob) => {
            set(Atom.prevImageBlob, blob);
        });
    }),
    moveToIndexPage: atom(null, async (get, set, index: number) => {
        const fm = get(Atom.fileManager).setIndex(index);
        set(Atom.fileManager, fm);
        set(Atom.messageManager, (m) => m.setMessage(fm.progress()));

        set(Atom.prevImageBlob, undefined);
        set(Atom.imageBlob, await fm.getBlob());
        fm.getBlob(fm.index + 1).then((blob) => {
            set(Atom.nextImageBlob, blob);
        });
    }),
    scrollToStart: atom(
        null,
        (get, set, viewer: HTMLDivElement, image: HTMLImageElement) => {
            const { writingType } = get(Atom.appStore);
            const sm = ScrollManager.createFromWritingType(writingType);
            set(Atom.scrollManager, sm);
            sm.applyScroll(viewer, image);
        },
    ),
    scrollToEnd: atom(
        null,
        (get, set, viewer: HTMLDivElement, image: HTMLImageElement) => {
            const { writingType } = get(Atom.appStore);
            const sm = ScrollManager.createFromWritingType(writingType, true);
            set(Atom.scrollManager, sm);
            sm.applyScroll(viewer, image);
        },
    ),
    scrollToNext: atom(
        null,
        (get, set, viewer: HTMLDivElement, image: HTMLImageElement) => {
            const appStore = get(Atom.appStore);
            const sm = get(Atom.scrollManager).next(
                appStore.movementDirection,
                appStore.writingType,
                appStore.viewSplitCount,
            );
            set(Atom.scrollManager, sm);
            sm.applyScroll(viewer, image);
        },
    ),
    scrollToPrevious: atom(
        null,
        (get, set, viewer: HTMLDivElement, image: HTMLImageElement) => {
            const appStore = get(Atom.appStore);
            const sm = get(Atom.scrollManager).previous(
                appStore.movementDirection,
                appStore.writingType,
                appStore.viewSplitCount,
            );
            set(Atom.scrollManager, sm);
            sm.applyScroll(viewer, image);
        },
    ),
    updateHistory: atom(null, (get, set) => {
        const zipFileName = get(Atom.zipFileName);
        if (zipFileName == null) return;

        const hm = get(Atom.historyManager).update({
            name: zipFileName,
            index: get(Atom.fileManager).index,
        });
        set(Atom.historyManager, hm);
        set(Atom.appStore, (a) => a.setHistories(hm.histories));
    }),
};
