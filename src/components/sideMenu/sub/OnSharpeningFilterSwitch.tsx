import { useAtomValue, useSetAtom } from "jotai";
import type { JSX } from "react";
import { AppStateAtom, Atom } from "../../../atoms";
import { Switch } from "../../common/Switch";

export const OnSharpeningFilterSwitch = (): JSX.Element => {
    const onSharpeningFilter = useAtomValue(AppStateAtom.onSharpeningFilter);
    const setAppStore = useSetAtom(Atom.appStore);

    return (
        <Switch
            label="先鋭化フィルターの有効化"
            checked={onSharpeningFilter}
            onCheckedChange={(c) =>
                setAppStore((a) => a.setOnSharpeningFilter(c))
            }
        />
    );
};
