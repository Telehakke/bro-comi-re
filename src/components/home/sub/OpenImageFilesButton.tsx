import { atom, useSetAtom } from "jotai";
import { useRef, type JSX } from "react";
import { ActionAtom, Atom } from "../../../atoms";
import { FileManager } from "../../../models/fileManager";
import { ScrollManager } from "../../../models/scrollManager";

const openImageFilesAtom = atom(null, (get, set, files: File[]) => {
    set(Atom.fileManager, FileManager.fromFiles(files));
    set(ActionAtom.moveToIndexPage, 0);
    const { writingType } = get(Atom.appStore);
    set(Atom.scrollManager, ScrollManager.fromWritingType(writingType));
    set(Atom.shouldShowViewer, true);
});

export const OpenImageFilesButton = (): JSX.Element => {
    const input = useRef<HTMLInputElement | null>(null);
    const openImageFiles = useSetAtom(openImageFilesAtom);

    return (
        <>
            <input
                className="hidden"
                ref={input}
                type="file"
                accept="image/*"
                multiple
                onChange={(ev) => {
                    const files = ev.currentTarget.files;
                    if (files == null) return;
                    openImageFiles(Array.from(files));
                    ev.currentTarget.value = "";
                }}
            />
            <button
                className="h-8 rounded-full border px-2"
                onClick={() => input.current?.click()}
            >
                画像ファイルを開く
            </button>
        </>
    );
};
