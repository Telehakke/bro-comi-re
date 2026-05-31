import { atom, useSetAtom } from "jotai";
import { FileImage } from "lucide-react";
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
                className="flex flex-col gap-2 rounded-2xl border px-4 py-2 text-xs"
                onClick={() => input.current?.click()}
            >
                <FileImage className="m-auto size-8" />
                画像ファイルを開く
            </button>
        </>
    );
};
