import { useAtomValue, useSetAtom } from "jotai";
import { useState, type JSX } from "react";
import { AppStateAtom, Atom } from "../../../atoms";
import { FilterStrength } from "../../../models/validator";
import { Slider } from "../../common/Slider";

export const SharpeningFilterStrengthSlider = (): JSX.Element => {
    const strength = useAtomValue(AppStateAtom.sharpeningFilterStrength);
    const setAppStore = useSetAtom(Atom.appStore);
    const [value, setValue] = useState(strength);
    const sharpeningFilter = useAtomValue(Atom.sharpeningFilter);

    return (
        <Slider
            label={(v) => `フィルター強度：${v}`}
            min={FilterStrength.MIN}
            max={FilterStrength.MAX}
            value={value}
            onValueChange={setValue}
            onValueChangeEnd={(v) => {
                setAppStore((a) => a.setSharpeningFilterStrength(v));
                sharpeningFilter.setStrength(v);
            }}
        />
    );
};
