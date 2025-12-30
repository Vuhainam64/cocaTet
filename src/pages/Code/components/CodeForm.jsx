import { Form, Input, Select } from 'antd';

export default function CodeForm({ form }) {
    return (
        <Form form={form} layout="vertical">
            <Form.Item
                label="Code"
                name="code"
                rules={[{ required: true, message: 'Vui lòng nhập code' }]}
            >
                <Input 
                    placeholder="Nhập code" 
                    style={{ textTransform: 'uppercase' }}
                    onChange={(e) => {
                        e.target.value = e.target.value.toUpperCase();
                        form.setFieldsValue({ code: e.target.value.toUpperCase() });
                    }}
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

