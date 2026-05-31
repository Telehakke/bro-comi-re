import { useAtomValue } from "jotai";
import { useRef, type JSX } from "react";
import { Atom } from "./atoms";
import { ChevronLeft, ChevronRight } from "./components/ChevronIcons";
import { Infos } from "./components/Infos";
import { Notification } from "./components/Notification";
import { TapAreas } from "./components/TapAreas";
import { Home } from "./components/home/Home";
import { ImageViewer } from "./components/imageViewer/ImageViewer";
import { SideMenu } from "./components/sideMenu/SideMenu";
import type { ViewerBody, ViewerCanvas } from "./models/viewerManager";

const pl = { paddingLeft: "env(safe-area-inset-left)" };
const pr = { paddingRight: "env(safe-area-inset-right)" };

export const App = (): JSX.Element => {
    const body = useRef<ViewerBody>(null);
    const canvas = useRef<ViewerCanvas>(null);
    const shouldShowViewer = useAtomValue(Atom.shouldShowViewer);

    if (shouldShowViewer) {
        return (
            <div id="viewer" style={{ scrollbarWidth: "none" }}>
                <ImageViewer body={body} canvas={canvas} />
                <Notification />
                <div className="fixed inset-y-0 left-4" style={{ ...pl }}>
                    <ChevronLeft />
                </div>
                <div className="fixed inset-y-0 right-4" style={{ ...pr }}>
                    <ChevronRight />
                </div>
                <TapAreas />
                <SideMenu />
                <Infos {...pl} {...pr} />
            </div>
        );
    } else {
        return <Home />;
    }
};
