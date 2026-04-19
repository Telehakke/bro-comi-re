import { useAtomValue } from "jotai";
import { useRef, type JSX } from "react";
import { Atom } from "./atoms";
import { Home } from "./components/Home";
import { ImageView } from "./components/ImageView";
import { Notification } from "./components/Notification";
import { Progress } from "./components/Progress";
import { MenuButton, SideMenu } from "./components/SideMenu";
import { TapAreas } from "./components/TapAreas";
import { Time } from "./components/Time";

export const App = (): JSX.Element => {
    const viewerRef = useRef<HTMLDivElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const fileManager = useAtomValue(Atom.fileManager);

    return (
        <>
            {!fileManager.hasFiles() && <Home />}
            {fileManager.hasFiles() && (
                <div className="h-[150dvh]">
                    <ImageView viewerRef={viewerRef} imageRef={imageRef} />
                    <TapAreas viewerRef={viewerRef} imageRef={imageRef} />
                    <MenuButton />
                    <Time />
                    <Progress />
                    <Notification />
                    <SideMenu viewerRef={viewerRef} imageRef={imageRef} />
                </div>
            )}
        </>
    );
};
