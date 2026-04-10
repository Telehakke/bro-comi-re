import type { JSX, ReactNode } from "react";

export const Card = (props: {
    header?: string;
    footer?: string;
    children?: ReactNode;
}): JSX.Element => {
    return (
        <div className="space-y-1">
            <Header {...props} />
            <Content>{props.children}</Content>
            <Footer {...props} />
        </div>
    );
};

/* -------------------------------------------------------------------------- */

const Header = (props: { header?: string }): JSX.Element => {
    const className = {
        _: "mx-2 text-xs whitespace-pre-line",
        text: "text-neutral-500 dark:text-neutral-400",
    };

    if (props.header == null) return <></>;
    return <p className={Object.values(className).join(" ")}>{props.header}</p>;
};

const Content = (props: { children: ReactNode }): JSX.Element => {
    const className = {
        _: "rounded-lg ",
        bg: "bg-white dark:bg-neutral-800",
        divide: "divide-y divide-neutral-300 dark:divide-neutral-700",
    };

    return (
        <div className={Object.values(className).join(" ")}>
            {props.children}
        </div>
    );
};

const Footer = (props: { footer?: string }): JSX.Element => {
    const className = {
        _: "mx-2 text-xs whitespace-pre-line",
        text: "text-neutral-500 dark:text-neutral-400",
    };

    if (props.footer == null) return <></>;
    return <p className={Object.values(className).join(" ")}>{props.footer}</p>;
};
