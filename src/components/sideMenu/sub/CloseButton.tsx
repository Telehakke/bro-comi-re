import { atom, useSetAtom } from "jotai";
import type { JSX } from "react";
import { ActionAtom, Atom } from "../../../atoms";
import { FileManager } from "../../../models/fileManager";

const closeViewerAtom = atom(null, (_, set) => {
    set(ActionAtom.updateHistory);
    set(Atom.fileManager, new FileManager());
    set(Atom.isOpenSideMenu, false);
    set(Atom.shouldShowViewer, false);
    set(Atom.zipFileName, undefined);
    set(Atom.zoomManager, (z) => z.reset());
    set(Atom.prevLeftImageBlob, undefined);
    set(Atom.prevRightImageBlob, undefined);
    set(Atom.currentLeftImageBlob, undefined);
    set(Atom.currentRightImageBlob, undefined);
    set(Atom.nextLeftImageBlob, undefined);
    set(Atom.nextRightImageBlob, undefined);
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
