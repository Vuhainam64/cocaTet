import { Layout, Menu } from 'antd';
import {
    MdPeople,
    MdVpnKey,
    MdCode,
    MdAssignment,
} from 'react-icons/md';
import Logo from '../../components/Logo';

const { Sider } = Layout;

const menuItems = [
    {
        key: 'account',
        icon: <MdPeople size={20} />,
        label: 'Accounts',
    },
    {
        key: 'proxy',
        icon: <MdVpnKey size={20} />,
        label: 'Proxies',
    },
    {
        key: 'code',
        icon: <MdCode size={20} />,
        label: 'Codes',
    },
    {
        key: 'tasks',
        icon: <MdAssignment size={20} />,
        label: 'Tasks',
    },
];

export default function Sidebar({ currentPage, setCurrentPage, collapsed, onCollapse }) {
    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={onCollapse}
            breakpoint="lg"
            collapsedWidth={collapsed ? 80 : 200}
            width={200}
            className="overflow-auto h-screen fixed left-0 top-0 bottom-0 transition-all duration-300 z-40"
            trigger={null} // Hide default trigger, we'll add custom button in Header
        >
            <div className={`h-16 m-4 flex items-center justify-center transition-all duration-300 ${collapsed ? 'px-2' : ''}`}>
                <Logo 
                    size={collapsed ? "small" : "default"} 
                    showText={!collapsed} 
                    className="text-white" 
                />
            </div>
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[currentPage]}
                items={menuItems}
                onClick={({ key }) => setCurrentPage(key)}
                inlineCollapsed={collapsed}
            />
        </Sider>
    );
}