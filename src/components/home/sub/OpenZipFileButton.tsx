import { atom, useSetAtom } from "jotai";
import { FileArchive } from "lucide-react";
import { useRef, type JSX } from "react";
import { ActionAtom, Atom } from "../../../atoms";
import { calculateHash } from "../../../models/calculateHash";
import { FileManager } from "../../../models/fileManager";
import { HistoryManager } from "../../../models/historyManager";
import { ScrollManager } from "../../../models/scrollManager";

const openZipFileAtom = atom(null, async (get, set, file: File) => {
    set(Atom.fileManager, await FileManager.fromZip(file));
    const { histories, writingType } = get(Atom.appStore);

    let historyManager = new HistoryManager(histories);
    const fileName = await calculateHash(file.name);
    const index = historyManager.getIndex(fileName);
    if (index == null) {
        historyManager = historyManager.add(fileName);
    } else {
        historyManager = historyManager.moveToHead(fileName);
    }
    set(Atom.historyManager, historyManager);
    set(Atom.appStore, (a) => a.setHistories(historyManager.histories));
    set(ActionAtom.moveToIndexPage, index ?? 0);

    set(Atom.scrollManager, ScrollManager.fromWritingType(writingType));
    set(Atom.zipFileName, fileName);
    set(Atom.shouldShowViewer, true);
});

export const OpenZipFileButton = (): JSX.Element => {
    const input = useRef<HTMLInputElement | null>(null);
    const openZipFile = useSetAtom(openZipFileAtom);

    return (
        <>
            <input
                className="hidden"
                ref={input}
                type="file"
                accept=".zip"
                onChange={(ev) => {
                    const file = ev.currentTarget.files?.[0];
                    if (file == null) return;
                    openZipFile(file);
                    ev.currentTarget.value = "";
                }}
            />
            <button
                className="flex flex-col gap-2 rounded-2xl border px-4 py-2 text-xs"
                onClick={() => input.current?.click()}
            >
                <FileArchive className="m-auto size-8" />
                Zipファイルを開く
            </button>
        </>
    );
};
