import { atom, useSetAtom } from "jotai";
import type { JSX } from "react";
import { ActionAtom, Atom } from "../../../atoms";
import { FileManager } from "../../../models/fileManager";
import { ImageBlobManager } from "../../../models/imageBlobManager";

const closeViewerAtom = atom(null, (_, set) => {
    set(ActionAtom.updateHistory);
    set(Atom.fileManager, new FileManager());
    set(Atom.imageBlobManager, ImageBlobManager.forCurrent());
    set(Atom.isOpenSideMenu, false);
    set(Atom.onFullscreen, false);
    set(Atom.shouldShowViewer, false);
    set(Atom.zipFileName, undefined);
    set(Atom.zoomManager, (z) => z.reset());
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
    }
});

export const CloseButton = (): JSX.Element => {
    const closeViewer = useSetAtom(closeViewerAtom);

    const className = {
        _: "mx-auto block h-8 rounded-full px-2 transition",
        bg: "bg-white dark:bg-neutral-900",
        hoverBg: "hover:bg-neutral-100 dark:hover:bg-neutral-800",
        activeBg: "active:bg-neutral-200 dark:active:bg-neutral-700",
        border: "border border-neutral-300 dark:border-neutral-600",
        focusBorder: "focus-visible:border-transparent",
        outline:
            "-outline-offset-2 outline-blue-500/75 focus-visible:outline-2",
    };

    return (
        <button
            className={Object.values(className).join(" ")}
            onClick={closeViewer}
        >
            本を閉じる
        </button>
    );
};
