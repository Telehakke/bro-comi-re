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

    const className = {
        _: "rounded-2xl px-4 py-2 text-xs transition",
        flex: "flex flex-col gap-2",
        bg: "bg-white dark:bg-neutral-900",
        hoverBg: "hover:bg-neutral-100 dark:hover:bg-neutral-800",
        activeBg: "active:bg-neutral-200 dark:active:bg-neutral-700",
        border: "border border-neutral-300 dark:border-neutral-600",
        focusBorder: "focus-visible:border-transparent",
        outline:
            "-outline-offset-2 outline-blue-500/75 focus-visible:outline-2",
    };

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
                className={Object.values(className).join(" ")}
                onClick={() => input.current?.click()}
            >
                <FileImage className="m-auto size-8" />
                画像ファイルを開く
            </button>
        </>
    );
};
