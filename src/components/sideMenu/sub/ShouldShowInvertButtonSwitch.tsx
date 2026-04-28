import { useAtomValue, useSetAtom } from "jotai";
import type { JSX } from "react";
import { AppStateAtom, Atom } from "../../../atoms";
import { Switch } from "../../common/Switch";

export const ShouldShowInvertButton = (): JSX.Element => {
    const shouldShowInvertButton = useAtomValue(
        AppStateAtom.shouldShowInvertButton,
    );
    const setAppStore = useSetAtom(Atom.appStore);

    return (
        <Switch
            label="色反転ボタンをビューアーに表示"
            checked={shouldShowInvertButton}
            onCheckedChange={(c) =>
                setAppStore((a) => a.setShouldShowInvertButton(c))
            }
        />
    );
};
