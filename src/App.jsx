import { useState, useEffect } from 'react';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import MainLayout from './layouts/MainLayout';
import { getRouteByKey } from './routes';

export default function App() {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : true;
    });
    const [currentPage, setCurrentPage] = useState('account');

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    const appTheme = {
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            colorPrimary: '#0ea5e9',
            borderRadius: 8,
            fontFamily: 'Inter, system-ui, sans-serif',
        },
    };

    const renderPage = () => {
        const route = getRouteByKey(currentPage);
        if (!route || !route.component) {
            return <div className="p-8 text-center text-gray-500">No page available</div>;
        }
        const PageComponent = route.component;
        return <PageComponent />;
    };

    return (
        <ConfigProvider theme={appTheme}>
            <AntApp>
                <MainLayout
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                >
                    {renderPage()}
                </MainLayout>
            </AntApp>
        </ConfigProvider>
    );
}
