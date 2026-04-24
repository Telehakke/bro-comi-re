import { getDefaultStore, useAtomValue } from "jotai";
import { useRef, type JSX } from "react";
import { ActionAtom, Atom } from "./atoms";
import { Home } from "./components/Home";
import { ImageView } from "./components/ImageView";
import { Notification } from "./components/Notification";
import { Progress } from "./components/Progress";
import { MenuButton, SideMenu } from "./components/SideMenu";
import { TapAreas } from "./components/TapAreas";
import { Time } from "./components/Time";

const defaultStore = getDefaultStore();

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        defaultStore.set(ActionAtom.updateHistory);
    }
});

export const App = (): JSX.Element => {
    const viewerRef = useRef<HTMLDivElement | null>(null);
    const content = useRef<HTMLDivElement | null>(null);
    const fileManager = useAtomValue(Atom.fileManager);

    return (
        <>
            {!fileManager.hasFiles() && <Home />}
            {fileManager.hasFiles() && (
                <div className="h-[150dvh]">
                    <ImageView viewerRef={viewerRef} contentRef={content} />
                    <TapAreas viewerRef={viewerRef} contentRef={content} />
                    <MenuButton />
                    <Time />
                    <Progress />
                    <Notification />
                    <SideMenu viewerRef={viewerRef} contentRef={content} />
                </div>
            )}
        </>
    );
};
