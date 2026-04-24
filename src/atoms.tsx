import { atom } from "jotai";
import { selectAtom } from "jotai/utils";
import { appStore } from "./models/appStore";
import { FileManager } from "./models/fileManager";
import { HistoryManager } from "./models/historyManager";
import { MessageManager } from "./models/messageManager";
import { ScrollManager } from "./models/scrollManager";
import { SharpeningFilter } from "./models/sharpeningFilter";
import { ZoomManager } from "./models/zoomManager";

export const Atom = {
    appStore: atom(appStore),
    fileManager: atom(new FileManager()),
    historyManager: atom(new HistoryManager()),
    isOpenSideMenu: atom(false),
    isUserScrolled: atom(false),
    messageManager: atom(MessageManager.create()),
    scrollManager: atom(new ScrollManager()),
    sharpeningFilter: atom(() => new SharpeningFilter()),
    shouldShowInfo: atom(true),
    shouldShowViewer: atom(false),
    zipFileName: atom<string | undefined>(undefined),
    zoomManager: atom(new ZoomManager()),
    prevLeftImageBlob: atom<Blob | undefined>(undefined),
    prevRightImageBlob: atom<Blob | undefined>(undefined),
    currentLeftImageBlob: atom<Blob | undefined>(undefined),
    currentRightImageBlob: atom<Blob | undefined>(undefined),
    nextLeftImageBlob: atom<Blob | undefined>(undefined),
    nextRightImageBlob: atom<Blob | undefined>(undefined),
} as const;

export const AppStateAtom = {
    displayMode: selectAtom(Atom.appStore, (a) => a.displayMode),
    histories: selectAtom(Atom.appStore, (a) => a.histories),
    onSharpeningFilter: selectAtom(Atom.appStore, (a) => a.onSharpeningFilter),
    scrollSpeed: selectAtom(Atom.appStore, (a) => a.scrollSpeed),
    sharpeningFilterStrength: selectAtom(
        Atom.appStore,
        (a) => a.sharpeningFilterStrength,
    ),
    shouldAdvance: selectAtom(Atom.appStore, (a) => a.shouldAdvance),
    viewSplitCount: selectAtom(Atom.appStore, (a) => a.viewSplitCount),
    writingType: selectAtom(Atom.appStore, (a) => a.writingType),
    zoomStep: selectAtom(Atom.appStore, (a) => a.zoomStep),
} as const;

/* -------------------------------------------------------------------------- */

