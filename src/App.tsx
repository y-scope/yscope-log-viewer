import Layout from "./components/Layout";
import AppController from "./contexts/AppController";
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
