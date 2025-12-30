import { Modal, Form, Input, App } from 'antd';

export default function ImportModal({ visible, onClose, onImport, collectionId }) {
    const { message } = App.useApp();
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const lines = values.codes
                .split('\n')
                .map(line => line.trim().toUpperCase())
                .filter(line => line.length > 0);

            if (lines.length === 0) {
                message.warning('Vui lòng nhập ít nhất một code');
                return;
            }

            const codes = lines.map((code) => ({
                code: code,
                status: 'active',
                collection_id: collectionId,
            }));

            const result = await window.electronAPI.bulkCreateCodes(codes, collectionId);
            if (result.success) {
                message.success(`Đã import ${codes.length} codes thành công`);
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
            title="Import Codes"
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
                    label="Codes (mỗi code một dòng)"
                    name="codes"
                    rules={[{ required: true, message: 'Vui lòng nhập codes' }]}
                >
                    <Input.TextArea
                        rows={10}
                        placeholder="R2PRS2UN9U9&#10;N2UR24392R9&#10;Y2KRRASKVPA&#10;Y2NRR9AA3P2"
                        style={{ fontFamily: 'monospace', fontSize: '12px', textTransform: 'uppercase' }}
                        onInput={(e) => {
                            e.target.value = e.target.value.toUpperCase();
                        }}
                    />
                </Form.Item>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>• Mỗi code trên một dòng</p>
                    <p>• Code sẽ tự động chuyển thành chữ hoa khi lưu</p>
                    <p>• Ví dụ: R2PRS2UN9U9, N2UR24392R9</p>
                </div>
            </Form>
        </Modal>
    );
}

