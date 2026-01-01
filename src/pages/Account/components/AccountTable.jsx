import { Table, Button, Space, Popconfirm, Tag, Tooltip } from 'antd';
import { MdEdit, MdDelete, MdCardGiftcard, MdList, MdInventory } from 'react-icons/md';
import dayjs from 'dayjs';

export default function AccountTable({ accounts, loading, onEdit, onDelete, onViewMyGifts, onViewLuckyDraws, onViewListGifts }) {
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
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem quà của account">
                        <Button
                            type="text"
                            icon={<MdCardGiftcard size={16} />}
                            size="small"
                            onClick={() => onViewMyGifts(record)}
                            className="text-green-600 hover:text-green-700 dark:text-green-400"
                        />
                    </Tooltip>
                    <Tooltip title="Xem danh sách giải">
                        <Button
                            type="text"
                            icon={<MdList size={16} />}
                            size="small"
                            onClick={() => onViewLuckyDraws(record)}
                            className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
                        />
                    </Tooltip>
                    <Tooltip title="Xem quà còn lại">
                        <Button
                            type="text"
                            icon={<MdInventory size={16} />}
                            size="small"
                            onClick={() => onViewListGifts(record)}
                            className="text-orange-600 hover:text-orange-700 dark:text-orange-400"
                        />
                    </Tooltip>
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

