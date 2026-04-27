import { useAtomValue, useSetAtom } from "jotai";
import { Trash2 } from "lucide-react";
import type { JSX } from "react";
import { AppStateAtom, Atom } from "../../../atoms";
import { HistoryManager } from "../../../models/historyManager";

export const History = (): JSX.Element => {
    const histories = useAtomValue(AppStateAtom.histories);

    return (
        <div>
            <div className="flex items-center justify-between">
                <p className="">履歴（最大100件）</p>
                {histories.length > 0 && <ClearButton />}
            </div>
            <ol className="list-decimal pl-5">
                {histories.map((h) => (
                    <li className="text-sm" key={h.name}>
                        {`${h.name}: `}
                        <span className="text-nowrap">{`${h.index + 1}ページ`}</span>
                    </li>
                ))}
            </ol>
        </div>
    );
};

const ClearButton = (): JSX.Element => {
    const setAppStore = useSetAtom(Atom.appStore);
    const setHistoryManager = useSetAtom(Atom.historyManager);

    const className = {
        _: "mb-2 size-10 flex-none self-end rounded-full transition",
        grid: "grid place-items-center",
        hoverBg: "hover:bg-neutral-200 dark:hover:bg-neutral-800",
        activeBg: "active:bg-neutral-300 dark:active:bg-neutral-700",
        outline:
            "-outline-offset-2 outline-blue-500/75 focus-visible:outline-2",
        stroke: "stroke-red-500 dark:stroke-red-400",
    };

    return (
        <button
            className={Object.values(className).join(" ")}
            onClick={() => {
                setAppStore((a) => a.setHistories([]));
                setHistoryManager(new HistoryManager());
            }}
        >
            <Trash2 className="stroke-inherit" />
        </button>
    );
};
