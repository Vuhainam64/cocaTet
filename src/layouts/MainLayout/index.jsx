import { useState, useEffect } from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';

const { Content } = Layout;

export default function MainLayout({
    children,
    darkMode,
    setDarkMode,
    currentPage,
    setCurrentPage,
    mlxAuthenticated,
    mlxLauncherRunning
}) {
    // Load collapsed state from localStorage or default to false
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    // Save collapsed state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
    }, [collapsed]);

    return (
        <Layout className="min-h-screen">
            <Sidebar 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage}
                collapsed={collapsed}
                onCollapse={setCollapsed}
            />
            <Layout className="flex flex-col" style={{ marginLeft: collapsed ? 80 : 200 }}>
                <Header
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    mlxAuthenticated={mlxAuthenticated}
                    mlxLauncherRunning={mlxLauncherRunning}
                    sidebarCollapsed={collapsed}
                    onSidebarToggle={() => setCollapsed(!collapsed)}
                />
                <Content className="flex-1 overflow-auto" style={{ marginTop: 80, padding: '12px 16px' }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}