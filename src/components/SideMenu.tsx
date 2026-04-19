import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { EllipsisVertical } from "lucide-react";
import React, { useEffect, useRef, useState, type JSX } from "react";
import { ActionAtom, Atom } from "../atoms";
import {
    MovementDirectionEnum,
    ViewSplitCountEnum,
    WritingTypeEnum,
    type MovementDirection,
    type ViewSplitCount,
    type WritingType,
} from "../models/appState";
import { FileManager } from "../models/fileManager";
import { FilterStrength, ScrollSpeed, ZoomStep } from "../models/validator";
import { Card } from "./common/Card";
import { SegmentGroup } from "./common/SegmentGroup";
import { SideMenuDialog } from "./common/SideMenuDialog";
import { Slider } from "./common/Slider";
import { Switch } from "./common/Switch";

export const SideMenu = (props: {
    viewerRef: React.RefObject<HTMLDivElement | null>;
    imageRef: React.RefObject<HTMLImageElement | null>;
}): JSX.Element => {
    const [isOpenSideMenu, setIsOpenSideMenu] = useAtom(Atom.isOpenSideMenu);
    const appStore = useAtomValue(Atom.appStore);

    return (
        <SideMenuDialog
            open={isOpenSideMenu}
            onOpenChange={setIsOpenSideMenu}
            closeOnInteractOutside
        >
            <div className="w-80 space-y-4">
                <CloseButton />
                <SelectPageSlider {...props} key={appStore.writingType} />
                <Card>
                    <WritingTypeSegmentGroup />
                    <MovementDirectionSegmentGroup />
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
                <p className="whitespace-pre-wrap">
                    {appStore.histories
                        .map((h) => `${h.name}, ${h.index}`)
                        .join("\n")}
                </p>
            </div>
        </SideMenuDialog>
    );
};

/* -------------------------------------------------------------------------- */

export const MenuButton = (): JSX.Element => {
    const setIsOpenSideMenu = useSetAtom(Atom.isOpenSideMenu);

    const className = {
        _: "size-10 rounded-full transition select-none",
        position: "fixed top-4 left-4",
        grid: "grid place-items-center",
        bg: "bg-neutral-500/25",
        hoverBg: "hover:bg-neutral-600/25",
        activeBg: "active:bg-neutral-700/25",
        border: "border border-neutral-200/25 focus-visible:border-transparent",
        outline:
            "-outline-offset-2 outline-blue-500/75 focus-visible:outline-2",
        stroke: "stroke-neutral-100/75",
    };

    return (
        <button
            className={Object.values(className).join(" ")}
            onClick={() => setIsOpenSideMenu(true)}
        >
            <EllipsisVertical className="stroke-inherit" />
        </button>
    );
};

const closeViewerAtom = atom(null, (_, set) => {
    set(Atom.fileManager, new FileManager());
    set(Atom.isOpenSideMenu, false);
    set(Atom.zipFileName, undefined);
    set(Atom.zoomManager, (z) => z.reset());
    set(Atom.imageBlob, undefined);
});

const CloseButton = (): JSX.Element => {
    const closeViewer = useSetAtom(closeViewerAtom);

    return (
        <button
            className="mx-auto block h-8 rounded-full border px-2"
            onClick={closeViewer}
        >
            本を閉じる
        </button>
    );
};

/* -------------------------------------------------------------------------- */

const SelectPageSlider = (props: {
    viewerRef: React.RefObject<HTMLDivElement | null>;
    imageRef: React.RefObject<HTMLImageElement | null>;
}): JSX.Element => {
    const appStore = useAtomValue(Atom.appStore);
    const fileManager = useAtomValue(Atom.fileManager);
    const [index, setIndex] = useState(
        appStore.writingType === "vertical"
            ? fileManager.files.length - fileManager.index - 1
            : fileManager.index,
    );
    const [blob, setBlob] = useState<Blob | undefined>(undefined);

    const fileIndex = (value: number): number => {
        return appStore.writingType === "vertical"
            ? fileManager.files.length - value - 1
            : value;
    };

    const handleChange = (value: number): void => {
        setIndex(value);
    };

    const handleChangeEnd = async (value: number): Promise<void> => {
        const blob = await fileManager.getBlob(fileIndex(value));
        setBlob(blob);
    };

    return (
        <div>
            <Slider
                label={(v) => {
                    return `ページ：${fileIndex(v) + 1} / ${fileManager.files.length}`;
                }}
                min={0}
                max={fileManager.files.length - 1}
                value={index}
                origin={appStore.writingType === "vertical" ? "end" : "start"}
                onValueChange={handleChange}
                onValueChangeEnd={handleChangeEnd}
            />
            <Thumbnail blob={blob} index={fileIndex(index)} {...props} />
        </div>
    );
};

// prettier-ignore
const moveToIndexPageAtom = atom(
    null,
    (_, set, index: number, viewer: HTMLDivElement, image: HTMLImageElement) => {
        set(ActionAtom.moveToIndexPage, index);
        set(ActionAtom.scrollToStart, viewer, image);
        set(ActionAtom.updateHistory);
        set(Atom.zoomManager, (z) => z.reset());
        set(Atom.isOpenSideMenu, false)
    },
);

