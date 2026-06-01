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

export const App = (): JSX.Element => {
    const body = useRef<ViewerBody>(null);
    const canvas = useRef<ViewerCanvas>(null);
    const shouldShowViewer = useAtomValue(Atom.shouldShowViewer);
    const isLandscape = useAtomValue(Atom.isLandscape);

    if (shouldShowViewer) {
        return (
            <div id="viewer" style={{ scrollbarWidth: "none" }}>
                <ImageViewer body={body} canvas={canvas} />
                <Notification />
                <div
                    className="fixed inset-y-0 left-4"
                    style={{ paddingLeft: style(isLandscape).paddingLeft }}
                >
                    <ChevronLeft />
                </div>
                <div
                    className="fixed inset-y-0 right-4"
                    style={{ paddingRight: style(isLandscape).paddingRight }}
                >
                    <ChevronRight />
                </div>
                <TapAreas />
                <SideMenu />
                <Infos {...style(isLandscape)} />
            </div>
        );
    } else {
        return <Home />;
    }
};

const style = (
    isLandscape: boolean,
): Partial<{
    paddingLeft: string;
    paddingRight: string;
    paddingBottom: string;
}> => {
    return {
        paddingLeft: isLandscape ? "env(safe-area-inset-left)" : undefined,
        paddingRight: isLandscape ? "env(safe-area-inset-right)" : undefined,
        paddingBottom: isLandscape ? undefined : "env(safe-area-inset-bottom)",
    };
};
