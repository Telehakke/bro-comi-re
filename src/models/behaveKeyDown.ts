export const behaveKeyDown = (props: {
    ev: KeyboardEvent;
    goToLeft: () => void;
    goToRight: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
}): void => {
    switch (props.ev.code) {
        case "ArrowLeft":
            props.ev.preventDefault();
            props.goToLeft();
            break;
        case "ArrowRight":
            props.ev.preventDefault();
            props.goToRight();
            break;
        case "ArrowUp":
            props.ev.preventDefault();
            props.zoomIn();
            break;
        case "ArrowDown":
            props.ev.preventDefault();
            props.zoomOut();
            break;
    }
};
