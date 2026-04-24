import { useAtomValue, useSetAtom } from "jotai";
import type { JSX } from "react";
import { AppStateAtom, Atom } from "../../../atoms";
import { Switch } from "../../common/Switch";

export const ShouldAdvanceSwitch = (): JSX.Element => {
    const shouldAdvance = useAtomValue(AppStateAtom.shouldAdvance);
    const setAppStore = useSetAtom(Atom.appStore);

    return (
        <Switch
            label="左右タップで進む"
            checked={shouldAdvance}
            onCheckedChange={(v) => setAppStore((a) => a.setShouldAdvance(v))}
        />
    );
};
