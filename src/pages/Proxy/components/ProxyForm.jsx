import { Form, Input, InputNumber, Select } from 'antd';

export default function ProxyForm({ form }) {
    return (
        <Form form={form} layout="vertical">
            <Form.Item
                label="Host"
                name="host"
                rules={[{ required: true, message: 'Vui lòng nhập host' }]}
            >
                <Input placeholder="Nhập host" />
            </Form.Item>
            <Form.Item
                label="Port"
                name="port"
                rules={[{ required: true, message: 'Vui lòng nhập port' }]}
            >
                <InputNumber
                    placeholder="Nhập port"
                    min={1}
                    max={65535}
                    style={{ width: '100%' }}
                />
            </Form.Item>
            <Form.Item
                label="Username"
                name="username"
            >
                <Input placeholder="Nhập username (tùy chọn)" />
            </Form.Item>
            <Form.Item
                label="Password"
                name="password"
            >
                <Input.Password placeholder="Nhập password (tùy chọn)" />
            </Form.Item>
            <Form.Item
                label="Type"
                name="type"
                initialValue="http"
            >
                <Select>
                    <Select.Option value="http">HTTP</Select.Option>
                    <Select.Option value="https">HTTPS</Select.Option>
                    <Select.Option value="socks5">SOCKS5</Select.Option>
                </Select>
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

