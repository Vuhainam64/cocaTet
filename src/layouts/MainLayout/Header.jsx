import { Layout, Switch, Space, Button } from 'antd';
import { MdLightMode, MdDarkMode, MdMenu, MdMenuOpen } from 'react-icons/md';

const { Header: AntHeader } = Layout;

export default function Header({ darkMode, setDarkMode, sidebarCollapsed, onSidebarToggle }) {
    return (
        <AntHeader 
            className={`px-6 flex items-center justify-between gap-4 fixed top-0 right-0 z-50 ${darkMode ? 'bg-[#001529]' : 'bg-white'} shadow-md`}
            style={{ 
                height: 64,
                transition: 'all 0.2s',
                left: sidebarCollapsed ? 80 : 200
            }}
        >
            <Button
                type="text"
                icon={sidebarCollapsed ? <MdMenu size={20} /> : <MdMenuOpen size={20} />}
                onClick={onSidebarToggle}
                className={`flex items-center justify-center ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900'}`}
                style={{ 
                    width: 40, 
                    height: 40,
                    color: darkMode ? undefined : '#1f2937'
                }}
            />
            
            <div className="flex-1" />

            <Space>
                {darkMode ? <MdDarkMode size={20} /> : <MdLightMode size={20} />}
                <Switch
                    checked={darkMode}
                    onChange={setDarkMode}
                    checkedChildren="Dark"
                    unCheckedChildren="Light"
                />
            </Space>
        </AntHeader>
    );
}
