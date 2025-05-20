import AppController from "./components/AppController";
import Layout from "./components/Layout";
import NotificationContextProvider from "./contexts/NotificationContextProvider";
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
                <AppController>
                    <Layout/>
                </AppController>
            </UrlContextProvider>
        </NotificationContextProvider>
    );
};

export default App;
