import { BlobReader, BlobWriter, ZipReader, type Entry } from "@zip.js/zip.js";

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

    readonly hasFiles = (): boolean => {
        return this.files.length > 0;
    };

    readonly getBlob = async (index?: number): Promise<Blob | undefined> => {
        const i = index ?? this.index;
        if (i < 0) return undefined;

        const file = this.files.at(i);
        if (file == null) return undefined;
        if (file instanceof File) return file;

        // @ts-expect-error getData()が型定義されていないため警告を無視
        const asyncBlob = file.getData(new BlobWriter()) as Promise<Blob>;
        return await asyncBlob;
    };

    readonly progress = (): string | undefined => {
        if (!this.hasFiles()) return undefined;
        return `${this.index + 1} / ${this.files.length}`;
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
