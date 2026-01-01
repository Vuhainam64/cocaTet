import { Modal, Table, Image, Tag, Typography, Spin, Empty } from 'antd';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function GiftModal({ visible, onClose, title, data, loading, type, onPageChange, currentPage, currentLimit, total }) {
    const [page, setPage] = useState(currentPage || 0);
    const [limit, setLimit] = useState(currentLimit || 10);

    useEffect(() => {
        if (visible) {
            setPage(currentPage || 0);
            setLimit(currentLimit || 10);
        }
    }, [visible, currentPage, currentLimit]);
    const getColumns = () => {
        if (type === 'myGifts') {
            return [
                {
                    title: 'Hình ảnh',
                    dataIndex: ['gift', 'thumbnail'],
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
                    title: 'Tên giải',
                    dataIndex: ['gift', 'name'],
                    key: 'giftName',
                    width: 200,
                },
                {
                    title: 'Code',
                    dataIndex: ['extraData', 'code'],
                    key: 'code',
                    width: 150,
                    render: (code) => (
                        <span className="font-mono font-semibold">{code || '-'}</span>
                    ),
                },
                {
                    title: 'Link đổi quà',
                    dataIndex: 'redemptLink',
                    key: 'redemptLink',
                    width: 200,
                    render: (link) => {
                        if (!link) return '-';
                        return (
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {link.length > 30 ? `${link.substring(0, 30)}...` : link}
                            </a>
                        );
                    },
                },
                {
                    title: 'Used',
                    dataIndex: 'isUsed',
                    key: 'isUsed',
                    width: 100,
                    render: (isUsed, record) => {
                        if (record.voucherError) {
                            return <Tag color="default">Error</Tag>;
                        }
                        if (isUsed === undefined || isUsed === null) {
                            return <Tag color="default">-</Tag>;
                        }
                        return (
                            <Tag color={isUsed ? 'red' : 'green'}>
                                {isUsed ? 'Đã dùng' : 'Chưa dùng'}
                            </Tag>
                        );
                    },
                },
                {
                    title: 'Thời gian',
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    width: 180,
                    render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
                },
            ];
        } else if (type === 'luckyDraws') {
            return [
                {
                    title: 'Avatar',
                    dataIndex: 'userAvatar',
                    key: 'userAvatar',
                    width: 80,
                    render: (avatar) => (
                        <Image
                            src={avatar || 'https://s120-ava-talk.zadn.vn/default'}
                            alt="Avatar"
                            width={50}
                            height={50}
                            style={{ objectFit: 'cover', borderRadius: '50%' }}
                        />
                    ),
                },
                {
                    title: 'Tên người dùng',
                    dataIndex: 'userName',
                    key: 'userName',
                    width: 200,
                },
                {
                    title: 'Tên giải',
                    dataIndex: 'giftName',
                    key: 'giftName',
                    width: 200,
                },
                {
                    title: 'Thời gian',
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    width: 180,
                    render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
                },
            ];
        } else if (type === 'listGifts') {
            return [
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
                    title: 'Tên giải',
                    dataIndex: 'name',
                    key: 'name',
                    width: 200,
                },
                {
                    title: 'Đã phân phối',
                    dataIndex: 'assignedQuantity',
                    key: 'assignedQuantity',
                    width: 120,
                    render: (qty) => <Text strong>{qty?.toLocaleString() || 0}</Text>,
                },
                {
                    title: 'Tổng số lượng',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    width: 120,
                    render: (qty) => <Text>{qty?.toLocaleString() || 0}</Text>,
                },
                {
                    title: 'Còn lại',
                    dataIndex: 'remainQuantity',
                    key: 'remainQuantity',
                    width: 120,
                    render: (qty) => (
                        <Tag color={qty > 0 ? 'green' : 'red'}>
                            {qty?.toLocaleString() || 0}
                        </Tag>
                    ),
                },
            ];
        }
        return [];
    };

    const records = data?.record || [];
    const totalRecords = total || data?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    const handleTableChange = (newPage, newPageSize) => {
        const newLimit = newPageSize || limit;
        const newPageIndex = (newPage || 1) - 1; // Antd Table dùng 1-based, API dùng 0-based
        
        setPage(newPageIndex);
        setLimit(newLimit);
        
        if (onPageChange) {
            onPageChange(newPageIndex, newLimit);
        }
    };

    return (
        <Modal
            title={title}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={900}
            destroyOnClose
        >
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Spin size="large" />
                </div>
            ) : records.length === 0 ? (
                <Empty description="Không có dữ liệu" />
            ) : (
                <div>
                    {totalRecords > 0 && (
                        <div className="mb-4">
                            <Text strong>
                                Tổng số: {totalRecords.toLocaleString()} | 
                                Trang {page + 1}/{totalPages > 0 ? totalPages : 1}
                            </Text>
                        </div>
                    )}
                    <Table
                        columns={getColumns()}
                        dataSource={records}
                        rowKey="_id"
                        pagination={{
                            current: page + 1, // Antd dùng 1-based
                            pageSize: limit,
                            total: totalRecords,
                            showSizeChanger: type === 'luckyDraws' || type === 'myGifts', // Hiển thị cho luckyDraws và myGifts
                            pageSizeOptions: ['10', '20', '50'],
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
                            onChange: handleTableChange,
                            onShowSizeChange: handleTableChange,
                        }}
                        scroll={{ y: 400 }}
                        size="small"
                    />
                </div>
            )}
        </Modal>
    );
}

