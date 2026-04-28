import { atom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState, type JSX } from "react";
import { ActionAtom, AppStateAtom, Atom } from "../../../atoms";
import type { WritingType } from "../../../models/appState";
import type { FileManager } from "../../../models/fileManager";
import type { ViewerBody, ViewerContent } from "../../../models/types";
import { Slider } from "../../common/Slider";

export const SelectPageSlider = (props: {
    body: React.RefObject<ViewerBody>;
    content: React.RefObject<ViewerContent>;
}): JSX.Element => {
    const writingType = useAtomValue(AppStateAtom.writingType);

    return <Part {...props} key={writingType} />;
};

/* -------------------------------------------------------------------------- */

const Part = (props: {
    body: React.RefObject<ViewerBody>;
    content: React.RefObject<ViewerContent>;
}): JSX.Element => {
    const writingType = useAtomValue(AppStateAtom.writingType);
    const fileManager = useAtomValue(Atom.fileManager);
    const [index, setIndex] = useState(
        correctIndex(writingType, fileManager, fileManager.index),
    );
    const [blob, setBlob] = useState<Blob | undefined>(undefined);

    return (
        <div>
            <Slider
                label={(v) =>
                    `ページ：${correctIndex(writingType, fileManager, v) + 1} / ${fileManager.length}`
                }
                origin={writingType === "vertical" ? "end" : "start"}
                min={0}
                max={fileManager.length - 1}
                value={index}
                onValueChange={setIndex}
                onValueChangeEnd={(v) => {
                    fileManager
                        .getBlob(correctIndex(writingType, fileManager, v))
                        .then((blob) => setBlob(blob));
                }}
            />
            <Thumbnail
                blob={blob}
                index={correctIndex(writingType, fileManager, index)}
                {...props}
            />
        </div>
    );
};

const correctIndex = (
    writingType: WritingType,
    fileManager: FileManager,
    index: number,
): number => {
    switch (writingType) {
        case "vertical":
            return fileManager.length - index - 1;
        case "horizontal":
            return index;
    }
};

/* -------------------------------------------------------------------------- */

const moveToIndexPageAtom = atom(
    null,
    (_, set, index: number, viewer: ViewerBody, content: ViewerContent) => {
        if (viewer == null || content == null) return;

        set(ActionAtom.moveToIndexPage, index);
        set(ActionAtom.positionStart);
        set(Atom.zoomManager, (z) => z.reset());
        set(Atom.isOpenSideMenu, false);
    },
);

const Thumbnail = (props: {
    blob?: Blob;
    index: number;
    body: React.RefObject<ViewerBody>;
    content: React.RefObject<ViewerContent>;
}): JSX.Element => {
    const image = useRef<HTMLImageElement | null>(null);
    const moveToIndexPage = useSetAtom(moveToIndexPageAtom);

    useEffect(() => {
        if (image.current == null || props.blob == null) return;

        const imageURL = URL.createObjectURL(props.blob);
        image.current.src = imageURL;
        return (): void => {
            URL.revokeObjectURL(imageURL);
        };
    }, [props.blob]);

    if (props.blob == null) return <></>;
    return (
        <img
            className="m-auto max-h-50 max-w-50"
            ref={image}
            onClick={() => {
                moveToIndexPage(
                    props.index,
                    props.body.current,
                    props.content.current,
                );
            }}
        />
    );
};
