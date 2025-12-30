import { useState, useEffect } from 'react';
import { Form, Select, InputNumber, Button, Space, Card, App } from 'antd';
import { MdPlayArrow, MdStop, MdDescription } from 'react-icons/md';
import ProgressTable from './ProgressTable';
import PrizeTable from './PrizeTable';
import LogModal from './LogModal';

export default function ExchangeGift() {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [accountCollections, setAccountCollections] = useState([]);
    const [proxyCollections, setProxyCollections] = useState([]);
    const [codeCollections, setCodeCollections] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState([]);
    const [prizes, setPrizes] = useState([]);
    const [logModalVisible, setLogModalVisible] = useState(false);

    useEffect(() => {
        loadCollections();
    }, []);

    const loadCollections = async () => {
        try {
            const [accountsRes, proxiesRes, codesRes] = await Promise.all([
                window.electronAPI.getAccountCollections(),
                window.electronAPI.getProxyCollections(),
                window.electronAPI.getCodeCollections(),
            ]);

            if (accountsRes.success) {
                setAccountCollections(accountsRes.data || []);
            }
            if (proxiesRes.success) {
                setProxyCollections(proxiesRes.data || []);
            }
            if (codesRes.success) {
                setCodeCollections(codesRes.data || []);
            }
        } catch (error) {
            console.error('Error loading collections:', error);
        }
    };

    const handleStart = async () => {
        try {
            const values = await form.validateFields();
            setIsRunning(true);
            setProgress([]);

            const result = await window.electronAPI.startExchangeGift({
                accountCollectionId: values.accountCollectionId,
                proxyCollectionId: values.proxyCollectionId,
                codeCollectionId: values.codeCollectionId,
                timeoutMs: values.timeoutMs || 7000,
            });

            if (result.success) {
                message.success('Đã bắt đầu task đổi quà');
            } else {
                message.error('Lỗi khi bắt đầu task: ' + result.error);
                setIsRunning(false);
            }
        } catch (error) {
            console.error('Form validation error:', error);
        }
    };

    const handleStop = async () => {
        try {
            const result = await window.electronAPI.stopExchangeGift();
            if (result.success) {
                setIsRunning(false);
                message.success('Đã dừng task');
            }
        } catch (error) {
            console.error('Error stopping task:', error);
        }
    };

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(async () => {
                try {
                    const [progressRes, prizesRes] = await Promise.all([
                        window.electronAPI.getExchangeGiftProgress(),
                        window.electronAPI.getExchangeGiftPrizes(),
                    ]);
                    if (progressRes.success) {
                        setProgress(progressRes.data || []);
                    }
                    if (prizesRes.success) {
                        setPrizes(prizesRes.data || []);
                    }
                } catch (error) {
                    console.error('Error getting progress:', error);
                }
            }, 1000);
        } else {
            interval = setInterval(async () => {
                try {
                    const [progressRes, prizesRes] = await Promise.all([
                        window.electronAPI.getExchangeGiftProgress(),
                        window.electronAPI.getExchangeGiftPrizes(),
                    ]);
                    if (progressRes.success && progressRes.data && progressRes.data.length > 0) {
                        setProgress(progressRes.data);
                    }
                    if (prizesRes.success) {
                        setPrizes(prizesRes.data || []);
                    }
                } catch (error) {
                    console.error('Error getting progress:', error);
                }
            }, 2000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning]);

    return (
        <div className="space-y-4">
            <Card title="Cài đặt" className="mb-4">
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ timeoutMs: 7000 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            label="Collection Account"
                            name="accountCollectionId"
                            rules={[{ required: true, message: 'Vui lòng chọn collection account' }]}
                        >
                            <Select
                                placeholder="Chọn collection account"
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={accountCollections.map(c => ({
                                    value: c.id,
                                    label: `${c.name} (${c.account_count || 0} accounts)`,
                                }))}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Collection Proxy"
                            name="proxyCollectionId"
                            rules={[{ required: true, message: 'Vui lòng chọn collection proxy' }]}
                        >
                            <Select
                                placeholder="Chọn collection proxy"
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={proxyCollections.map(c => ({
                                    value: c.id,
                                    label: `${c.name} (${c.proxy_count || 0} proxies)`,
                                }))}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Collection Code"
                            name="codeCollectionId"
                            rules={[{ required: true, message: 'Vui lòng chọn collection code' }]}
                        >
                            <Select
                                placeholder="Chọn collection code"
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={codeCollections.map(c => ({
                                    value: c.id,
                                    label: `${c.name} (${c.code_count || 0} codes)`,
                                }))}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Thời gian chạy mỗi code (ms)"
                            name="timeoutMs"
                            rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
                        >
                            <InputNumber
                                placeholder="7000"
                                min={1000}
                                max={60000}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                icon={<MdPlayArrow />}
                                onClick={handleStart}
                                disabled={isRunning}
                                size="large"
                            >
                                Start
                            </Button>
                            <Button
                                danger
                                icon={<MdStop />}
                                onClick={handleStop}
                                disabled={!isRunning}
                                size="large"
                            >
                                Stop
                            </Button>
                            <Button
                                icon={<MdDescription />}
                                onClick={() => setLogModalVisible(true)}
                                size="large"
                            >
                                Xem Logs
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="Tiến trình">
                <ProgressTable progress={progress} />
            </Card>

            <Card title="Danh sách giải đã trúng" className="mt-4">
                <PrizeTable prizes={prizes} />
            </Card>

            <LogModal
                visible={logModalVisible}
                onClose={() => setLogModalVisible(false)}
            />
        </div>
    );
}

