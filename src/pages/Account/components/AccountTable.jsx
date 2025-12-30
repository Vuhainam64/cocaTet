import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import { MdEdit, MdDelete } from 'react-icons/md';
import dayjs from 'dayjs';

export default function AccountTable({ accounts, loading, onEdit, onDelete }) {
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
        },
        {
            title: 'Token',
            dataIndex: 'token',
            key: 'token',
            ellipsis: true,
            render: (text) => (
                <span className="font-mono text-xs">
                    {text ? (text.length > 50 ? `${text.substring(0, 50)}...` : text) : '-'}
                </span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status || 'active'}
                </Tag>
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 160,
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
        },
        {
            title: 'Chức năng',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<MdEdit size={16} />}
                        size="small"
                        onClick={() => onEdit(record)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    />
                    <Popconfirm
                        title="Xóa account?"
                        description="Bạn có chắc chắn muốn xóa account này?"
                        onConfirm={() => onDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="text"
                            icon={<MdDelete size={16} />}
                            size="small"
                            danger
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={accounts}
            loading={loading}
            rowKey="id"
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} accounts`,
            }}
            className="account-table"
        />
    );
}

