import React from "react";

import "./index.css";


/**
 * Renders the YScope logo.
 *
 * @param props
 * @param props.className Additional class names.
 * @param props.rest
 * @return
 */
const YScopeLogo = ({
    className,
    ...rest
}: React.HTMLProps<HTMLDivElement>) => {
    return (
        <div
            {...rest}
            className={`yscope-logo ${className}`}
        >
            YScope
        </div>
    );
};

export default YScopeLogo;
