import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { EllipsisVertical } from "lucide-react";
import { useEffect, useRef, useState, type JSX } from "react";
import { Atom } from "../atoms";
import {
    MovementDirectionEnum,
    ViewSplitCountEnum,
    WritingTypeEnum,
    type MovementDirection,
    type ViewSplitCount,
    type WritingType,
} from "../models/appState";
import { FileManager } from "../models/fileManager";
import { FilterStrength, ZoomStep } from "../models/validator";
import { Card } from "./common/Card";
import { SegmentGroup } from "./common/SegmentGroup";
import { SideMenuDialog } from "./common/SideMenuDialog";
import { Slider } from "./common/Slider";
import { Switch } from "./common/Switch";

export const SideMenu = (): JSX.Element => {
    const [isOpenSideMenu, setIsOpenSideMenu] = useAtom(Atom.isOpenSideMenu);
    const setFileManager = useSetAtom(Atom.fileManager);
    const setImageBlob = useSetAtom(Atom.imageBlob);
    const setZoomManager = useSetAtom(Atom.zoomManager);
    const appStore = useAtomValue(Atom.appStore);

    return (
        <SideMenuDialog
            open={isOpenSideMenu}
            onOpenChange={setIsOpenSideMenu}
            closeOnInteractOutside={true}
        >
            <div className="w-80 space-y-4">
                <button
                    className="mx-auto block h-8 rounded-full border px-2"
                    onClick={() => {
                        setIsOpenSideMenu(false);
                        setFileManager(new FileManager());
                        setImageBlob(undefined);
                        setZoomManager((z) => z.reset());
                    }}
                >
                    本を閉じる
                </button>
                <SelectPageSlider key={appStore.writingType} />
                <Card>
                    <WritingTypeSegmentGroup />
                    <MovementDirectionSegmentGroup />
                </Card>
                <Card footer="拡大時に次、または前のページに移動するのに必要な最大タップ数">
                    <ViewSplitCountSegmentGroup />
                </Card>
                <Card
                    footer={`左右どちらをタップしても次に進みます\n戻りたい場合、下をタップします`}
                >
                    <ShouldAdvanceSwitch />
                </Card>
                <Card>
                    <ZoomStepSlider />
                </Card>
                <Card>
                    <OnSharpeningFilterSwitch />
                    <SharpeningFilterStrengthSlider />
                </Card>
                <p>[履歴]</p>
                <p>
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
    const className = {
        _: "size-10 rounded-full transition",
        position: "fixed top-4 left-4",
        grid: "grid place-items-center",
        bg: "bg-neutral-500/25",
        hoverBg: "hover:bg-neutral-600/25",
        activeBg: "active:bg-neutral-700/25",
        border: "border border-neutral-200/25 focus-visible:border-transparent",
        outline:
            "-outline-offset-2 outline-blue-500/75 focus-visible:outline-2",
        stroke: "stroke-neutral-100",
    };

    const setIsOpenSideMenu = useSetAtom(Atom.isOpenSideMenu);

    return (
        <button
            className={Object.values(className).join(" ")}
            onClick={() => setIsOpenSideMenu(true)}
        >
            <EllipsisVertical className="stroke-inherit" />
        </button>
    );
};

/* -------------------------------------------------------------------------- */

const SelectPageSlider = (): JSX.Element => {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [appStore, setAppStore] = useAtom(Atom.appStore);
    const [fileManager, setFileManager] = useAtom(Atom.fileManager);
    const [value, setValue] = useState(
        appStore.writingType === "vertical"
            ? fileManager.files.length - fileManager.index
            : fileManager.index + 1,
    );
    const setImageBlob = useSetAtom(Atom.imageBlob);
    const [blob, setBlob] = useState<Blob | undefined>(undefined);
    const setIsOpenSideMenu = useSetAtom(Atom.isOpenSideMenu);
    const zipFileName = useAtomValue(Atom.zipFileName);
    const [historyManager, setHistoryManager] = useAtom(Atom.historyManager);

    useEffect(() => {
        const img = imgRef.current;
        if (img == null || blob == null) return;

        const imageURL = URL.createObjectURL(blob);
        img.src = imageURL;
        return (): void => {
            URL.revokeObjectURL(imageURL);
        };
    }, [blob]);

    const handleChange = (value: number): void => {
        setValue(value);
    };

    const handleChangeEnd = (value: number): void => {
        const index =
            appStore.writingType === "vertical"
                ? fileManager.files.length - value
                : value - 1;
        fileManager.getBlob(index).then((blob) => {
            setBlob(blob);
        });
    };

    const handleClick = (): void => {
        setFileManager((f) => {
            const newFileManager = f.setIndex(value - 1);
            newFileManager.getBlob().then((blob) => {
                setImageBlob(blob);
            });
            if (zipFileName != null) {
                const newHistoryManager = historyManager.update({
                    name: zipFileName,
                    index: newFileManager.index,
                });
                setHistoryManager(newHistoryManager);
                setAppStore((a) => a.setHistories(newHistoryManager.histories));
            }
            return newFileManager;
        });
        setIsOpenSideMenu(false);
    };

    return (
        <div>
            <Slider
                label={(v) => {
                    const page =
                        appStore.writingType === "vertical"
                            ? fileManager.files.length - v + 1
                            : v;
                    return `ページ：${page} / ${fileManager.files.length}`;
                }}
                min={1}
                max={fileManager.files.length}
                value={value}
                origin={appStore.writingType === "vertical" ? "end" : "start"}
                onValueChange={handleChange}
                onValueChangeEnd={handleChangeEnd}
            />
            <img
                className="m-auto max-h-50 max-w-50"
                ref={imgRef}
                onClick={handleClick}
            />
        </div>
    );
};

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

    const handleChange = (value: number): void => {
        setValue(value);
    };

    const handleChangeEnd = (value: number): void => {
        setAppStore((a) => a.setSharpeningFilterStrength(value));
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
