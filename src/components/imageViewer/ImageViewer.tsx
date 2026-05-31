import { atom, useSetAtom } from "jotai";
import React, { useEffect, useRef, type JSX } from "react";
import { ActionAtom, Atom } from "../../atoms";
import { behaveGamepad } from "../../models/behaveGamepad";
import { behaveKeyDown } from "../../models/behaveKeyDown";
import type { ViewerBody, ViewerCanvas } from "../../models/viewerManager";
import { BodyView } from "./sub/BodyView";
import { Content } from "./sub/Content";

const goToLeftAtom = atom(null, (get, set) => {
    if (get(Atom.isOpenSideMenu)) return;

    if (get(Atom.isUserScrolled)) {
        set(Atom.isUserScrolled, false);
        set(Atom.scrollManager, (s) => s.update(get(Atom.viewerManager)));
    }

    const { writingType } = get(Atom.appStore);
    switch (writingType) {
        case "vertical":
            set(ActionAtom.goToNextAtom);
            break;
        case "horizontal":
            set(ActionAtom.goToPreviousAtom);
            break;
    }
});

const goToRightAtom = atom(null, (get, set) => {
    if (get(Atom.isOpenSideMenu)) return;

    if (get(Atom.isUserScrolled)) {
        set(Atom.isUserScrolled, false);
        set(Atom.scrollManager, (s) => s.update(get(Atom.viewerManager)));
    }

    const { writingType } = get(Atom.appStore);
    switch (writingType) {
        case "vertical":
            set(ActionAtom.goToPreviousAtom);
            break;
        case "horizontal":
            set(ActionAtom.goToNextAtom);
            break;
    }
});

const zoomInAtom = atom(null, (get, set) => {
    if (get(Atom.isOpenSideMenu)) return;

    set(Atom.scrollManager, (s) => s.update(get(Atom.viewerManager)));
    const { zoomStep } = get(Atom.appStore);
    const zoom = get(Atom.zoomManager).zoomIn(zoomStep);
    set(Atom.zoomManager, zoom);
    set(Atom.messageManager, (m) => m.setMessage(`${zoom.scale}%`));
});

const zoomOutAtom = atom(null, (get, set) => {
    if (get(Atom.isOpenSideMenu)) return;

    set(Atom.scrollManager, (s) => s.update(get(Atom.viewerManager)));
    const { zoomStep } = get(Atom.appStore);
    const zoom = get(Atom.zoomManager).zoomOut(zoomStep);
    set(Atom.zoomManager, zoom);
    set(Atom.messageManager, (m) => m.setMessage(`${zoom.scale}%`));
});

const scrollAtom = atom(null, (get, set, x: number, y: number) => {
    const scroll = get(Atom.scrollManager).add(x, y);
    scroll.applyScroll(get(Atom.viewerManager));
    set(Atom.scrollManager, scroll);
    set(Atom.isUserScrolled, true);
});

const moveToLeftPageAtom = atom(null, (get, set) => {
    const { writingType } = get(Atom.appStore);
    const file = get(Atom.fileManager);
    switch (writingType) {
        case "vertical":
            if (!file.hasNextFile()) return;
            set(ActionAtom.moveToNextPage);
            set(ActionAtom.positionStart);
            break;
        case "horizontal":
            if (!file.hasPreviousFile()) return;
            set(ActionAtom.moveToPreviousPage);
            set(ActionAtom.positionEnd);
            break;
    }
});

const moveToRightPageAtom = atom(null, (get, set) => {
    const { writingType } = get(Atom.appStore);
    const file = get(Atom.fileManager);
    switch (writingType) {
        case "vertical":
            if (!file.hasPreviousFile()) return;
            set(ActionAtom.moveToPreviousPage);
            set(ActionAtom.positionEnd);
            break;

        case "horizontal":
            if (!file.hasNextFile()) return;
            set(ActionAtom.moveToNextPage);
            set(ActionAtom.positionStart);
            break;
    }
});

export const ImageViewer = ({
    body,
    canvas,
}: {
    body: React.RefObject<ViewerBody>;
    canvas: React.RefObject<ViewerCanvas>;
}): JSX.Element => {
    const timerId = useRef<number | undefined>(undefined);
    const goToLeft = useSetAtom(goToLeftAtom);
    const goToRight = useSetAtom(goToRightAtom);
    const setShouldShowInfo = useSetAtom(Atom.infoState);
    const setViewerManager = useSetAtom(Atom.viewerManager);
    const zoomIn = useSetAtom(zoomInAtom);
    const zoomOut = useSetAtom(zoomOutAtom);
    const scroll = useSetAtom(scrollAtom);
    const moveToLeftPage = useSetAtom(moveToLeftPageAtom);
    const moveToRightPage = useSetAtom(moveToRightPageAtom);

    useEffect(() => {
        const handleKeyDown = (ev: KeyboardEvent): void => {
            behaveKeyDown({
                ev,
                goToLeft: () => goToLeft(),
                goToRight: () => goToRight(),
                zoomIn: () => zoomIn(),
                zoomOut: () => zoomOut(),
            });
        };
        document.body.addEventListener("keydown", handleKeyDown);

        const gamepadLoop = (): void => {
            behaveGamepad({
                goToLeft: () => goToLeft(),
                goToRight: () => goToRight(),
                zoomIn: () => zoomIn(),
                zoomOut: () => zoomOut(),
                scroll: (x, y) => scroll(x, y),
            });
            requestAnimationFrame(gamepadLoop);
        };
        window.addEventListener("gamepadconnected", gamepadLoop);
        return (): void => {
            document.body.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("gamepadconnected", gamepadLoop);
        };
    }, [goToLeft, goToRight, scroll, zoomIn, zoomOut]);

    return (
        <BodyView
            body={body}
            onResize={() => setViewerManager((v) => v.setBody(body.current))}
            onClick={() => {
                window.clearTimeout(timerId.current);
                timerId.current = window.setTimeout(() => {
                    setShouldShowInfo((v) => {
                        if (v === "visible") return "hidden";
                        return "visible";
                    });
                }, 300);
            }}
            onDoubleClick={() => {
                window.clearTimeout(timerId.current);
                zoomIn();
            }}
            onSubClick={() => zoomOut()}
            onLeftSidePull={() => moveToLeftPage()}
            onRightSidePull={() => moveToRightPage()}
        >
            <Content body={body} canvas={canvas} />
        </BodyView>
    );
};
