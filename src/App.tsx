import { useAtomValue } from "jotai";
import { useRef, type JSX } from "react";
import { Atom } from "./atoms";
import { Notification } from "./components/Notification";
import { Progress } from "./components/Progress";
import { TapAreas } from "./components/TapAreas";
import { Time } from "./components/Time";
import { Home } from "./components/home/Home";
import { ImageViewer } from "./components/imageViewer/ImageViewer";
import { SideMenu } from "./components/sideMenu/SideMenu";
import { MenuButton } from "./components/sideMenu/sub/MenuButton";
import type { ViewerBody, ViewerContent } from "./models/types";

export const App = (): JSX.Element => {
    const body = useRef<ViewerBody>(null);
    const content = useRef<ViewerContent>(null);
    const shouldShowViewer = useAtomValue(Atom.shouldShowViewer);

    if (shouldShowViewer) {
        return (
            <div id="viewer" style={{ scrollbarWidth: "none" }}>
                <ImageViewer body={body} content={content} />
                <TapAreas body={body} content={content} />
                <SideMenu body={body} content={content} />
                <MenuButton />
                <Time />
                <Progress />
                <Notification />
            </div>
        );
    } else {
        return <Home />;
    }
};
