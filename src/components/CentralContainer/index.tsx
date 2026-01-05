import DropFileContainer from "../DropFileContainer";
import EditorLoader from "../Editor/EditorLoader";
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
            <DropFileContainer>
                <EditorLoader/>
            </DropFileContainer>
        </div>
    );
};

export default CentralContainer;
