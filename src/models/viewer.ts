import type { ViewerBody, ViewerContent } from "./types";

export type Viewer = Readonly<{
    body: ViewerBody;
    content: ViewerContent;
    create: (body: ViewerBody, content: ViewerContent) => Viewer;
    spaceWidth: () => number;
    spaceHeight: () => number;
    positionX: () => number | undefined;
    positionY: () => number | undefined;
    isReachedLimitX: () => boolean;
    isHorizontalFit: () => boolean;
}>;

export const Viewer: Viewer = {
    body: null,
    content: null,
    create(body, content) {
        return {
            ...this,
            body: body,
            content: content,
        };
    },
    spaceWidth() {
        if (this.body == null || this.content == null) return 0;
        return this.content.clientWidth - this.body.clientWidth;
    },
    spaceHeight() {
        if (this.body == null || this.content == null) return 0;
        return this.content.clientHeight - this.body.clientHeight;
    },
    positionX() {
        if (this.body == null) return undefined;
        const w = this.spaceWidth();
        return w > 0 ? (Math.ceil(this.body.scrollLeft) / w) * 100 : undefined;
    },
    positionY() {
        if (this.body == null) return undefined;
        const h = this.spaceHeight();
        return h > 0 ? (Math.ceil(this.body.scrollTop) / h) * 100 : undefined;
    },
    isReachedLimitX() {
        const x = this.positionX() ?? 0;
        return x <= 0 || x >= 100;
    },
    isHorizontalFit() {
        if (this.body == null || this.content == null) return true;
        const bodyRatio = this.body.clientWidth / this.body.clientHeight;
        const contentRatio =
            this.content.clientWidth / this.content.clientHeight;
        return bodyRatio <= contentRatio;
    },
};
