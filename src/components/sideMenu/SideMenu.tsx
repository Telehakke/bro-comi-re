import { useAtom, useAtomValue } from "jotai";
import { type JSX } from "react";
import { AppStateAtom, Atom } from "../../atoms";
import type { Content, Viewer } from "../../models/types";
import { Card } from "../common/Card";
import { SideMenuDialog } from "../common/SideMenuDialog";
import { CloseButton } from "./sub/CloseButton";
import { DisplayModeSegmentGroup } from "./sub/DisplayModeSegmentGroup";
import { OnSharpeningFilterSwitch } from "./sub/OnSharpeningFilterSwitch";
import { ScrollSpeedSlider } from "./sub/ScrollSpeedSlider";
import { SelectPageSlider } from "./sub/SelectPageSlider";
import { SharpeningFilterStrengthSlider } from "./sub/SharpeningFilterStrengthSlider";
import { ShouldAdvanceSwitch } from "./sub/ShouldAdvanceSwitch";
import { ViewSplitCountSegmentGroup } from "./sub/ViewSplitCountSegmentGroup";
import { WritingTypeSegmentGroup } from "./sub/WritingTypeSegmentGroup";
import { ZoomStepSlider } from "./sub/ZoomStepSlider";

export const SideMenu = (props: {
    viewerRef: React.RefObject<Viewer>;
    contentRef: React.RefObject<Content>;
}): JSX.Element => {
    const [isOpenSideMenu, setIsOpenSideMenu] = useAtom(Atom.isOpenSideMenu);

    return (
        <SideMenuDialog
            closeOnInteractOutside
            unmountOnExit
            lazyMount
            open={isOpenSideMenu}
            onOpenChange={setIsOpenSideMenu}
        >
            <div className="w-80 space-y-4">
                <CloseButton />
                <SelectPageSlider {...props} />
                <Card>
                    <WritingTypeSegmentGroup />
                </Card>
                <Card
                    footer={`1：1枚の画像を表示\n1・2：表紙だけ1枚、以降は2枚\n2：2枚の画像を並べて表示`}
                >
                    <DisplayModeSegmentGroup />
                </Card>
                <Card footer="拡大時に次、または前のページに移動するのに必要な最大タップ数">
                    <ViewSplitCountSegmentGroup />
                </Card>
                <Card
                    footer={`左右どちらをタップしても次に進みます\n有効時は下をタップで戻ります`}
                >
                    <ShouldAdvanceSwitch />
                </Card>
                <Card
                    footer={`拡大：ダブルタップ\n縮小：右クリック、またはロングタッチ`}
                >
                    <ZoomStepSlider />
                </Card>
                <Card>
                    <OnSharpeningFilterSwitch />
                    <SharpeningFilterStrengthSlider />
                </Card>
                <Card
                    footer={`垂直スクロール：左右をスクロール\n水平スクロール：下をスクロール`}
                >
                    <ScrollSpeedSlider />
                </Card>
                <p>[履歴]</p>
                <History />
            </div>
        </SideMenuDialog>
    );
};

const History = (): JSX.Element => {
    const histories = useAtomValue(AppStateAtom.histories);

    return (
        <p className="whitespace-pre-wrap">
            {histories.map((h) => `${h.name}, ${h.index}`).join("\n")}
        </p>
    );
};
