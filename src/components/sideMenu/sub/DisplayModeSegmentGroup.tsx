import { atom, useAtomValue, useSetAtom } from "jotai";
import type { JSX } from "react";
import { ActionAtom, AppStateAtom, Atom } from "../../../atoms";
import { DisplayModeEnum, type DisplayMode } from "../../../models/appState";
import { SegmentGroup } from "../../common/SegmentGroup";

const reloadAtom = atom(null, (get, set, value: DisplayMode) => {
    set(Atom.appStore, (a) => a.setDisplayMode(value));
    set(Atom.prevLeftImageBlob, undefined);
    set(Atom.prevRightImageBlob, undefined);
    set(Atom.currentLeftImageBlob, undefined);
    set(Atom.currentRightImageBlob, undefined);
    set(Atom.nextLeftImageBlob, undefined);
    set(Atom.nextRightImageBlob, undefined);
    const index = get(Atom.fileManager).index;
    set(ActionAtom.moveToIndexPage, index);
});

export const DisplayModeSegmentGroup = (): JSX.Element => {
    const displayMode = useAtomValue(AppStateAtom.displayMode);
    const reload = useSetAtom(reloadAtom);

    return (
        <SegmentGroup
            label="画像の表示枚数"
            items={Object.values(DisplayModeEnum)}
            value={displayMode}
            onValueChange={(v) => reload(v as DisplayMode)}
        />
    );
};
