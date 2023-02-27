import React, {useEffect, useRef, useState} from "react";

import PropTypes from "prop-types";

import FourByteClpIrStreamReader from "../../../services/decoder/FourByteClpIrStreamReader";

import "./StatusBarMenu.scss";

// Constants
const MENU_WIDTH = 100;

StatusBarMenu.propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    children: PropTypes.arrayOf(PropTypes.object),
    setVerbosity: PropTypes.func,
};

/**
 * Callback to set the verbosity
 * @callback SetVerbosityCallback
 * @param {number} value Selected verbosity
 * ({@link FourByteClpIrStreamReader.VERBOSITIES})
 */

/**
 * Renders a menu above the component in the status bar.
 * @param {string} className CSS classes for the main element
 * @param {boolean} disabled Whether the element is disabled
 * @param {object} children Children contained within these components
 * @param {SetVerbosityCallback} setVerbosity Callback to set the verbosity
 * @return {JSX.Element}
 */
export function StatusBarMenu ({className, disabled, children, setVerbosity}) {
    const [showMenu, setShowMenu] = useState(false);
    const [bottom, setBottom] = useState(null);
    const [left, setLeft] = useState(null);

    const containerEl = useRef();

    // Calculate the position of the menu on window resize
    useEffect(() => {
        let resizeTimeoutId;
        const onResize = () => {
            clearTimeout(resizeTimeoutId);
            resizeTimeoutId = setTimeout(setPositionOfMenu, 100);
            setShowMenu(false);
        };
        window.addEventListener("resize", onResize);
        setPositionOfMenu();
        return () => {
            window.removeEventListener("resize", onResize, false);
        };
    }, []);

    // Setup dismissal of menu on click outside if menu is showing
    useEffect(() => {
        if (showMenu) {
            const handleClickOutside = (event) => {
                if (containerEl.current && false === containerEl.current.contains(event.target)) {
                    setShowMenu(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [showMenu]);

    // Set the position of the menu above the child component
    const setPositionOfMenu = () => {
        const position = containerEl.current.getBoundingClientRect();
        const left = (position.left + (position.right - position.left) / 2) - (MENU_WIDTH / 2);
        setBottom(position.height);
        setLeft(left);
    };

    const toggleMenu = () => {
        setPositionOfMenu();
        setShowMenu(!showMenu);
    };

    return (
        <button
            className={className}
            disabled={disabled}
            ref={containerEl}
            onClick={toggleMenu}
        >
            {showMenu &&
                <div
                    className="verbosity-menu-container"
                    style={{
                        left: `${left}px`,
                        bottom: `${bottom}px`,
                        width: `${MENU_WIDTH}px`,
                    }}
                >
                    <option
                        className="px-2"
                        key={FourByteClpIrStreamReader.VERBOSITIES.length}
                        value="-1"
                        onClick={() => setVerbosity(-1)}
                    >ALL</option>
                    {FourByteClpIrStreamReader.VERBOSITIES.map((value, index) =>
                        <option
                            className="px-2"
                            key={index}
                            onClick={() => setVerbosity(index)}
                        >{value.label}</option>
                    )}
                </div>
            }
            {children}
        </button>
    );
}
