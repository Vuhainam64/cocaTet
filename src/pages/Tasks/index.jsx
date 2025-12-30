import { Tabs } from 'antd';
import { Typography } from 'antd';
import ExchangeGift from './components/ExchangeGift';

const { Title } = Typography;

export default function Tasks() {
    const items = [
        {
            key: 'exchange',
            label: 'Đổi quà',
            children: <ExchangeGift />,
        },
        {
            key: 'test',
            label: 'Test Task',
            children: (
                <div className="p-6">
                    <Title level={3}>Test Task</Title>
                    <p className="text-gray-600 dark:text-gray-400">Nội dung tab Test Task sẽ được thêm vào đây</p>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6">
            <Title level={2} className="mb-4">Quản lý tác vụ</Title>
            <Tabs
                defaultActiveKey="exchange"
                items={items}
                type="line"
                size="large"
            />
        </div>
    );
}

