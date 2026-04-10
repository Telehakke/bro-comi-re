import {
    Slider as ArkSlider,
    type SliderValueChangeDetails,
} from "@ark-ui/react/slider";
import type { JSX, ReactNode } from "react";

export const Slider = (props: {
    value: number; // スライダーの値
    min?: number; // 最小値
    max?: number; // 最大値
    step?: number; // 増減値
    origin?: "center" | "start" | "end"; // 塗りつぶしの原点
    label?: (value: number) => ReactNode; // ラベル
    onValueChange?: (value: number) => void; // 値が変化するたびに呼び出される関数
    onValueChangeEnd?: (value: number) => void; // 値が確定すると呼び出される関数
}): JSX.Element => {
    return (
        <SliderRoot
            value={[props.value]}
            min={props.min}
            max={props.max}
            step={props.step}
            origin={props.origin}
            onValueChange={(v) => props.onValueChange?.(v.value[0])}
            onValueChangeEnd={(v) => props.onValueChangeEnd?.(v.value[0])}
        >
            <SliderLabel>{props.label?.(props.value)}</SliderLabel>
            <SliderControl />
        </SliderRoot>
    );
};

/* -------------------------------------------------------------------------- */

const SliderRoot = (props: {
    value?: number[];
    min?: number;
    max?: number;
    step?: number;
    origin?: "center" | "start" | "end";
    onValueChange?: (details: SliderValueChangeDetails) => void;
    onValueChangeEnd?: (details: SliderValueChangeDetails) => void;
    children?: ReactNode;
}): JSX.Element => {
    return (
        <ArkSlider.Root
            value={props.value}
            min={props.min}
            max={props.max}
            step={props.step}
            origin={props.origin}
            onValueChange={(v) => props.onValueChange?.(v)}
            onValueChangeEnd={(v) => props.onValueChangeEnd?.(v)}
            className="p-2"
        >
            {props.children}
        </ArkSlider.Root>
    );
};

/* -------------------------------------------------------------------------- */

const SliderLabel = (props: { children?: ReactNode }): JSX.Element => {
    return (
        <ArkSlider.Label className="flex items-center text-sm whitespace-pre-wrap tabular-nums">
            {props.children}
        </ArkSlider.Label>
    );
};

/* -------------------------------------------------------------------------- */

const SliderControl = (): JSX.Element => {
    return (
        <ArkSlider.Control className="my-2">
            <SliderTrack />
            <SliderThumb />
        </ArkSlider.Control>
    );
};

const SliderTrack = (): JSX.Element => {
    const className = {
        bgGray: "bg-neutral-300 dark:bg-neutral-600",
        bgBlue: "bg-blue-500",
    };

    return (
        <ArkSlider.Track
            className={`h-2.5 overflow-hidden rounded-full ${className.bgGray}`}
        >
            <ArkSlider.Range className={`h-2.5 ${className.bgBlue}`} />
        </ArkSlider.Track>
    );
};

const SliderThumb = (): JSX.Element => {
    const className = {
        _: "inset-0 my-auto size-5 rounded-full",
        bg: "bg-white dark:bg-neutral-200",
        border: "border-2 border-blue-500",
        outline: "outline-offset-1 focus-visible:outline-2 outline-blue-500/75",
    };

    return (
        <ArkSlider.Thumb
            className={Object.values(className).join(" ")}
            index={0}
        >
            <ArkSlider.HiddenInput />
        </ArkSlider.Thumb>
    );
};
