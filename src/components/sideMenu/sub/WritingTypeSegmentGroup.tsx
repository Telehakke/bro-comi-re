import { useAtomValue, useSetAtom } from "jotai";
import type { JSX } from "react";
import { AppStateAtom, Atom } from "../../../atoms";
import { WritingTypeEnum, type WritingType } from "../../../models/appState";
import { SegmentGroup } from "../../common/SegmentGroup";

export const WritingTypeSegmentGroup = (): JSX.Element => {
    const writingType = useAtomValue(AppStateAtom.writingType);
    const setAppStore = useSetAtom(Atom.appStore);

    return (
        <SegmentGroup
            label="書籍の種類"
            items={Object.values(WritingTypeEnum)}
            value={writingType}
            onValueChange={(v) => {
                setAppStore((a) => a.setWritingType(v as WritingType));
            }}
        />
    );
};
