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

    // Register the event listener for mouse up.
    useEffect(() => {
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [handleMouseUp]);

    // On mouse down, register the event listener for mouse move.
    useEffect(() => {
        if (false === isMouseDown) {
            return () => null;
        }

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [
        handleMouseMove,
        isMouseDown,
    ]);

    return (
        <div
            className={"resize-handle"}
            onMouseDown={handleMouseDown}/>
    );
};


export default ResizeHandle;
