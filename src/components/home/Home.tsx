import { type JSX } from "react";
import { OpenImageFilesButton } from "./sub/OpenImageFilesButton";
import { OpenZipFileButton } from "./sub/OpenZipFileButton";

export const Home = (): JSX.Element => {
    const className = {
        _: "m-auto w-max",
        position: "fixed inset-x-0 top-1/2 -translate-y-1/2",
        grid: "grid grid-cols-2 place-items-center gap-4",
    };

    return (
        <>
            <div className={Object.values(className).join(" ")}>
                <OpenImageFilesButton />
                <OpenZipFileButton />
            </div>
            <p className="fixed bottom-4 left-4">v0.260629a</p>
        </>
    );
};
