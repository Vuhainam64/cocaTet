import { Modal, Form, Input, App } from 'antd';

export default function ImportModal({ visible, onClose, onImport, collectionId }) {
    const { message } = App.useApp();
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const lines = values.tokens
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            if (lines.length === 0) {
                message.warning('Vui lòng nhập ít nhất một token');
                return;
            }

            const accounts = lines.map((line, index) => {
                const parts = line.split(/\s+/);
                let token = line;
                let name = `Account ${Date.now()}-${index + 1}`;

                if (parts.length >= 2 && parts[0].toLowerCase() === 'bearer') {
                    token = parts.slice(1).join(' ');
                } else if (parts.length >= 2) {
                    name = parts[0];
                    token = parts.slice(1).join(' ');
                    if (token.toLowerCase().startsWith('bearer ')) {
                        token = token.substring(7);
                    }
                } else {
                    token = line;
                    if (token.toLowerCase().startsWith('bearer ')) {
                        token = token.substring(7);
                    }
                }

                return {
                    name: name,
                    token: token,
                    status: 'active',
                    collection_id: collectionId,
                };
            });

            const result = await window.electronAPI.bulkCreateAccounts(accounts, collectionId);
            if (result.success) {
                message.success(`Đã import ${accounts.length} accounts thành công`);
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
            title="Import Accounts"
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
                    label="Tokens (mỗi token một dòng)"
                    name="tokens"
                    rules={[{ required: true, message: 'Vui lòng nhập tokens' }]}
                >
                    <Input.TextArea
                        rows={10}
                        placeholder="Bearer token1&#10;Bearer token2&#10;Bearer token3..."
                        style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    />
                </Form.Item>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>• Mỗi dòng một account</p>
                    <p>• Format: Tên Token hoặc chỉ Token</p>
                    <p>• Ví dụ: "Account1 Bearer token123" hoặc "Bearer token123"</p>
                    <p>• Nếu không có tên, tên sẽ được tự động tạo</p>
                </div>
            </Form>
        </Modal>
    );
}

