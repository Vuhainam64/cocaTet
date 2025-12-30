import { Form, Input, Select } from 'antd';

export default function AccountForm({ form }) {
    return (
        <Form form={form} layout="vertical">
            <Form.Item
                label="Tên account"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên account' }]}
            >
                <Input placeholder="Nhập tên account" />
            </Form.Item>
            <Form.Item
                label="Token"
                name="token"
                rules={[{ required: true, message: 'Vui lòng nhập token' }]}
            >
                <Input.TextArea
                    rows={4}
                    placeholder="Nhập token (Bearer...)"
                />
            </Form.Item>
            <Form.Item
                label="Status"
                name="status"
                initialValue="active"
            >
                <Select>
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="inactive">Inactive</Select.Option>
                </Select>
            </Form.Item>
        </Form>
    );
}

