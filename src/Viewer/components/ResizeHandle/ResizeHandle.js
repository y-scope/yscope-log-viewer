import React, {useEffect, useState} from "react";

import PropTypes from "prop-types";

import "./ResizeHandle.scss";

ResizeHandle.propTypes = {
    resizeCallback: PropTypes.func,
};

/**
 * Callback used to change the parent component's state
 * @callback ResizeCallback
 * @param {number} sizeDelta The change in size
 */


/**
 * A vertical handle for resizing an object.
 * @param {ResizeCallback} resizeCallback The method to call when a resize
 * occurs.
 * @return {JSX.Element}
 */
export function ResizeHandle ({resizeCallback}) {
    const [mouseDown, setMouseDown] = useState(false);

    useEffect(() => {
        if (false === mouseDown) {
            return;
        }

        window.addEventListener("mouseup", handleMouseUp);

        const handleMouseMove = (e) => {
            e.preventDefault();
            resizeCallback(e.movementX / window.devicePixelRatio);
        };
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [mouseDown, resizeCallback]);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setMouseDown(true);
    };

    const handleMouseUp = (e) => {
        e.preventDefault();
        setMouseDown(false);
    };

    return (
        <>
            <div
                className={"resize-handle" + (mouseDown ? " resize-handle-selected" : "")}
                onMouseDown={handleMouseDown}
            ></div>
        </>
    );
}
