import { useAtomValue } from "jotai";
import { useRef, type JSX } from "react";
import { Atom } from "./atoms";
import { ImageView } from "./components/ImageView";
import { Notification } from "./components/Notification";
import { Progress } from "./components/Progress";
import { TapAreas } from "./components/TapAreas";
import { Time } from "./components/Time";
import { Home } from "./components/home/Home";
import { SideMenu } from "./components/sideMenu/SideMenu";
import { MenuButton } from "./components/sideMenu/sub/MenuButton";
import type { Content, Viewer } from "./models/types";

export const App = (): JSX.Element => {
    const viewerRef = useRef<Viewer>(null);
    const contentRef = useRef<Content>(null);
    const shouldShowViewer = useAtomValue(Atom.shouldShowViewer);

    if (shouldShowViewer) {
        return (
            <div id="viewer" style={{ scrollbarWidth: "none" }}>
                <ImageView viewerRef={viewerRef} contentRef={contentRef} />
                <TapAreas viewerRef={viewerRef} contentRef={contentRef} />
                <MenuButton />
                <Time />
                <Progress />
                <Notification />
                <SideMenu viewerRef={viewerRef} contentRef={contentRef} />
            </div>
        );
    } else {
        return <Home />;
    }
};
