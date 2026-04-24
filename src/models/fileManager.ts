import { BlobReader, BlobWriter, ZipReader, type Entry } from "@zip.js/zip.js";
import type { DisplayMode, WritingType } from "./appState";

export class FileManager {
    readonly files: readonly File[] | Entry[];
    readonly index: number;

    constructor(files?: readonly File[] | Entry[], index?: number) {
        this.files = files ?? [];
        this.index = index ?? 0;
    }

    static readonly fromFiles = (files: readonly File[]): FileManager => {
        const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name));
        return new FileManager(sorted);
    };

    static readonly fromZip = async (zip: File): Promise<FileManager> => {
        const zipReader = new ZipReader(new BlobReader(zip));
        const entries = await zipReader.getEntries();
        zipReader.close();
        const images = entries
            .filter((entry) => {
                const name = entry.filename.toLowerCase();
                if (name.startsWith("__")) return false;
                if (name.startsWith(".")) return false;
                if (name.endsWith(".jpg")) return true;
                if (name.endsWith(".jpeg")) return true;
                if (name.endsWith(".png")) return true;
                if (name.endsWith(".webp")) return true;
                if (name.endsWith(".avif")) return true;
                if (name.endsWith(".heic")) return true;
                if (name.endsWith(".jxl")) return true;
                return false;
            })
            .sort((a, b) => a.filename.localeCompare(b.filename));
        return new FileManager(images);
    };

    get length(): number {
        return this.files.length;
    }

    readonly hasFiles = (): boolean => {
        return this.files.length > 0;
    };

    readonly getBlob = async (index: number): Promise<Blob | undefined> => {
        if (index < 0) return undefined;

        const file = this.files.at(index);
        if (file == null) return undefined;
        if (file instanceof File) return file;

        // @ts-expect-error getData()が型定義されていないため警告を無視
        const asyncBlob = file.getData(new BlobWriter()) as Promise<Blob>;
        return await asyncBlob;
    };

    readonly getLeftBlob = async (
        displayMode: DisplayMode,
        writingType: WritingType,
    ): Promise<Blob | undefined> => {
        let i = this.index;
        const isOdd = this.index % 2 === 1;
        switch (displayMode) {
            case "book":
                if (writingType === "vertical" && isOdd) {
                    i = this.index + 1;
                } else if (writingType === "horizontal" && !isOdd) {
                    i = this.index - 1;
                }
                break;
            case "double":
                if (writingType === "vertical" && !isOdd) {
                    i = this.index + 1;
                } else if (writingType === "horizontal" && isOdd) {
                    i = this.index - 1;
                }
                break;
        }
        return this.getBlob(i);
    };

    readonly getRightBlob = async (
        displayMode: DisplayMode,
        writingType: WritingType,
    ): Promise<Blob | undefined> => {
        let i = this.index;
        const isOdd = this.index % 2 === 1;
        switch (displayMode) {
            case "single":
                return undefined;
            case "book":
                if (writingType === "vertical" && !isOdd) {
                    i = this.index - 1;
                } else if (writingType === "horizontal" && isOdd) {
                    i = this.index + 1;
                }
                break;
            case "double":
                if (writingType === "vertical" && isOdd) {
                    i = this.index - 1;
                } else if (writingType === "horizontal" && !isOdd) {
                    i = this.index + 1;
                }
                break;
        }
        this.getBlob(i);
    };

    readonly progress = (): string | undefined => {
        if (!this.hasFiles()) return undefined;
        return `${this.index + 1} / ${this.files.length}`;
    };

    readonly hasPreviousFile = (): boolean => {
        return this.index > 0;
    };

    readonly hasNextFile = (): boolean => {
        return this.index < this.files.length - 1;
    };

    readonly decrementIndex = (): FileManager => {
        return this.copyWith({ index: Math.max(this.index - 1, 0) });
    };

    readonly incrementIndex = (): FileManager => {
        return this.copyWith({
            index: Math.min(this.index + 1, this.files.length - 1),
        });
    };

    readonly setIndex = (index: number): FileManager => {
        return this.copyWith({
            index: Math.max(Math.min(index, this.files.length - 1), 0),
        });
    };

    private readonly copyWith = ({
        files,
        index,
    }: Partial<{
        files: readonly File[] | Entry[];
        index: number;
    }>): FileManager => {
        return new FileManager(files ?? this.files, index ?? this.index);
    };
}
