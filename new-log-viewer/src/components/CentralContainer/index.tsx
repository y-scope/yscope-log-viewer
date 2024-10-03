import DropFileContainer from "../DropFileContainer";
import Editor from "../Editor";
import Sidebar from "./Sidebar";

import "./index.css";


/**
 * Located in the center of the <Layout/>.
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
