import { useState, useEffect } from 'react';
import { Layout, Typography, Button, Space, Modal, Form, Input, Popconfirm, App } from 'antd';
import { MdAdd, MdFolder, MdEdit, MdDelete, MdFileUpload, MdCheckCircle } from 'react-icons/md';
import dayjs from 'dayjs';
import ProxyTable from './components/ProxyTable';
import ProxyForm from './components/ProxyForm';
import ImportModal from './components/ImportModal';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function Proxy() {
    const { message } = App.useApp();
    const [proxyCollections, setProxyCollections] = useState([]);
    const [selectedCollectionId, setSelectedCollectionId] = useState(null);
    const [collectionModalVisible, setCollectionModalVisible] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);
    const [collectionForm] = Form.useForm();
    const [collectionSearchTerm, setCollectionSearchTerm] = useState('');
    
    const [proxies, setProxies] = useState([]);
    const [proxiesLoading, setProxiesLoading] = useState(false);
    const [proxyModalVisible, setProxyModalVisible] = useState(false);
    const [editingProxy, setEditingProxy] = useState(null);
    const [proxyForm] = Form.useForm();
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [checkingProxies, setCheckingProxies] = useState(false);
    const [checkProgress, setCheckProgress] = useState({ current: 0, total: 0 });

    useEffect(() => {
        loadProxyCollections();
    }, []);

    useEffect(() => {
        if (selectedCollectionId) {
            loadProxies(selectedCollectionId);
        } else {
            setProxies([]);
        }
    }, [selectedCollectionId]);

    const loadProxyCollections = async () => {
        try {
            const result = await window.electronAPI.getProxyCollections();
            if (result.success) {
                const data = result.data || [];
                setProxyCollections(data);
                
                if (!selectedCollectionId && data.length > 0) {
                    const newestCollection = data[0];
                    setSelectedCollectionId(newestCollection.id);
                }
            }
        } catch (error) {
            console.error('Error loading proxy collections:', error);
        }
    };

    const handleCreateCollection = () => {
        setEditingCollection(null);
        collectionForm.resetFields();
        setCollectionModalVisible(true);
    };

    const handleEditCollection = (collection) => {
        setEditingCollection(collection);
        collectionForm.setFieldsValue({
            name: collection.name,
            note: collection.note,
        });
        setCollectionModalVisible(true);
    };

    const handleDeleteCollection = async (id) => {
        try {
            const result = await window.electronAPI.deleteProxyCollection(id);
            if (result.success) {
                if (selectedCollectionId === id) {
                    setSelectedCollectionId(null);
                }
                loadProxyCollections();
            }
        } catch (error) {
            console.error('Error deleting collection:', error);
        }
    };

    const handleSubmitCollection = async () => {
        try {
            const values = await collectionForm.validateFields();
            const result = editingCollection
                ? await window.electronAPI.updateProxyCollection(editingCollection.id, values)
                : await window.electronAPI.createProxyCollection(values);

            if (result.success) {
                setCollectionModalVisible(false);
                if (!editingCollection) {
                    setSelectedCollectionId(result.data.id);
                }
                loadProxyCollections();
            }
        } catch (error) {
            console.error('Collection form validation error:', error);
        }
    };

    const loadProxies = async (collectionId) => {
        setProxiesLoading(true);
        try {
            const result = await window.electronAPI.getProxies(collectionId);
            if (result.success) {
                setProxies(result.data || []);
            } else {
                message.error('Lỗi khi tải proxies: ' + result.error);
            }
        } catch (error) {
            message.error('Lỗi khi tải proxies: ' + error.message);
        } finally {
            setProxiesLoading(false);
        }
    };

    const handleCheckAllProxies = async () => {
        if (!selectedCollectionId) {
            message.warning('Vui lòng chọn collection');
            return;
        }

        setCheckingProxies(true);
        setCheckProgress({ current: 0, total: proxies.length });

        try {
            const result = await window.electronAPI.checkAllProxiesStatus(selectedCollectionId);
            if (result.success) {
                const { total, successCount, failCount } = result.data;
                message.success(
                    `Check hoàn tất! Tổng: ${total}, Sống: ${successCount}, Chết: ${failCount}`
                );
                // Reload proxies để cập nhật status
                loadProxies(selectedCollectionId);
                loadProxyCollections();
            } else {
                message.error('Lỗi khi check proxies: ' + result.error);
            }
        } catch (error) {
            message.error('Lỗi khi check proxies: ' + error.message);
        } finally {
            setCheckingProxies(false);
            setCheckProgress({ current: 0, total: 0 });
        }
    };

    const handleCreateProxy = () => {
        setEditingProxy(null);
        proxyForm.resetFields();
        proxyForm.setFieldsValue({ type: 'socks5', status: 'active' });
        setProxyModalVisible(true);
    };

    const handleEditProxy = (proxy) => {
        setEditingProxy(proxy);
        proxyForm.setFieldsValue({
            host: proxy.host,
            port: proxy.port,
            username: proxy.username || '',
            password: proxy.password || '',
            type: proxy.type || 'socks5',
            status: proxy.status || 'active',
        });
        setProxyModalVisible(true);
    };

    const handleDeleteProxy = async (id) => {
        try {
            const result = await window.electronAPI.deleteProxy(id);
            if (result.success) {
                message.success('Đã xóa proxy thành công');
                loadProxies(selectedCollectionId);
                loadProxyCollections();
            } else {
                message.error('Lỗi khi xóa proxy: ' + result.error);
            }
        } catch (error) {
            message.error('Lỗi khi xóa proxy: ' + error.message);
        }
    };

    const handleSubmitProxy = async () => {
        try {
            const values = await proxyForm.validateFields();
            const payload = {
                ...values,
                collection_id: selectedCollectionId,
            };
            const result = editingProxy
                ? await window.electronAPI.updateProxy(editingProxy.id, payload)
                : await window.electronAPI.createProxy(payload);

            if (result.success) {
                message.success(`Proxy ${editingProxy ? 'đã cập nhật' : 'đã tạo'} thành công`);
                setProxyModalVisible(false);
                loadProxies(selectedCollectionId);
                loadProxyCollections();
            } else {
                message.error(`Lỗi khi ${editingProxy ? 'cập nhật' : 'tạo'} proxy: ` + result.error);
            }
        } catch (error) {
            console.error('Proxy form validation error:', error);
        }
    };

    const selectedCollection = proxyCollections.find(c => c.id === selectedCollectionId);

    return (
        <Layout className="proxy-layout" style={{ minHeight: 'calc(100vh - 160px)', background: 'transparent', margin: 0, padding: 0 }}>
            <Sider 
                width={320} 
                style={{ 
                    background: 'var(--sider-bg, #ffffff)',
                    borderRight: '1px solid var(--sider-border, #e5e7eb)',
                    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.06)',
                    padding: '16px',
                    marginRight: '16px',
                    borderRadius: '8px',
                    minHeight: 'calc(100vh - 180px)'
                }}
                className="proxy-sider"
            >
                <style>{`
                    .proxy-sider {
                        background: #ffffff !important;
                        border-right: 1px solid #e5e7eb !important;
                    }
                    .dark .proxy-sider {
                        background: #1e293b !important;
                        border-right: 1px solid #334155 !important;
                    }
                `}</style>
                <div className="space-y-4 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <Title 
                            level={4} 
                            className="dark:text-white text-gray-900 font-semibold" 
                            style={{ margin: 0, fontSize: '18px' }}
                        >
                            Proxy Collections
                        </Title>
                        <Button 
                            type="primary" 
                            icon={<MdAdd />} 
                            size="small"
                            onClick={handleCreateCollection}
                            style={{ borderRadius: '6px' }}
                        >
                            New
                        </Button>
                    </div>

                    <Input
                        placeholder="Tìm kiếm collection..."
                        value={collectionSearchTerm}
                        onChange={(e) => setCollectionSearchTerm(e.target.value)}
                        allowClear
                        style={{ borderRadius: '6px' }}
                        className="dark:bg-slate-700 dark:border-gray-600 dark:text-white bg-gray-50 border-gray-200"
                    />
                    
                    <div 
                        className="space-y-2 flex-1 overflow-y-auto pr-1"
                        style={{ 
                            maxHeight: 'calc(100vh - 300px)',
                            scrollbarWidth: 'thin',
                        }}
                    >
                        {proxyCollections.length === 0 ? (
                            <div className="text-center py-8">
                                <MdFolder size={48} className="mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                                    Chưa có collection nào
                                </Text>
                            </div>
                        ) : (
                            proxyCollections
                                .filter(collection => 
                                    !collectionSearchTerm || 
                                    collection.name.toLowerCase().includes(collectionSearchTerm.toLowerCase()) ||
                                    (collection.note && collection.note.toLowerCase().includes(collectionSearchTerm.toLowerCase()))
                                )
                                .map((collection) => (
                                <div
                                    key={collection.id}
                                    onClick={() => setSelectedCollectionId(collection.id)}
                                    className={`
                                        transition-all duration-200 cursor-pointer
                                        ${selectedCollectionId === collection.id 
                                            ? 'bg-blue-500 dark:bg-blue-600 border-blue-400 shadow-md' 
                                            : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-slate-600'
                                        }
                                    `}
                                    style={{
                                        padding: '14px',
                                        borderRadius: '8px',
                                        border: '1px solid',
                                        transform: selectedCollectionId === collection.id ? 'translateX(2px)' : 'none',
                                    }}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MdFolder 
                                                    size={18}
                                                    className={selectedCollectionId === collection.id 
                                                        ? 'text-white' 
                                                        : 'text-blue-600 dark:text-gray-400'
                                                    } 
                                                />
                                                <Text 
                                                    strong 
                                                    className={selectedCollectionId === collection.id 
                                                        ? 'text-white' 
                                                        : 'text-gray-800 dark:text-gray-200'
                                                    }
                                                    style={{ fontSize: '14px', fontWeight: 600 }}
                                                    ellipsis
                                                >
                                                    {collection.name}
                                                </Text>
                                            </div>
                                            {collection.note && (
                                                <Text 
                                                    className={selectedCollectionId === collection.id 
                                                        ? 'text-blue-50' 
                                                        : 'text-gray-600 dark:text-gray-400'
                                                    } 
                                                    style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}
                                                    ellipsis
                                                >
                                                    {collection.note}
                                                </Text>
                                            )}
                                            <div className="flex items-center gap-3 mt-2">
                                                <Text 
                                                    className={selectedCollectionId === collection.id 
                                                        ? 'text-blue-100' 
                                                        : 'text-gray-600 dark:text-gray-500'
                                                    } 
                                                    style={{ fontSize: '11px', fontWeight: 500 }}
                                                >
                                                    {collection.proxy_count || 0} proxies
                                                </Text>
                                                <Text 
                                                    className={selectedCollectionId === collection.id 
                                                        ? 'text-blue-100' 
                                                        : 'text-gray-500 dark:text-gray-500'
                                                    } 
                                                    style={{ fontSize: '11px' }}
                                                >
                                                    {dayjs(collection.created_at).format('DD/MM/YYYY')}
                                                </Text>
                                            </div>
                                        </div>
                                        <Space size="small" className="shrink-0">
                                            <Button
                                                type="text"
                                                icon={<MdEdit size={16} />}
                                                size="small"
                                                className={selectedCollectionId === collection.id 
                                                    ? 'text-white hover:bg-blue-600' 
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-slate-600'
                                                }
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditCollection(collection);
                                                }}
                                            />
                                            <Popconfirm
                                                title="Xóa collection?"
                                                description="Proxies trong collection này sẽ không bị xóa, nhưng sẽ được chuyển sang 'No Collection'."
                                                onConfirm={(e) => {
                                                    e?.stopPropagation();
                                                    handleDeleteCollection(collection.id);
                                                }}
                                                onCancel={(e) => e?.stopPropagation()}
                                                okText="Xóa"
                                                cancelText="Hủy"
                                                okButtonProps={{ danger: true }}
                                            >
                                                <Button
                                                    type="text"
                                                    icon={<MdDelete size={16} />}
                                                    size="small"
                                                    danger
                                                    className={selectedCollectionId === collection.id 
                                                        ? 'text-white hover:bg-red-500 hover:text-white' 
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
                                                    }
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </Popconfirm>
                                        </Space>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Sider>

            <Content style={{ background: 'transparent', padding: 0 }}>
                <div className="space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
                        <div style={{ minWidth: '150px', maxWidth: '400px' }}>
                            <Title 
                                level={2} 
                                className="dark:text-white text-gray-900"
                                style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}
                            >
                                {selectedCollection ? selectedCollection.name : 'No Collection Selected'}
                            </Title>
                            {selectedCollection && (
                                <Text 
                                    type="secondary" 
                                    className="dark:text-gray-400"
                                    style={{ fontSize: '14px', marginTop: '4px', display: 'block' }}
                                >
                                    {selectedCollection.proxy_count || 0} proxies
                                </Text>
                            )}
                        </div>
                        {selectedCollectionId && (
                            <Space>
                                <Button 
                                    icon={<MdCheckCircle />} 
                                    onClick={handleCheckAllProxies}
                                    loading={checkingProxies}
                                    disabled={checkingProxies}
                                >
                                    Check All Proxies
                                </Button>
                                {checkingProxies && (
                                    <Text type="secondary">
                                        {checkProgress.current}/{checkProgress.total}
                                    </Text>
                                )}
                                <Popconfirm
                                    title="Xóa tất cả proxies?"
                                    description={`Bạn có chắc chắn muốn xóa tất cả proxies trong collection này? Hành động này không thể hoàn tác.`}
                                    onConfirm={async () => {
                                        try {
                                            const result = await window.electronAPI.deleteAllProxies(selectedCollectionId);
                                            if (result.success) {
                                                message.success('Đã xóa tất cả proxies');
                                                loadProxies(selectedCollectionId);
                                                loadProxyCollections();
                                            } else {
                                                message.error('Lỗi khi xóa: ' + result.error);
                                            }
                                        } catch (error) {
                                            message.error('Lỗi khi xóa proxies');
                                        }
                                    }}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    okButtonProps={{ danger: true }}
                                >
                                    <Button 
                                        danger
                                        icon={<MdDelete />}
                                    >
                                        Xóa tất cả
                                    </Button>
                                </Popconfirm>
                                <Button 
                                    icon={<MdFileUpload />} 
                                    onClick={() => setImportModalVisible(true)}
                                >
                                    Import
                                </Button>
                                <Button 
                                    type="primary" 
                                    icon={<MdAdd />} 
                                    onClick={handleCreateProxy}
                                >
                                    Create
                                </Button>
                            </Space>
                        )}
                    </div>

                    {selectedCollectionId ? (
                        <div 
                            className="p-6 rounded-lg border"
                            style={{
                                background: 'var(--content-bg, #ffffff)',
                                borderColor: 'var(--content-border, #e5e7eb)',
                                minHeight: '400px'
                            }}
                        >
                            <style>{`
                                :root {
                                    --content-bg: #ffffff;
                                    --content-border: #e5e7eb;
                                }
                                .dark {
                                    --content-bg: #1e293b;
                                    --content-border: #334155;
                                }
                            `}</style>
                            <ProxyTable
                                proxies={proxies}
                                loading={proxiesLoading}
                                onEdit={handleEditProxy}
                                onDelete={handleDeleteProxy}
                            />
                        </div>
                    ) : (
                        <div 
                            className="rounded-lg border-2 border-dashed flex flex-col items-center justify-center"
                            style={{
                                padding: '80px 20px',
                                background: 'var(--empty-bg, #f9fafb)',
                                borderColor: 'var(--empty-border, #e5e7eb)',
                                minHeight: '400px'
                            }}
                        >
                            <style>{`
                                :root {
                                    --empty-bg: #f9fafb;
                                    --empty-border: #e5e7eb;
                                }
                                .dark {
                                    --empty-bg: #0f172a;
                                    --empty-border: #334155;
                                }
                            `}</style>
                            <MdFolder size={72} className="mb-4 text-gray-300 dark:text-gray-600" />
                            <Title 
                                level={4} 
                                className="dark:text-gray-300 text-gray-600 mb-2"
                                style={{ fontWeight: 500 }}
                            >
                                Select a collection to view proxies
                            </Title>
                            <Text 
                                className="dark:text-gray-400 text-gray-500 text-center"
                                style={{ maxWidth: '400px' }}
                            >
                                Chọn một collection để xem và quản lý proxies, hoặc tạo collection mới để bắt đầu
                            </Text>
                        </div>
                    )}

                    <Modal
                        title={editingCollection ? 'Edit Proxy Collection' : 'Create Proxy Collection'}
                        open={collectionModalVisible}
                        onOk={handleSubmitCollection}
                        onCancel={() => {
                            setCollectionModalVisible(false);
                            setEditingCollection(null);
                        }}
                        width={500}
                        okText={editingCollection ? 'Cập nhật' : 'Tạo mới'}
                        cancelText="Hủy"
                    >
                        <Form form={collectionForm} layout="vertical">
                            <Form.Item
                                label="Tên collection"
                                name="name"
                                rules={[{ required: true, message: 'Vui lòng nhập tên collection' }]}
                            >
                                <Input placeholder="Nhập tên collection" />
                            </Form.Item>
                            <Form.Item label="Ghi chú" name="note">
                                <Input.TextArea rows={3} placeholder="Ghi chú tùy chọn về collection này" />
                            </Form.Item>
                        </Form>
                    </Modal>

                    <Modal
                        title={editingProxy ? 'Edit Proxy' : 'Create Proxy'}
                        open={proxyModalVisible}
                        onOk={handleSubmitProxy}
                        onCancel={() => {
                            setProxyModalVisible(false);
                            setEditingProxy(null);
                        }}
                        width={600}
                        okText={editingProxy ? 'Cập nhật' : 'Tạo mới'}
                        cancelText="Hủy"
                    >
                        <ProxyForm form={proxyForm} />
                    </Modal>

                    <ImportModal
                        visible={importModalVisible}
                        onClose={() => setImportModalVisible(false)}
                        onImport={() => {
                            loadProxies(selectedCollectionId);
                            loadProxyCollections();
                        }}
                        collectionId={selectedCollectionId}
                    />
                </div>
            </Content>
        </Layout>
    );
}
