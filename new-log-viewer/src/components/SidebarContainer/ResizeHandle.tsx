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

    const handleMouseUp = useCallback((ev: MouseEvent) => {
        ev.preventDefault();
        setIsMouseDown(false);
        onHandleRelease();
    }, [onHandleRelease]);

    useEffect(() => {
        if (false === isMouseDown) {
            return () => null;
        }

        window.addEventListener("mouseup", handleMouseUp);

        const handleMouseMove = (ev: MouseEvent) => {
            ev.preventDefault();
            onResize(ev.clientX);
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [
        handleMouseUp,
        isMouseDown,
        onResize,
    ]);

    return (
        <div
            className={"resize-handle"}
            onMouseDown={handleMouseDown}/>
    );
};


export default ResizeHandle;
