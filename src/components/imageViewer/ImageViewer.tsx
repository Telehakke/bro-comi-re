import { atom, useSetAtom } from "jotai";
import React, { useEffect, useRef, type JSX } from "react";
import { ActionAtom, Atom } from "../../atoms";
import { behaveGamepad } from "../../models/behaveGamepad";
import { behaveKeyDown } from "../../models/behaveKeyDown";
import type { ViewerBody, ViewerContent } from "../../models/types";
import { Viewer } from "../../models/viewer";
import { BodyView } from "./sub/BodyView";
import { Content } from "./sub/Content";

const goToLeftAtom = atom(null, (get, set, viewer: Viewer) => {
    if (get(Atom.isOpenSideMenu)) return;

    if (get(Atom.isUserScrolled)) {
        set(Atom.isUserScrolled, false);
        set(Atom.scrollManager, (s) => s.update(viewer));
    }

    const { writingType } = get(Atom.appStore);
    switch (writingType) {
        case "vertical":
            set(ActionAtom.goToNextAtom, viewer);
            break;
        case "horizontal":
            set(ActionAtom.goToPreviousAtom, viewer);
            break;
    }
});

const goToRightAtom = atom(null, (get, set, viewer: Viewer) => {
    if (get(Atom.isOpenSideMenu)) return;

    if (get(Atom.isUserScrolled)) {
        set(Atom.isUserScrolled, false);
        set(Atom.scrollManager, (s) => s.update(viewer));
    }

    const { writingType } = get(Atom.appStore);
    switch (writingType) {
        case "vertical":
            set(ActionAtom.goToPreviousAtom, viewer);
            break;
        case "horizontal":
            set(ActionAtom.goToNextAtom, viewer);
            break;
    }
});

const zoomInAtom = atom(null, (get, set, viewer: Viewer) => {
    if (get(Atom.isOpenSideMenu)) return;

    set(Atom.scrollManager, (s) => s.update(viewer));
    const { zoomStep } = get(Atom.appStore);
    const zoom = get(Atom.zoomManager).zoomIn(zoomStep);
    set(Atom.zoomManager, zoom);
    set(Atom.messageManager, (m) => m.setMessage(`${zoom.scale}%`));
});

const zoomOutAtom = atom(null, (get, set, viewer: Viewer) => {
    if (get(Atom.isOpenSideMenu)) return;

    set(Atom.scrollManager, (s) => s.update(viewer));
    const { zoomStep } = get(Atom.appStore);
    const zoom = get(Atom.zoomManager).zoomOut(zoomStep);
    set(Atom.zoomManager, zoom);
    set(Atom.messageManager, (m) => m.setMessage(`${zoom.scale}%`));
});

const scrollAtom = atom(
    null,
    (get, set, x: number, y: number, viewer: Viewer) => {
        const scroll = get(Atom.scrollManager).add(x, y);
        scroll.applyScroll(viewer);
        set(Atom.scrollManager, scroll);
        set(Atom.isUserScrolled, true);
    },
);

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
    content,
}: {
    body: React.RefObject<ViewerBody>;
    content: React.RefObject<ViewerContent>;
}): JSX.Element => {
    const timerId = useRef<number | undefined>(undefined);
    const goToLeft = useSetAtom(goToLeftAtom);
    const goToRight = useSetAtom(goToRightAtom);
    const setZoomManager = useSetAtom(Atom.zoomManager);
    const setShouldShowInfo = useSetAtom(Atom.shouldShowInfo);
    const zoomIn = useSetAtom(zoomInAtom);
    const zoomOut = useSetAtom(zoomOutAtom);
    const scroll = useSetAtom(scrollAtom);
    const moveToLeftPage = useSetAtom(moveToLeftPageAtom);
    const moveToRightPage = useSetAtom(moveToRightPageAtom);

    useEffect(() => {
        const handleKeyDown = (ev: KeyboardEvent): void => {
            const viewer = Viewer.create(body.current, content.current);
            behaveKeyDown({
                ev,
                goToLeft: () => goToLeft(viewer),
                goToRight: () => goToRight(viewer),
                zoomIn: () => zoomIn(viewer),
                zoomOut: () => zoomOut(viewer),
            });
        };
        document.body.addEventListener("keydown", handleKeyDown);

        const gamepadLoop = (): void => {
            const viewer = Viewer.create(body.current, content.current);
            behaveGamepad({
                goToLeft: () => goToLeft(viewer),
                goToRight: () => goToRight(viewer),
                zoomIn: () => zoomIn(viewer),
                zoomOut: () => zoomOut(viewer),
                scroll: (x, y) => scroll(x, y, viewer),
            });
            requestAnimationFrame(gamepadLoop);
        };
        window.addEventListener("gamepadconnected", gamepadLoop);
        return (): void => {
            document.body.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("gamepadconnected", gamepadLoop);
        };
    }, [body, content, goToLeft, goToRight, scroll, zoomIn, zoomOut]);

    return (
        <BodyView
            body={body}
            content={content}
            onResize={(width, height) =>
                setZoomManager((z) => z.setBodySize({ width, height }))
            }
            onClick={() => {
                window.clearTimeout(timerId.current);
                timerId.current = window.setTimeout(() => {
                    setShouldShowInfo((v) => !v);
                }, 300);
            }}
            onDoubleClick={() => {
                window.clearTimeout(timerId.current);
                zoomIn(Viewer.create(body.current, content.current));
            }}
            onRightClick={() =>
                zoomOut(Viewer.create(body.current, content.current))
            }
            onLongPress={() =>
                zoomOut(Viewer.create(body.current, content.current))
            }
            onLeftSidePull={() => moveToLeftPage()}
            onRightSidePull={() => moveToRightPage()}
        >
            <Content body={body} content={content} />
        </BodyView>
    );
};
