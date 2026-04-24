import { type JSX } from "react";
import { OpenImageFilesButton } from "./sub/OpenImageFilesButton";
import { OpenZipFileButton } from "./sub/OpenZipFileButton";

export const Home = (): JSX.Element => {
    return (
        <div className="m-auto grid h-dvh w-max grid-cols-2 place-items-center gap-4">
            <OpenImageFilesButton />
            <OpenZipFileButton />
        </div>
    );
};
