import { Switch as ArkSwitch } from "@ark-ui/react/switch";
import type { JSX, ReactNode } from "react";

export const Switch = (props: {
    label?: string; // ラベル
    checked?: boolean; // スイッチの値
    onCheckedChange?: (checked: boolean) => void; // 値が変化するたびに呼び出される関数
}): JSX.Element => {
    return (
        <SwitchRoot
            checked={props.checked}
            onCheckedChange={(v) => props.onCheckedChange?.(v)}
        >
            <div className="flex items-center justify-between gap-2">
                <SwitchLabel>{props.label}</SwitchLabel>
                <SwitchControl />
            </div>
            <ArkSwitch.HiddenInput />
        </SwitchRoot>
    );
};

/* -------------------------------------------------------------------------- */

const SwitchRoot = (props: {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    children?: ReactNode;
}): JSX.Element => {
    return (
        <ArkSwitch.Root
            checked={props.checked}
            onCheckedChange={(v) => props.onCheckedChange?.(v.checked)}
            className="block p-2"
        >
            {props.children}
        </ArkSwitch.Root>
    );
};

/* -------------------------------------------------------------------------- */

const SwitchLabel = (props: { children?: ReactNode }): JSX.Element => {
    return (
        <ArkSwitch.Label className="text-sm">{props.children}</ArkSwitch.Label>
    );
};

/* -------------------------------------------------------------------------- */

const SwitchControl = (): JSX.Element => {
    const className = {
        _: "relative h-6 w-11 flex-none rounded-full transition",
        bg: "bg-neutral-300 dark:bg-neutral-600",
        hoverBg: "data-hover:bg-neutral-400 dark:data-hover:bg-neutral-500",
        activeBg:
            "data-[active]:bg-neutral-300 dark:data-[active]:bg-neutral-600",
        checkedBg:
            "data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-blue-500",
        checkedHoverBg:
            "data-[state=checked]:data-hover:bg-blue-600 dark:data-[state=checked]:data-hover:bg-blue-400",
        checkedActiveBg:
            "data-[state=checked]:data-[active]:bg-blue-500 dark:data-[state=checked]:data-[active]:bg-blue-500",
        outline:
            "outline-offset-1 data-focus-visible:outline-2 outline-blue-500/75",
    };

    return (
        <ArkSwitch.Control className={Object.values(className).join(" ")}>
            <SwitchThumb />
        </ArkSwitch.Control>
    );
};

const SwitchThumb = (): JSX.Element => {
    const className = {
        _: "absolute inset-0 m-auto size-5 rounded-full transition",
        translate: "-translate-x-1/2 data-[state=checked]:translate-x-1/2",
        bg: "bg-white dark:bg-neutral-200",
    };

    return <ArkSwitch.Thumb className={Object.values(className).join(" ")} />;
};
