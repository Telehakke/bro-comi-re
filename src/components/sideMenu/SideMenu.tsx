import { useAtom } from "jotai";
import { type JSX } from "react";
import { Atom } from "../../atoms";
import type { ViewerBody, ViewerContent } from "../../models/types";
import { Card } from "../common/Card";
import { SideMenuDialog } from "../common/SideMenuDialog";
import { CloseButton } from "./sub/CloseButton";
import { ContentFitSegmentGroup } from "./sub/ContentFitSegmentGroup";
import { DisplayModeSegmentGroup } from "./sub/DisplayModeSegmentGroup";
import { History } from "./sub/History";
import { OnSharpeningFilterSwitch } from "./sub/OnSharpeningFilterSwitch";
import { ScrollSpeedSlider } from "./sub/ScrollSpeedSlider";
import { SelectPageSlider } from "./sub/SelectPageSlider";
import { SharpeningFilterStrengthSlider } from "./sub/SharpeningFilterStrengthSlider";
import { ShouldAdvanceSwitch } from "./sub/ShouldAdvanceSwitch";
import { ShouldShowInvertButtonSwitch } from "./sub/ShouldShowInvertButtonSwitch";
import { TapAreaHeightSegmentGroup } from "./sub/TapAreaHeightSegmentGroup";
import { TapAreaWidthSegmentGroup } from "./sub/TapAreaWidthSegmentGroup";
import { ViewSplitCountSegmentGroup } from "./sub/ViewSplitCountSegmentGroup";
import { WritingTypeSegmentGroup } from "./sub/WritingTypeSegmentGroup";
import { ZoomStepSlider } from "./sub/ZoomStepSlider";
import { ShouldShowFullscreenButtonSwitch } from "./sub/shouldShowFullscreenButtonSwitch";

export const SideMenu = (props: {
    body: React.RefObject<ViewerBody>;
    content: React.RefObject<ViewerContent>;
}): JSX.Element => {
    const [isOpenSideMenu, setIsOpenSideMenu] = useAtom(Atom.isOpenSideMenu);

    return (
        <SideMenuDialog
            closeOnInteractOutside
            unmountOnExit
            lazyMount
            modal={false}
            open={isOpenSideMenu}
            onOpenChange={setIsOpenSideMenu}
        >
            <div
                className="w-80 space-y-4"
                style={{ marginLeft: "env(safe-area-inset-left)" }}
            >
                <CloseButton />
                <SelectPageSlider {...props} />
                <Card>
                    <WritingTypeSegmentGroup />
                    <ContentFitSegmentGroup />
                </Card>
                <Card
                    footer={`1：1枚の画像を表示\n1・2：表紙だけ1枚、以降は2枚\n2：2枚の画像を並べて表示`}
                >
                    <DisplayModeSegmentGroup />
                </Card>
                <Card footer="拡大時に次、または前のページに移動するのに必要な最大タップ数">
                    <ViewSplitCountSegmentGroup />
                </Card>
                <Card>
                    <TapAreaWidthSegmentGroup />
                    <TapAreaHeightSegmentGroup />
                </Card>
                <Card
                    footer={`左右どちらをタップしても次に進みます\n右クリック、またはロングタッチで前に戻ります`}
                >
                    <ShouldAdvanceSwitch />
                </Card>
                <Card
                    footer={`垂直スクロール：左右をスクロール\n水平スクロール：下をスクロール`}
                >
                    <ScrollSpeedSlider />
                </Card>
                <Card
                    footer={`拡大：ダブルタップ\n縮小：右クリック、またはロングタッチ`}
                >
                    <ZoomStepSlider />
                </Card>
                <Card>
                    <OnSharpeningFilterSwitch {...props} />
                    <SharpeningFilterStrengthSlider />
                </Card>
                <Card footer="全画面への切り替えはiPhone以外で使用できます">
                    <ShouldShowInvertButtonSwitch />
                    <ShouldShowFullscreenButtonSwitch />
                </Card>
                <History />
            </div>
        </SideMenuDialog>
    );
};
