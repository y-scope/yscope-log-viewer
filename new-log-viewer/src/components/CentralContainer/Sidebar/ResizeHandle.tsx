import React, {
    useCallback,
    useEffect,
    useState,
} from "react";

import "./ResizeHandle.css";


interface ResizeHandleProps {
    onHandleRelease: () => void,

    /**
     * Gets triggered when a resize event occurs.
     *
     * @param resizeHandlePosition The horizontal distance, in pixels, between the mouse pointer
     * and the left edge of the viewport.
     */
    onResize: (resizeHandlePosition: number) => void,
}

/**
 * A vertical handle for resizing an object.
 *
 * @param props
 * @param props.onResize The method to call when a resize occurs.
 * @param props.onHandleRelease
 * @return
 */
const ResizeHandle = ({
    onResize,
    onHandleRelease,
}: ResizeHandleProps) => {
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

    const handleMouseDown = (ev: React.MouseEvent) => {
        ev.preventDefault();
        setIsMouseDown(true);
    };

    const handleMouseMove = useCallback((ev: MouseEvent) => {
        ev.preventDefault();
        onResize(ev.clientX);
    }, [onResize]);

    const handleMouseUp = useCallback((ev: MouseEvent) => {
        ev.preventDefault();
        setIsMouseDown(false);
        onHandleRelease();
    }, [onHandleRelease]);

    // On `isMouseDown` change, add / remove event listeners.
    useEffect(() => {
        if (isMouseDown) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            // Always clean up the event listeners before the hook is re-run due to `isMouseDown`
            // changes / when the component is unmounted.
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [
        handleMouseMove,
        handleMouseUp,
        isMouseDown,
    ]);

    return (
        <div
            className={`resize-handle ${isMouseDown ?
                "resize-handle-holding" :
                ""}`}
            onMouseDown={handleMouseDown}/>
    );
};


export default ResizeHandle;
