import DropFileContainer from "../DropFileContainer";
import Editor from "../Editor";
import Sidebar from "./Sidebar";

import "./index.css";


/**
 * Locates in the center of the <Layout/> and wraps the <DropFileContainer/>-contained <Editor/>
 * with a sidebar component on its left.
 *
 * @return
 */
const CentralContainer = () => {
    return (
        <div className={"central-container"}>
            <Sidebar/>
            <div className={"central-container-children"}>
                <DropFileContainer>
                    <Editor/>
                </DropFileContainer>
            </div>
        </div>
    );
};

export default CentralContainer;
