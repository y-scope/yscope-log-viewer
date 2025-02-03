import Layout from "./components/Layout";
import NotificationContextProvider from "./contexts/NotificationContextProvider";
import StateContextProvider from "./contexts/StateContextProvider";
import UrlContextProvider from "./contexts/UrlContextProvider";


/**
 * Renders the main application.
 *
 * @return
 */
const App = () => {
    return (
        <NotificationContextProvider>
            <UrlContextProvider>
                <StateContextProvider>
                    <Layout/>
                </StateContextProvider>
            </UrlContextProvider>
        </NotificationContextProvider>
    );
};

export default App;
