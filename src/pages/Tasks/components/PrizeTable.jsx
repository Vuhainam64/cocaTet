import { Table, Image } from 'antd';

export default function PrizeTable({ prizes }) {
    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'thumbnail',
            key: 'thumbnail',
            width: 100,
            render: (thumbnail) => {
                if (!thumbnail) return '-';
                return (
                    <Image
                        src={thumbnail}
                        alt="Giải thưởng"
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                        fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect fill='%23f0f0f0' width='60' height='60'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E"
                    />
                );
            },
        },
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

