import Layout from "./components/Layout";
import StateContextProvider from "./contexts/StateContextProvider";
import UrlContextProvider, {
    copyToClipboard,
    updateWindowHashParams
} from "./contexts/UrlContextProvider";


/**
 * Renders the main application.
 *
 * @return
 */
const App = () => {
    return (
        <>
            <UrlContextProvider>
                <StateContextProvider>
                    <Layout/>
                    <button
                        onClick={() => {
                            updateWindowHashParams({logEventNum: 3});
                        }}
                    >
                        Set logEventNum to 3
                    </button>
                </StateContextProvider>
            </UrlContextProvider>
        </>
    );
};

export default App;
