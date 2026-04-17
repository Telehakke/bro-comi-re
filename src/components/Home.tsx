import { atom, useSetAtom } from "jotai";
import { useRef, type JSX } from "react";
import { Atom } from "../atoms";
import { FileManager } from "../models/fileManager";
import { HistoryManager } from "../models/historyManager";
import { ScrollManager } from "../models/scrollManager";

export const Home = (): JSX.Element => {
    return (
        <div className="m-auto grid h-dvh w-max grid-cols-2 place-items-center gap-4">
            <OpenImageFilesButton />
            <OpenZipFileButton />
        </div>
    );
};

/* -------------------------------------------------------------------------- */

const openImageFilesAtom = atom(null, async (get, set, files: FileList) => {
    const fileManager = FileManager.fromFiles(Array.from(files));
    set(Atom.imageBlob, await fileManager.getBlob());
    set(Atom.fileManager, fileManager);
    set(Atom.messageManager, (m) => m.setMessage(fileManager.progress()));
    const { writingType } = get(Atom.appStore);
    set(Atom.scrollManager, ScrollManager.createFromWritingType(writingType));
});

const OpenImageFilesButton = (): JSX.Element => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const openImageFiles = useSetAtom(openImageFilesAtom);

    return (
        <>
            <input
                className="hidden"
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(ev) => {
                    const files = ev.currentTarget.files;
                    if (files == null) return;
                    openImageFiles(files);
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

/* -------------------------------------------------------------------------- */

const openZipFileAtom = atom(null, async (get, set, file: File) => {
    const appStore = get(Atom.appStore);
    let fileManager = await FileManager.fromZip(file);
    let historyManager = new HistoryManager(appStore.histories);
    const index = historyManager.getIndex(file.name);
    if (index == null) {
        historyManager = historyManager.addHistory({
            name: file.name,
            index: 0,
        });
        set(Atom.appStore, (a) => a.setHistories(historyManager.histories));
    } else {
        fileManager = fileManager.setIndex(index);
    }
    set(Atom.historyManager, historyManager);
    set(Atom.fileManager, fileManager);
    set(Atom.imageBlob, await fileManager.getBlob());
    set(Atom.messageManager, (m) => m.setMessage(fileManager.progress()));
    set(
        Atom.scrollManager,
        ScrollManager.createFromWritingType(appStore.writingType),
    );
    set(Atom.zipFileName, file.name);
});

const OpenZipFileButton = (): JSX.Element => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const openZipFile = useSetAtom(openZipFileAtom);

    return (
        <>
            <input
                className="hidden"
                ref={inputRef}
                type="file"
                accept=".zip"
                onChange={(ev) => {
                    const file = ev.currentTarget.files?.[0];
                    if (file == null) return;
                    openZipFile(file);
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
