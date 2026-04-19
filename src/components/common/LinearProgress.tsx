import { Progress as ArkProgress } from "@ark-ui/react/progress";
import type { IntlTranslations } from "@zag-js/progress";
import type { JSX, ReactNode } from "react";

type LinearProgressProps = Partial<{
    className: string;
    value: number | null;
    min: number;
    max: number;
}>;

export const LinearProgress = (props: LinearProgressProps): JSX.Element => {
    return (
        <Root {...props}>
            <Track />
        </Root>
    );
};

/* -------------------------------------------------------------------------- */

const Root = (
    props: Partial<{
        className: string;
        value: number | null;
        min: number;
        max: number;
        children: ReactNode;
    }>,
): JSX.Element => {
    return (
        <ArkProgress.Root
            className={props.className}
            value={props.value}
            min={props.min}
            max={props.max}
            locale={navigator.language}
            translations={navigator.language.startsWith("ja") ? ja : undefined}
        >
            {props.children}
        </ArkProgress.Root>
    );
};

/* -------------------------------------------------------------------------- */

const Track = (): JSX.Element => {
    const className = {
        _: "h-1",
        indeterminate: "data-[state=indeterminate]:animate-pulse",
        bg: "bg-neutral-500 ",
    };

    return (
        <ArkProgress.Track className={Object.values(className).join(" ")}>
            <Range />
        </ArkProgress.Track>
    );
};

const Range = (): JSX.Element => {
    const className = {
        _: "h-1 transition-all ease-linear",
        indeterminate: "data-[state=indeterminate]:hidden",
        bg: "bg-green-500",
    };

    return <ArkProgress.Range className={Object.values(className).join(" ")} />;
};

/* -------------------------------------------------------------------------- */

const ja: IntlTranslations = {
    value: ({ value, percent, formatter }) => {
        if (value === null) return "読み込み中";

        if (formatter) {
            const formatOptions = formatter.resolvedOptions();
            const num =
                formatOptions.style === "percent" ? percent / 100 : value;
            return formatter.format(num);
        }

        return value.toString();
    },
};
