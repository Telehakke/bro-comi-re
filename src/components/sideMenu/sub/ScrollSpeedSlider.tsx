import { useAtomValue, useSetAtom } from "jotai";
import { useState, type JSX } from "react";
import { AppStateAtom, Atom } from "../../../atoms";
import { ScrollSpeed } from "../../../models/validator";
import { Slider } from "../../common/Slider";

export const ScrollSpeedSlider = (): JSX.Element => {
    const scrollSpeed = useAtomValue(AppStateAtom.scrollSpeed);
    const setAppStore = useSetAtom(Atom.appStore);
    const [value, setValue] = useState(scrollSpeed);

    return (
        <Slider
            label={(v) => `垂直・水平スクロール速度：${v}倍`}
            min={ScrollSpeed.MIN}
            max={ScrollSpeed.MAX}
            value={value}
            onValueChange={setValue}
            onValueChangeEnd={(v) => {
                setAppStore((a) => a.setScrollSpeed(v));
            }}
        />
    );
};
