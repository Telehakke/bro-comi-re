import { useAtomValue, useSetAtom } from "jotai";
import type { JSX } from "react";
import { AppStateAtom, Atom } from "../../../atoms";
import { Switch } from "../../common/Switch";

export const ShouldShowFullscreenButtonSwitch = (): JSX.Element => {
    const shouldShowFullscreenButton = useAtomValue(
        AppStateAtom.shouldShowFullscreenButton,
    );
    const setAppStore = useSetAtom(Atom.appStore);

    return (
        <Switch
            label="全画面ボタンをビューアーに表示"
            checked={shouldShowFullscreenButton}
            onCheckedChange={(c) =>
                setAppStore((a) => a.setShouldShowFullscreenButton(c))
            }
        />
    );
};
