import Layout from "./components/Layout";
import StateContextProvider from "./contexts/StateContextProvider";


/**
 * Renders the main application.
 *
 * @return
 */
const App = () => {
    return (
        <>
            <StateContextProvider>
                <Layout/>
            </StateContextProvider>
        </>
    );
};

export default App;
