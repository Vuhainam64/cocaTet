import { Modal, Form, Checkbox, Radio, Space, App } from 'antd';
import { useState } from 'react';

export default function ExportModal({ visible, onClose, onExport, totalCodes }) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await onExport(values);
            message.success('Xuất file thành công');
            onClose();
        } catch (error) {
            if (error.errorFields) {
                // Form validation error
                return;
            }
            message.error('Lỗi khi xuất file: ' + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Xuất Codes"
            open={visible}
            onOk={handleExport}
            onCancel={onClose}
            okText="Xuất"
            cancelText="Hủy"
            confirmLoading={loading}
            width={500}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    statuses: ['active', 'used', 'invalid'],
                    deleteAfterExport: false,
                    format: 'txt',
                }}
            >
                <Form.Item
                    label="Chọn status để xuất"
                    name="statuses"
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất một status' }]}
                >
                    <Checkbox.Group>
                        <Space direction="vertical">
                            <Checkbox value="active">Active ({totalCodes?.active ?? 0})</Checkbox>
                            <Checkbox value="used">Used ({totalCodes?.used ?? 0})</Checkbox>
                            <Checkbox value="invalid">Invalid ({totalCodes?.invalid ?? 0})</Checkbox>
                        </Space>
                    </Checkbox.Group>
                </Form.Item>

                <Form.Item
                    label="Format xuất"
                    name="format"
                    rules={[{ required: true }]}
                >
                    <Radio.Group>
                        <Space>
                            <Radio value="txt">TXT</Radio>
                            <Radio value="csv">CSV</Radio>
                        </Space>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    label="Sau khi xuất"
                    name="deleteAfterExport"
                    valuePropName="checked"
                >
                    <Checkbox>
                        Xóa các codes đã xuất
                    </Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    );
}