export const ActionAtom = {
    moveToNextPage: atom(null, async (get, set) => {
        const { displayMode, writingType } = get(Atom.appStore);
        let file: FileManager;
        if (displayMode === "single") {
            file = get(Atom.fileManager).incrementIndex();
        } else {
            file = get(Atom.fileManager).incrementIndex().incrementIndex();
        }
        set(Atom.fileManager, file);
        set(Atom.messageManager, (m) => m.setMessage(file.progress()));

        set(Atom.prevLeftImageBlob, get(Atom.currentLeftImageBlob));
        set(Atom.prevRightImageBlob, get(Atom.currentRightImageBlob));

        const currentLeft = get(Atom.nextLeftImageBlob);
        set(
            Atom.currentLeftImageBlob,
            currentLeft != null
                ? currentLeft
                : await file.getLeftBlob(displayMode, writingType),
        );
        const currentRight = get(Atom.nextRightImageBlob);
        set(
            Atom.currentRightImageBlob,
            currentRight != null
                ? currentRight
                : await file.getRightBlob(displayMode, writingType),
        );

        let nextFile: FileManager;
        if (displayMode === "single") {
            nextFile = file.incrementIndex();
        } else {
            nextFile = file.incrementIndex().incrementIndex();
        }
        nextFile.getLeftBlob(displayMode, writingType).then((blob) => {
            set(Atom.nextLeftImageBlob, blob);
        });
        nextFile.getRightBlob(displayMode, writingType).then((blob) => {
            set(Atom.nextRightImageBlob, blob);
        });
    }),
    moveToPreviousPage: atom(null, async (get, set) => {
        const { displayMode, writingType } = get(Atom.appStore);
        let file: FileManager;
        if (displayMode === "single") {
            file = get(Atom.fileManager).decrementIndex();
        } else {
            file = get(Atom.fileManager).decrementIndex().decrementIndex();
        }

        set(Atom.fileManager, file);
        set(Atom.messageManager, (m) => m.setMessage(file.progress()));

        set(Atom.nextLeftImageBlob, get(Atom.currentLeftImageBlob));
        set(Atom.nextRightImageBlob, get(Atom.currentRightImageBlob));

        const currentLeft = get(Atom.prevLeftImageBlob);
        set(
            Atom.currentLeftImageBlob,
            currentLeft != null
                ? currentLeft
                : await file.getLeftBlob(displayMode, writingType),
        );
        const currentRight = get(Atom.prevRightImageBlob);
        set(
            Atom.currentRightImageBlob,
            currentRight != null
                ? currentRight
                : await file.getRightBlob(displayMode, writingType),
        );

        let prevFile: FileManager;
        if (displayMode == "single") {
            prevFile = file.decrementIndex();
        } else {
            prevFile = file.decrementIndex().decrementIndex();
        }
        prevFile.getLeftBlob(displayMode, writingType).then((blob) => {
            set(Atom.prevLeftImageBlob, blob);
        });
        prevFile.getRightBlob(displayMode, writingType).then((blob) => {
            set(Atom.prevRightImageBlob, blob);
        });
    }),
    moveToIndexPage: atom(null, async (get, set, index: number) => {
        const { displayMode, writingType } = get(Atom.appStore);
        const file = get(Atom.fileManager).setIndex(index);
        set(Atom.fileManager, file);
        set(Atom.messageManager, (m) => m.setMessage(file.progress()));

        set(Atom.prevLeftImageBlob, undefined);
        set(Atom.prevRightImageBlob, undefined);

        set(
            Atom.currentLeftImageBlob,
            await file.getLeftBlob(displayMode, writingType),
        );
        set(
            Atom.currentRightImageBlob,
            await file.getRightBlob(displayMode, writingType),
        );

        let nextFile: FileManager;
        if (displayMode === "single") {
            nextFile = file.incrementIndex();
        } else {
            nextFile = file.incrementIndex().incrementIndex();
        }
        nextFile.getLeftBlob(displayMode, writingType).then((blob) => {
            set(Atom.nextLeftImageBlob, blob);
        });
        nextFile.getRightBlob(displayMode, writingType).then((blob) => {
            set(Atom.prevRightImageBlob, blob);
        });
    }),
    scrollToStart: atom(
        null,
        (get, set, viewer: HTMLDivElement, content: HTMLDivElement) => {
            const { writingType } = get(Atom.appStore);
            const scroll = ScrollManager.fromWritingType(writingType);
            set(Atom.scrollManager, scroll);
            scroll.applyScroll(viewer, content);
        },
    ),
    scrollToEnd: atom(
        null,
        (get, set, viewer: HTMLDivElement, content: HTMLDivElement) => {
            const { writingType } = get(Atom.appStore);
            const scroll = ScrollManager.fromWritingType(writingType, true);
            set(Atom.scrollManager, scroll);
            scroll.applyScroll(viewer, content);
        },
    ),
    scrollToNext: atom(
        null,
        (get, set, viewer: HTMLDivElement, content: HTMLDivElement) => {
            const { writingType, viewSplitCount } = get(Atom.appStore);
            const scroll = get(Atom.scrollManager).next(
                writingType,
                viewSplitCount,
                viewer,
                content,
            );
            set(Atom.scrollManager, scroll);
            scroll.applyScroll(viewer, content);
        },
    ),
    scrollToPrevious: atom(
        null,
        (get, set, viewer: HTMLDivElement, content: HTMLDivElement) => {
            const { writingType, viewSplitCount } = get(Atom.appStore);
            const scroll = get(Atom.scrollManager).previous(
                writingType,
                viewSplitCount,
                viewer,
                content,
            );
            set(Atom.scrollManager, scroll);
            scroll.applyScroll(viewer, content);
        },
    ),
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
} as const;
