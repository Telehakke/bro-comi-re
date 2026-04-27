import { useAtomValue, useSetAtom } from "jotai";
import type { JSX } from "react";
import { AppStateAtom, Atom } from "../../../atoms";
import {
    TapAreaLengthEnum,
    type TapAreaLength,
} from "../../../models/appState";
import { SegmentGroup } from "../../common/SegmentGroup";

export const TapAreaHeightSegmentGroup = (): JSX.Element => {
    const tapAreaHeight = useAtomValue(AppStateAtom.tapAreaHeight);
    const setAppStore = useSetAtom(Atom.appStore);

    return (
        <SegmentGroup
            label="下タップエリアの高さ"
            items={Object.values(TapAreaLengthEnum)}
            value={tapAreaHeight}
            onValueChange={(v) =>
                setAppStore((a) => a.setTapAreaHeight(v as TapAreaLength))
            }
        />
    );
};
