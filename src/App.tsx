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
import type { Body, Content } from "./models/types";

export const App = (): JSX.Element => {
    const body = useRef<Body>(null);
    const content = useRef<Content>(null);
    const shouldShowViewer = useAtomValue(Atom.shouldShowViewer);

    if (shouldShowViewer) {
        return (
            <div id="viewer" style={{ scrollbarWidth: "none" }}>
                <ImageView body={body} content={content} />
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
