import { Switch as ArkSwitch } from "@ark-ui/react/switch";
import type { JSX, ReactNode } from "react";

type SwitchProps = Partial<{
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}>;

export const Switch = (props: SwitchProps): JSX.Element => {
    return (
        <Root {...props}>
            <div className="flex items-center justify-between gap-2">
                <Label {...props} />
                <Control />
            </div>
            <ArkSwitch.HiddenInput />
        </Root>
    );
};

/* -------------------------------------------------------------------------- */

const Root = (
    props: Partial<{
        checked: boolean;
        onCheckedChange: (checked: boolean) => void;
        children: ReactNode;
    }>,
): JSX.Element => {
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

const Label = (props: { label?: ReactNode }): JSX.Element => {
    return <ArkSwitch.Label className="text-sm">{props.label}</ArkSwitch.Label>;
};

/* -------------------------------------------------------------------------- */

const Control = (): JSX.Element => {
    const className = {
        _: "relative h-6 w-11 flex-none rounded-full transition",
        bg: "bg-neutral-300 dark:bg-neutral-600",
        hoverBg: "data-hover:bg-neutral-400 dark:data-hover:bg-neutral-500",
        checkedBg: "data-[state=checked]:bg-blue-500 ",
        checkedHoverBg: "data-[state=checked]:data-hover:bg-blue-600",
        outline:
            "outline-offset-1 outline-blue-500/75 data-focus-visible:outline-2",
    };

    return (
        <ArkSwitch.Control className={Object.values(className).join(" ")}>
            <Thumb />
        </ArkSwitch.Control>
    );
};

const Thumb = (): JSX.Element => {
    const className = {
        _: "m-auto size-5 rounded-full transition",
        position:
            "absolute inset-0 -translate-x-1/2 data-[state=checked]:translate-x-1/2",
        bg: "bg-white dark:bg-neutral-200",
    };

    return <ArkSwitch.Thumb className={Object.values(className).join(" ")} />;
};
