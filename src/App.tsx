import Layout from "./components/Layout";
import NotificationContextProvider from "./contexts/NotificationContextProvider";
import ProfilesContextProvider from "./contexts/ProfileContextProvider";
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
                <ProfilesContextProvider>
                    <StateContextProvider>
                        <Layout/>
                    </StateContextProvider>
                </ProfilesContextProvider>
            </UrlContextProvider>
        </NotificationContextProvider>
    );
};

export default App;
