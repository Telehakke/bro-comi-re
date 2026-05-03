import { useAtomValue } from "jotai";
import { useRef, type JSX } from "react";
import init from "../rustProject/pkg/wasm_zip";
import { Atom } from "./atoms";
import { ChevronLeft, ChevronRight } from "./components/ChevronIcons";
import { InvertFilterButton } from "./components/InvertFilterButton";
import { Notification } from "./components/Notification";
import { Progress } from "./components/Progress";
import { TapAreas } from "./components/TapAreas";
import { Time } from "./components/Time";
import { Home } from "./components/home/Home";
import { ImageViewer } from "./components/imageViewer/ImageViewer";
import { SideMenu } from "./components/sideMenu/SideMenu";
import { MenuButton } from "./components/sideMenu/sub/MenuButton";
import type { ViewerBody, ViewerContent } from "./models/types";

const pl = { paddingLeft: "env(safe-area-inset-left)" };
const pr = { paddingRight: "env(safe-area-inset-right)" };

export const App = (): JSX.Element => {
    init();
    const body = useRef<ViewerBody>(null);
    const content = useRef<ViewerContent>(null);
    const shouldShowViewer = useAtomValue(Atom.shouldShowViewer);

    if (shouldShowViewer) {
        return (
            <div id="viewer" style={{ scrollbarWidth: "none" }}>
                <ImageViewer body={body} content={content} />
                <Notification />
                <div className="fixed inset-y-0 left-4" style={{ ...pl }}>
                    <ChevronLeft />
                </div>
                <div className="fixed inset-y-0 right-4" style={{ ...pr }}>
                    <ChevronRight />
                </div>
                <TapAreas body={body} content={content} />
                <SideMenu body={body} content={content} />
                <div
                    className="fixed top-4 left-4 flex gap-4"
                    style={{ ...pl }}
                >
                    <MenuButton />
                    <InvertFilterButton body={body} content={content} />
                </div>
                <div className="fixed top-4 right-4" style={{ ...pr }}>
                    <Time />
                </div>
                <div
                    className="fixed inset-x-0 bottom-0"
                    style={{ ...pl, ...pr }}
                >
                    <Progress />
                </div>
            </div>
        );
    } else {
        return <Home />;
    }
};
