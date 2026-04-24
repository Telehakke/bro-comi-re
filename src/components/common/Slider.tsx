import {
    Slider as ArkSlider,
    type SliderValueChangeDetails,
} from "@ark-ui/react/slider";
import type { JSX, ReactNode } from "react";

type SliderProps = {
    label?: (value: number) => ReactNode;
    origin?: "center" | "start" | "end";
    min?: number;
    max?: number;
    step?: number;
    value: number;
    onValueChange?: (value: number) => void;
    onValueChangeEnd?: (value: number) => void;
};

export const Slider = (props: SliderProps): JSX.Element => {
    return (
        <Root
            {...props}
            value={[props.value]}
            onValueChange={(v) => props.onValueChange?.(v.value[0])}
            onValueChangeEnd={(v) => props.onValueChangeEnd?.(v.value[0])}
        >
            <Label>{props.label?.(props.value)}</Label>
            <Control />
        </Root>
    );
};

/* -------------------------------------------------------------------------- */

const Root = (
    props: Partial<{
        origin: "center" | "start" | "end";
        min: number;
        max: number;
        step: number;
        value: number[];
        onValueChange: (details: SliderValueChangeDetails) => void;
        onValueChangeEnd: (details: SliderValueChangeDetails) => void;
        children: ReactNode;
    }>,
): JSX.Element => {
    return (
        <ArkSlider.Root
            origin={props.origin}
            min={props.min}
            max={props.max}
            step={props.step}
            value={props.value}
            onValueChange={(v) => props.onValueChange?.(v)}
            onValueChangeEnd={(v) => props.onValueChangeEnd?.(v)}
            thumbSize={{ width: 20, height: 20 }}
            className="p-2"
        >
            {props.children}
        </ArkSlider.Root>
    );
};

/* -------------------------------------------------------------------------- */

const Label = (props: { children?: ReactNode }): JSX.Element => {
    const className = {
        _: "block text-sm",
        text: "text-neutral-500 dark:text-neutral-400",
    };

    return (
        <ArkSlider.Label className={Object.values(className).join(" ")}>
            {props.children}
        </ArkSlider.Label>
    );
};

/* -------------------------------------------------------------------------- */

const Control = (): JSX.Element => {
    return (
        <ArkSlider.Control className="group my-2">
            <Track />
            <Thumb />
        </ArkSlider.Control>
    );
};

const Track = (): JSX.Element => {
    const className = {
        _: "h-2.5 overflow-hidden rounded-full transition",
        bg: "bg-neutral-300 dark:bg-neutral-600",
        hoverBg: "group-hover:bg-neutral-400 dark:group-hover:bg-neutral-500",
        draggingBg:
            "data-dragging:bg-neutral-400 dark:data-dragging:bg-neutral-500",
    };

    return (
        <ArkSlider.Track className={Object.values(className).join(" ")}>
            <ArkSlider.Range className="h-2.5 bg-blue-500" />
        </ArkSlider.Track>
    );
};

const Thumb = (): JSX.Element => {
    const className = {
        _: "inset-0 my-auto size-5 rounded-full",
        bg: "bg-white",
        border: "border-2 border-blue-500",
        outline: "outline-offset-1 outline-blue-500/75 focus-visible:outline-2",
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
