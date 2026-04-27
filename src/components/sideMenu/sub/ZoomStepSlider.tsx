import { useAtomValue, useSetAtom } from "jotai";
import { useState, type JSX } from "react";
import { AppStateAtom, Atom } from "../../../atoms";
import { ZoomStep } from "../../../models/validator";
import { Slider } from "../../common/Slider";

export const ZoomStepSlider = (): JSX.Element => {
    const zoomStep = useAtomValue(AppStateAtom.zoomStep);
    const setAppStore = useSetAtom(Atom.appStore);
    const [value, setValue] = useState(zoomStep);

    return (
        <Slider
            label={(v) => `ズームの増減率：${v}%`}
            min={ZoomStep.MIN}
            max={ZoomStep.MAX}
            step={5}
            value={value}
            onValueChange={setValue}
            onValueChangeEnd={(v) => setAppStore((a) => a.setZoomStep(v))}
        />
    );
};
