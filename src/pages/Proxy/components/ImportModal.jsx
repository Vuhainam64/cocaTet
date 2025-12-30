import { Modal, Form, Input, App } from 'antd';

export default function ImportModal({ visible, onClose, onImport, collectionId }) {
    const { message } = App.useApp();
    const [form] = Form.useForm();

    const parseProxyString = (proxyString) => {
        const parts = proxyString.trim().split(':');
        if (parts.length < 2) {
            throw new Error('Invalid proxy format. Expected: host:port or host:port:user:pass');
        }
        return {
            host: parts[0],
            port: parseInt(parts[1], 10),
            username: parts[2] || null,
            password: parts[3] || null,
            type: 'socks5',
            status: 'active',
        };
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const lines = values.proxies
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            if (lines.length === 0) {
                message.warning('Vui lòng nhập ít nhất một proxy');
                return;
            }

            const proxies = [];
            for (const line of lines) {
                try {
                    const proxy = parseProxyString(line);
                    proxies.push({
                        ...proxy,
                        collection_id: collectionId,
                    });
                } catch (error) {
                    message.warning(`Dòng không hợp lệ: ${line} - ${error.message}`);
                }
            }

            if (proxies.length === 0) {
                message.warning('Không có proxy hợp lệ để import');
                return;
            }

            const result = await window.electronAPI.bulkCreateProxies(proxies, collectionId);
            if (result.success) {
                message.success(`Đã import ${proxies.length} proxies thành công`);
                form.resetFields();
                onClose();
                onImport();
            } else {
                message.error('Lỗi khi import: ' + result.error);
            }
        } catch (error) {
            console.error('Import error:', error);
        }
    };

    return (
        <Modal
            title="Import Proxies"
            open={visible}
            onOk={handleSubmit}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            width={600}
            okText="Import"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Proxies (mỗi proxy một dòng)"
                    name="proxies"
                    rules={[{ required: true, message: 'Vui lòng nhập proxies' }]}
                >
                    <Input.TextArea
                        rows={10}
                        placeholder="14.224.199.205:54400:phFsfI:AijRVn&#10;14.224.199.205:53609:phFsfI:AijRVn&#10;14.224.199.205:54882:phFsfI:AijRVn"
                        style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    />
                </Form.Item>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>• Mỗi proxy trên một dòng</p>
                    <p>• Format: host:port:username:password hoặc host:port</p>
                    <p>• Ví dụ: 14.224.199.205:54400:phFsfI:AijRVn</p>
                </div>
            </Form>
        </Modal>
    );
}

