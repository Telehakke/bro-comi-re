const prevPressed: boolean[] = [];

export const behaveGamepad = (props: {
    goToLeft: () => void;
    goToRight: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    scroll: (x: number, y: number) => void;
}): void => {
    const gamepad = navigator.getGamepads()[0];
    if (gamepad == null) return;

    gamepad.buttons.forEach((b, i) => {
        if (b.pressed && !prevPressed[i]) {
            switch (i) {
                case 12:
                    props.zoomIn();
                    break;
                case 13:
                    props.zoomOut();
                    break;
                case 14:
                    props.goToLeft();
                    break;
                case 15:
                    props.goToRight();
                    break;
            }
        }
        prevPressed[i] = b.pressed;
    });
    gamepad.axes.forEach((a, i) => {
        if (isTilt(a)) {
            switch (i) {
                case 0:
                    props.scroll(a * 2, 0);
                    break;
                case 1:
                    props.scroll(0, a * 2);
                    break;
            }
        }
    });
};

const isTilt = (value: number): boolean => {
    return value <= -0.1 || 0.1 <= value;
};
