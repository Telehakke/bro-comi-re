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
    prevLeftImageBlob: atom<Blob | undefined>(undefined),
    currentLeftImageBlob: atom<Blob | undefined>(undefined),
    nextLeftImageBlob: atom<Blob | undefined>(undefined),
    prevRightImageBlob: atom<Blob | undefined>(undefined),
    currentRightImageBlob: atom<Blob | undefined>(undefined),
    nextRightImageBlob: atom<Blob | undefined>(undefined),
} as const;

/* -------------------------------------------------------------------------- */

export const ActionAtom = {
    goToNext: atom(
        null,
        (get, set, viewer: HTMLDivElement, content: HTMLDivElement) => {
            const { writingType } = get(Atom.appStore);
            const sm = get(Atom.scrollManager);
            if (sm.shouldMoveToNextPage(viewer, content, writingType)) {
                if (get(Atom.fileManager).hasNextFile()) {
                    set(ActionAtom.moveToNextPage);
                    set(ActionAtom.scrollToStart, viewer, content);
                    //set(ActionAtom.updateHistory);
                } else {
                    set(Atom.messageManager, (m) =>
                        m.setMessage("最後のファイルです"),
                    );
                }
            } else {
                set(ActionAtom.scrollToNext, viewer, content);
            }
        },
    ),
    goToPrevious: atom(
        null,
        (get, set, viewer: HTMLDivElement, content: HTMLDivElement) => {
            const { writingType } = get(Atom.appStore);
            const sm = get(Atom.scrollManager);
            if (sm.shouldMoveToPreviousPage(viewer, content, writingType)) {
                if (get(Atom.fileManager).hasPreviousFile()) {
                    set(ActionAtom.moveToPreviousPage);
                    set(ActionAtom.scrollToEnd, viewer, content);
                    //set(ActionAtom.updateHistory);
                } else {
                    set(Atom.messageManager, (m) =>
                        m.setMessage("最初のファイルです"),
                    );
                }
            } else {
                set(ActionAtom.scrollToPrevious, viewer, content);
            }
        },
    ),
    moveToNextPage: atom(null, async (get, set) => {
        const { displayMode, writingType } = get(Atom.appStore);
        let fm: FileManager;
        if (displayMode === "single") {
            fm = get(Atom.fileManager).incrementIndex();
        } else {
            fm = get(Atom.fileManager).incrementIndex().incrementIndex();
        }
        set(Atom.fileManager, fm);
        set(Atom.messageManager, (m) => m.setMessage(fm.progress()));

        set(Atom.prevLeftImageBlob, get(Atom.currentLeftImageBlob));
        set(Atom.prevRightImageBlob, get(Atom.currentRightImageBlob));

        const currentLeft = get(Atom.nextLeftImageBlob);
        set(
            Atom.currentLeftImageBlob,
            currentLeft != null
                ? currentLeft
                : await fm.getLeftBlob(displayMode, writingType),
        );
        const currentRight = get(Atom.nextRightImageBlob);
        set(
            Atom.currentRightImageBlob,
            currentRight != null
                ? currentRight
                : await fm.getRightBlob(displayMode, writingType),
        );

        let nextFm: FileManager;
        if (displayMode === "single") {
            nextFm = fm.incrementIndex();
        } else {
            nextFm = fm.incrementIndex().incrementIndex();
        }
        nextFm.getLeftBlob(displayMode, writingType).then((blob) => {
            set(Atom.nextLeftImageBlob, blob);
        });
        nextFm.getRightBlob(displayMode, writingType).then((blob) => {
            set(Atom.nextRightImageBlob, blob);
        });
    }),
    moveToPreviousPage: atom(null, async (get, set) => {
        const { displayMode, writingType } = get(Atom.appStore);
        let fm: FileManager;
        if (displayMode === "single") {
            fm = get(Atom.fileManager).decrementIndex();
        } else {
            fm = get(Atom.fileManager).decrementIndex().decrementIndex();
        }

        set(Atom.fileManager, fm);
        set(Atom.messageManager, (m) => m.setMessage(fm.progress()));

        set(Atom.nextLeftImageBlob, get(Atom.currentLeftImageBlob));
        set(Atom.nextRightImageBlob, get(Atom.currentRightImageBlob));

        const currentLeft = get(Atom.prevLeftImageBlob);
        set(
            Atom.currentLeftImageBlob,
            currentLeft != null
                ? currentLeft
                : await fm.getLeftBlob(displayMode, writingType),
        );
        const currentRight = get(Atom.prevRightImageBlob);
        set(
            Atom.currentRightImageBlob,
            currentRight != null
                ? currentRight
                : await fm.getRightBlob(displayMode, writingType),
        );

        let prevFm: FileManager;
        if (displayMode == "single") {
            prevFm = fm.decrementIndex();
        } else {
            prevFm = fm.decrementIndex().decrementIndex();
        }
        prevFm.getLeftBlob(displayMode, writingType).then((blob) => {
            set(Atom.prevLeftImageBlob, blob);
        });
        prevFm.getRightBlob(displayMode, writingType).then((blob) => {
            set(Atom.prevRightImageBlob, blob);
        });
    }),
    moveToIndexPage: atom(null, async (get, set, index: number) => {
        const { displayMode, writingType } = get(Atom.appStore);
        const fm = get(Atom.fileManager).setIndex(index);
        set(Atom.fileManager, fm);
        set(Atom.messageManager, (m) => m.setMessage(fm.progress()));

        set(Atom.prevLeftImageBlob, undefined);
        set(Atom.prevRightImageBlob, undefined);

        set(
            Atom.currentLeftImageBlob,
            await fm.getLeftBlob(displayMode, writingType),
        );
        set(
            Atom.currentRightImageBlob,
            await fm.getRightBlob(displayMode, writingType),
        );

        let nextFm: FileManager;
        if (displayMode === "single") {
            nextFm = fm.incrementIndex();
        } else {
            nextFm = fm.incrementIndex().incrementIndex();
        }
        nextFm.getLeftBlob(displayMode, writingType).then((blob) => {
            set(Atom.nextLeftImageBlob, blob);
        });
        nextFm.getRightBlob(displayMode, writingType).then((blob) => {
            set(Atom.prevRightImageBlob, blob);
        });
    }),
    scrollToStart: atom(
        null,
        (get, set, viewer: HTMLDivElement, content: HTMLDivElement) => {
            const { writingType } = get(Atom.appStore);
            const sm = ScrollManager.createFromWritingType(writingType);
            set(Atom.scrollManager, sm);
            sm.applyScroll(viewer, content);
        },
    ),
    scrollToEnd: atom(
        null,
        (get, set, viewer: HTMLDivElement, content: HTMLDivElement) => {
            const { writingType } = get(Atom.appStore);
            const sm = ScrollManager.createFromWritingType(writingType, true);
            set(Atom.scrollManager, sm);
            sm.applyScroll(viewer, content);
        },
    ),
    scrollToNext: atom(
        null,
        (get, set, viewer: HTMLDivElement, content: HTMLDivElement) => {
            const appStore = get(Atom.appStore);
            const sm = get(Atom.scrollManager).next(
                appStore.movementDirection,
                appStore.writingType,
                appStore.viewSplitCount,
                viewer,
                content,
            );
            set(Atom.scrollManager, sm);
            sm.applyScroll(viewer, content);
        },
    ),
    scrollToPrevious: atom(
        null,
        (get, set, viewer: HTMLDivElement, content: HTMLDivElement) => {
            const appStore = get(Atom.appStore);
            const sm = get(Atom.scrollManager).previous(
                appStore.movementDirection,
                appStore.writingType,
                appStore.viewSplitCount,
                viewer,
                content,
            );
            set(Atom.scrollManager, sm);
            sm.applyScroll(viewer, content);
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
