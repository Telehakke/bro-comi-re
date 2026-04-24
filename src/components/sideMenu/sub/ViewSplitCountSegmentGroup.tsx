import { useAtomValue, useSetAtom } from "jotai";
import type { JSX } from "react";
import { AppStateAtom, Atom } from "../../../atoms";
import {
    ViewSplitCountEnum,
    type ViewSplitCount,
} from "../../../models/appState";
import { SegmentGroup } from "../../common/SegmentGroup";

export const ViewSplitCountSegmentGroup = (): JSX.Element => {
    const viewSplitCount = useAtomValue(AppStateAtom.viewSplitCount);
    const setAppStore = useSetAtom(Atom.appStore);

    return (
        <SegmentGroup
            label="拡大時の画面分割数"
            items={Object.values(ViewSplitCountEnum)}
            value={viewSplitCount}
            onValueChange={(v) =>
                setAppStore((a) => a.setViewSplitCount(v as ViewSplitCount))
            }
        />
    );
};
