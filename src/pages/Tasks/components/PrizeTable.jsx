import { Table } from 'antd';

export default function PrizeTable({ prizes }) {
    const columns = [
        {
            title: 'Account',
            dataIndex: 'account',
            key: 'account',
            width: 200,
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            width: 150,
            render: (text) => (
                <span className="font-mono font-semibold">
                    {text}
                </span>
            ),
        },
        {
            title: 'Prize',
            dataIndex: 'prize',
            key: 'prize',
            width: 250,
            render: (text) => (
                <span className="text-green-600 font-semibold">
                    {text}
                </span>
            ),
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
            width: 200,
            render: (time) => {
                if (!time) return '-';
                const date = new Date(time);
                return date.toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                });
            },
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={prizes}
            rowKey={(record, index) => `${record.account}-${record.code}-${index}`}
            pagination={false}
            size="small"
            scroll={{ y: 300 }}
        />
    );
}

