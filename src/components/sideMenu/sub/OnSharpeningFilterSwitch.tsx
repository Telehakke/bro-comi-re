import { useAtomValue, useSetAtom } from "jotai";
import type React from "react";
import type { JSX } from "react";
import { AppStateAtom, Atom } from "../../../atoms";
import type { ViewerBody, ViewerContent } from "../../../models/types";
import { Viewer } from "../../../models/viewer";
import { Switch } from "../../common/Switch";

export const OnSharpeningFilterSwitch = (props: {
    body: React.RefObject<ViewerBody>;
    content: React.RefObject<ViewerContent>;
}): JSX.Element => {
    const onSharpeningFilter = useAtomValue(AppStateAtom.onSharpeningFilter);
    const setAppStore = useSetAtom(Atom.appStore);
    const setScrollManager = useSetAtom(Atom.scrollManager);

    return (
        <Switch
            label="先鋭化フィルターの有効化"
            checked={onSharpeningFilter}
            onCheckedChange={(c) => {
                setAppStore((a) => a.setOnSharpeningFilter(c));
                setScrollManager((s) =>
                    s.update(
                        Viewer.create(
                            props.body.current,
                            props.content.current,
                        ),
                    ),
                );
            }}
        />
    );
};