const Thumbnail = (props: {
    blob?: Blob;
    index: number;
    viewerRef: React.RefObject<HTMLDivElement | null>;
    imageRef: React.RefObject<HTMLImageElement | null>;
}): JSX.Element => {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const moveToIndexPage = useSetAtom(moveToIndexPageAtom);

    useEffect(() => {
        const img = imgRef.current;
        if (img == null || props.blob == null) return;

        const imageURL = URL.createObjectURL(props.blob);
        img.src = imageURL;
        return (): void => {
            URL.revokeObjectURL(imageURL);
        };
    }, [props.blob]);

    if (props.blob == null) return <></>;
    return (
        <img
            className="m-auto max-h-50 max-w-50"
            ref={imgRef}
            onClick={() => {
                const viewer = props.viewerRef.current;
                const image = props.imageRef.current;
                if (viewer == null || image == null) return;
                moveToIndexPage(props.index, viewer, image);
            }}
        />
    );
};

/* -------------------------------------------------------------------------- */

const WritingTypeSegmentGroup = (): JSX.Element => {
    const [appStore, setAppStore] = useAtom(Atom.appStore);

    const handleChange = (value: string | null): void => {
        setAppStore((a) => a.setWritingType(value as WritingType));
    };

    return (
        <SegmentGroup
            label="書籍の種類"
            items={Object.values(WritingTypeEnum)}
            value={appStore.writingType}
            onValueChange={handleChange}
        />
    );
};

const MovementDirectionSegmentGroup = (): JSX.Element => {
    const [appStore, setAppStore] = useAtom(Atom.appStore);

    const handleChange = (value: string | null): void => {
        setAppStore((a) => a.setMovementDirection(value as MovementDirection));
    };

    return (
        <SegmentGroup
            label="スライド方向"
            items={Object.values(MovementDirectionEnum)}
            value={appStore.movementDirection}
            onValueChange={handleChange}
        />
    );
};

const ViewSplitCountSegmentGroup = (): JSX.Element => {
    const [appStore, setAppStore] = useAtom(Atom.appStore);

    const handleChange = (value: string | null): void => {
        setAppStore((a) => a.setViewSplitCount(value as ViewSplitCount));
    };

    return (
        <SegmentGroup
            label="拡大時の画面分割数"
            items={Object.values(ViewSplitCountEnum)}
            value={appStore.viewSplitCount}
            onValueChange={handleChange}
        />
    );
};

const ZoomStepSlider = (): JSX.Element => {
    const [appStore, setAppStore] = useAtom(Atom.appStore);
    const [value, setValue] = useState(appStore.zoomStep);

    const handleChange = (value: number): void => {
        setValue(value);
    };

    const handleChangeEnd = (value: number): void => {
        setAppStore((a) => a.setZoomStep(value));
    };

    return (
        <Slider
            label={(v) => `ズームの増加率：${v}%`}
            min={ZoomStep.MIN}
            max={ZoomStep.MAX}
            step={5}
            value={value}
            onValueChange={handleChange}
            onValueChangeEnd={handleChangeEnd}
        />
    );
};

const ShouldAdvanceSwitch = (): JSX.Element => {
    const [appStore, setAppStore] = useAtom(Atom.appStore);

    const handleChange = (checked: boolean): void => {
        setAppStore((a) => a.setShouldAdvance(checked));
    };

    return (
        <Switch
            label="左右タップで進む"
            checked={appStore.shouldAdvance}
            onCheckedChange={handleChange}
        />
    );
};

const OnSharpeningFilterSwitch = (): JSX.Element => {
    const [appStore, setAppStore] = useAtom(Atom.appStore);

    const handleChange = (checked: boolean): void => {
        setAppStore((a) => a.setOnSharpeningFilter(checked));
    };

    return (
        <Switch
            label="先鋭化フィルターの有効化"
            checked={appStore.onSharpeningFilter}
            onCheckedChange={handleChange}
        />
    );
};

const SharpeningFilterStrengthSlider = (): JSX.Element => {
    const [appStore, setAppStore] = useAtom(Atom.appStore);
    const [value, setValue] = useState(appStore.sharpeningFilterStrength);
    const sharpeningFilter = useAtomValue(Atom.sharpeningFilter);

    const handleChange = (value: number): void => {
        setValue(value);
    };

    const handleChangeEnd = (value: number): void => {
        setAppStore((a) => a.setSharpeningFilterStrength(value));
        sharpeningFilter.setStrength(value);
    };

    return (
        <Slider
            label={(v) => `フィルター強度：${v}`}
            min={FilterStrength.MIN}
            max={FilterStrength.MAX}
            value={value}
            onValueChange={handleChange}
            onValueChangeEnd={handleChangeEnd}
        />
    );
};

const ScrollSpeedSlider = (): JSX.Element => {
    const [appStore, setAppStore] = useAtom(Atom.appStore);
    const [value, setValue] = useState(appStore.scrollSpeed);

    const handleChange = (value: number): void => {
        setValue(value);
    };

    const handleChangeEnd = (value: number): void => {
        setAppStore((a) => a.setScrollSpeed(value));
    };

    return (
        <Slider
            label={(v) => `垂直・水平スクロール速度：${v}倍`}
            min={ScrollSpeed.MIN}
            max={ScrollSpeed.MAX}
            value={value}
            onValueChange={handleChange}
            onValueChangeEnd={handleChangeEnd}
        />
    );
};
