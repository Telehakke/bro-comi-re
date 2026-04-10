const ID = "sharpen";
const TARGET_CLASS_NAME = "sharpen-target";

export class SharpeningFilter {
    private readonly filter: SVGFilterElement;
    private readonly svg: SVGElement;

    constructor() {
        this.filter = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "filter",
        );
        this.filter.id = ID;
        this.svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg",
        );
        this.svg.classList.add(ID);
        this.svg.appendChild(this.filter);
    }

    readonly addSVG = (): void => {
        document.head.appendChild(this.svg);
    };

    readonly removeSVG = (): void => {
        document.querySelector(`svg.${ID}`)?.remove();
    };

    readonly hasSVG = (): boolean => {
        return document.querySelector(`svg.${ID}`) != null;
    };

    readonly applyFilter = (element: HTMLElement): void => {
        element.classList.add(TARGET_CLASS_NAME);
        element.style.filter = `url(#${ID})`;
    };

    readonly clearFilter = (): void => {
        document
            .querySelectorAll<HTMLElement>(`.${TARGET_CLASS_NAME}`)
            .forEach((e) => {
                e.style.filter = "unset";
            });
    };

    readonly reapply = (): void => {
        document
            .querySelectorAll<HTMLElement>(`.${TARGET_CLASS_NAME}`)
            .forEach((e) => {
                e.style.filter = `url(#${ID})`;
            });
    };

    readonly setStrength = (strength: number): void => {
        this.removeChildAll(this.filter);
        const feConvolveMatrix = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "feConvolveMatrix",
        );
        feConvolveMatrix.setAttribute(
            "kernelMatrix",
            this.createMatrix(strength),
        );
        this.filter.appendChild(feConvolveMatrix);
    };

    private readonly removeChildAll = (target: Node): void => {
        while (target.firstChild != null) {
            target.removeChild(target.firstChild);
        }
    };

    private readonly createMatrix = (strength: number): string => {
        const BASE = 0.05;
        const matrix = [...Array(9)].map((_, i) => {
            if (i === 4) {
                return (BASE * strength * 8 + 1).toFixed(2);
            }
            return (-BASE * strength).toFixed(2);
        });
        return matrix.join(" ");
    };
}
