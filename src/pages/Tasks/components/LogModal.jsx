import { Modal, Input, Spin } from 'antd';
import { useState, useEffect } from 'react';

export default function LogModal({ visible, onClose }) {
    const [logs, setLogs] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            loadLogs();
        }
    }, [visible]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const result = await window.electronAPI.getExchangeGiftLogs();
            if (result.success) {
                setLogs(result.data || '');
            }
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Logs"
            open={visible}
            onCancel={onClose}
            onOk={onClose}
            width={800}
            okText="Đóng"
            cancelButtonProps={{ style: { display: 'none' } }}
        >
            <Spin spinning={loading}>
                <Input.TextArea
                    value={logs}
                    readOnly
                    rows={20}
                    style={{ fontFamily: 'monospace', fontSize: '12px' }}
                />
            </Spin>
        </Modal>
    );
}

