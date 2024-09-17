import React, {
    useEffect,
    useState,
} from "react";

import "./ResizeHandle.css";


interface ResizeHandleProps {
    onResize: (offset: number) => void,
}

/**
 * A vertical handle for resizing an object.
 *
 * @param props
 * @param props.onResize The method to call when a resize occurs.
 * @return
 */
const ResizeHandle = ({onResize}: ResizeHandleProps) => {
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

    const handleMouseDown = (ev: React.MouseEvent) => {
        ev.preventDefault();
        setIsMouseDown(true);
    };

    const handleMouseUp = (ev: MouseEvent) => {
        ev.preventDefault();
        setIsMouseDown(false);
    };

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
        isMouseDown,
        onResize,
    ]);

    return (
        <>
            <div
                className={"resize-handle"}
                onMouseDown={handleMouseDown}/>
        </>
    );
};


export default ResizeHandle;
