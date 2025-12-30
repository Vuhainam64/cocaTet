import { Table, Tag } from 'antd';

export default function ProgressTable({ progress }) {
    const columns = [
        {
            title: 'Tên Account',
            dataIndex: 'accountName',
            key: 'accountName',
            width: 200,
        },
        {
            title: 'Proxy đang dùng',
            dataIndex: 'proxy',
            key: 'proxy',
            width: 250,
            render: (text) => (
                <span className="font-mono text-xs">
                    {text || '-'}
                </span>
            ),
        },
        {
            title: 'Code đang dùng',
            dataIndex: 'code',
            key: 'code',
            width: 150,
            render: (text) => (
                <span className="font-mono font-semibold">
                    {text || '-'}
                </span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status) => {
                const colorMap = {
                    'running': 'blue',
                    'success': 'green',
                    'error': 'red',
                    'waiting': 'default',
                    'stopped': 'orange',
                };
                const textMap = {
                    'running': 'Đang chạy',
                    'success': 'Thành công',
                    'error': 'Lỗi',
                    'waiting': 'Chờ',
                    'stopped': 'Đã dừng',
                };
                return (
                    <Tag color={colorMap[status] || 'default'}>
                        {textMap[status] || status}
                    </Tag>
                );
            },
        },
        {
            title: 'Prize',
            dataIndex: 'prize',
            key: 'prize',
            width: 200,
            render: (prize) => (
                <span className={prize && prize !== 'No Prize' ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                    {prize || 'No Prize'}
                </span>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={progress}
            rowKey="accountId"
            pagination={false}
            size="small"
        />
    );
}

