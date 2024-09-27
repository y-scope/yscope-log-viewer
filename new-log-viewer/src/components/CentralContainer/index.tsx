import React from "react";

import Sidebar from "./Sidebar";

import "./index.css";


interface CentralContainerProps {
    children: React.ReactNode,
}

/**
 * Locates in the center of the <Layout/> and wraps a children with a sidebar component on its left.
 *
 * @param props
 * @param props.children
 * @return
 */
const CentralContainer = ({children}: CentralContainerProps) => {
    return (
        <div className={"central-container"}>
            <Sidebar/>
            <div className={"central-container-children-container"}>
                {children}
            </div>
        </div>
    );
};

export default CentralContainer;
