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

    return (
        <button
            className="mx-auto block h-8 rounded-full border px-2"
            onClick={closeViewer}
        >
            本を閉じる
        </button>
    );
};
