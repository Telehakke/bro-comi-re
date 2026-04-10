import { useEffect, useRef, useState, type JSX } from "react";

export const TapAreas = (props: {
    onBottomClick: () => void;
    onLeftClick: () => void;
    onRightClick: () => void;
    onHorizontalScroll: (deltaX: number) => void;
    onVerticalScroll: (deltaY: number) => void;
}): JSX.Element => {
    return (
        <>
            <TapArea
                className="inset-x-0 bottom-0 h-20"
                onClick={props.onBottomClick}
                onScroll={(deltaX) => props.onHorizontalScroll(deltaX)}
            />
            <TapArea
                className="inset-y-0 left-0 w-20"
                onClick={props.onLeftClick}
                onScroll={(_, deltaY) => props.onVerticalScroll(deltaY)}
            />
            <TapArea
                className="inset-y-0 right-0 w-20"
                onClick={props.onRightClick}
                onScroll={(_, deltaY) => props.onVerticalScroll(deltaY)}
            />
        </>
    );
};

const TapArea = (props: {
    onClick: () => void;
    onScroll: (deltaX: number, deltaY: number) => void;
    className: string;
}): JSX.Element => {
    const divRef = useRef<HTMLDivElement | null>(null);
    const timerId = useRef<number | undefined>(undefined);
    const prevClient = useRef({ x: 0, y: 0 });
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const div = divRef.current;
        if (div == null) return;

        const handleTouchMove = (ev: TouchEvent): void => {
            ev.preventDefault();
            const x = ev.changedTouches[0].clientX;
            const y = ev.changedTouches[0].clientY;
            props.onScroll(prevClient.current.x - x, prevClient.current.y - y);
            prevClient.current = { x, y };
        };

        const handleWheel = (ev: WheelEvent): void => {
            ev.preventDefault();
            setIsActive(true);
            clearTimeout(timerId.current);
            timerId.current = setTimeout(() => {
                setIsActive(false);
            }, 200);
            props.onScroll(ev.deltaX, ev.deltaY);
        };

        div.addEventListener("touchmove", handleTouchMove, {
            passive: false,
        });
        div.addEventListener("wheel", handleWheel, { passive: false });
        return (): void => {
            div.removeEventListener("touchmove", handleTouchMove);
            div.removeEventListener("wheel", handleWheel);
        };
    }, [props]);

    const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (
        ev,
    ): void => {
        const x = ev.changedTouches[0].clientX;
        const y = ev.changedTouches[0].clientY;
        prevClient.current = { x, y };
    };

    const className = {
        _: "fixed transition select-none",
        activeBg: "active:bg-blue-500/25",
        activeBg2: isActive && "bg-blue-500/25",
        props: props.className,
    };

    return (
        <div
            className={Object.values(className).join(" ")}
            ref={divRef}
            onClick={props.onClick}
            onTouchStart={handleTouchStart}
        />
    );
};
