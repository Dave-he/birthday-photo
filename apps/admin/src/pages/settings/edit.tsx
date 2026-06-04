import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Switch, Upload, Button, message, Space, Card, Typography, Divider, Row, Col, UploadProps } from "antd";
import { useStorageUpload } from "../../utility/useStorageUpload";
import { UploadOutlined, MobileOutlined, DesktopOutlined, VideoCameraOutlined } from "@ant-design/icons";
import {
  PERFORMANCE_PRESETS,
  PRESET_LABELS,
  PerformancePreset,
} from "./presets";

const { Text } = Typography;

interface SettingsFormValues {
    greeting_title?: string;
    snow_density?: number;
    is_snowing?: boolean;
    auto_mode_cycle_enabled?: boolean;
    mode_cycle_min_seconds?: number;
    mode_cycle_max_seconds?: number;
    bg_music_url?: string;
    low_quality_mode?: boolean;
    particle_multiplier?: number;
    rotate_speed?: number;
}

const PRESET_ICONS: Record<PerformancePreset, React.ReactNode> = {
    mobile: <MobileOutlined />,
    desktop: <DesktopOutlined />,
    cinematic: <VideoCameraOutlined />,
}

export const SettingsEdit: React.FC = () => {
    // We treat settings as a singleton, so we always try to edit the first row
    const { formProps, saveButtonProps } = useForm<SettingsFormValues>();
    const customRequest = useStorageUpload({ bucket: "photos", prefix: "music" });

    const handleUploadChange: NonNullable<UploadProps["onChange"]> = (info) => {
        const { file } = info
        if (file.status === "done") {
            const url = typeof file.response === "string" ? file.response : undefined
            if (url) {
                formProps.form?.setFieldValue("bg_music_url", url)
                message.success("Music uploaded successfully!")
            }
        } else if (file.status === "error") {
            message.error("Upload failed.")
        }
    }

    const applyPreset = (preset: PerformancePreset) => {
        const form = formProps.form
        if (!form) return
        form.setFieldsValue(PERFORMANCE_PRESETS[preset])
        message.info(`Applied ${PRESET_LABELS[preset]} Preset`)
    }

    return (
        <Edit saveButtonProps={saveButtonProps} title="Global Configuration">
            <Form {...formProps} layout="vertical">
                <Card className="mb-4" size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>Quick Presets</Text>
                        <Space wrap>
                            {(Object.keys(PERFORMANCE_PRESETS) as PerformancePreset[]).map((p) => (
                                <Button
                                    key={p}
                                    icon={PRESET_ICONS[p]}
                                    onClick={() => applyPreset(p)}
                                >
                                    {PRESET_LABELS[p]}
                                </Button>
                            ))}
                        </Space>
                    </Space>
                </Card>

                <Row gutter={24}>
                    <Col span={12}>
                        <Divider orientation="left">General</Divider>
                        <Form.Item
                            label="Greeting Title"
                            name="greeting_title"
                            rules={[{ required: true }]}
                        >
                            <Input placeholder="Merry Christmas!" />
                        </Form.Item>

                        <Form.Item
                            label="Background Music URL"
                            name="bg_music_url"
                        >
                            <Input placeholder="https://..." />
                        </Form.Item>

                        <Form.Item
                            label="Upload Music File (MP3)"
                        >
                            <Upload.Dragger
                                name="file"
                                customRequest={customRequest}
                                onChange={handleUploadChange}
                                maxCount={1}
                                accept="audio/*"
                                showUploadList={false}
                            >
                                <p className="ant-upload-drag-icon">
                                    <UploadOutlined />
                                </p>
                                <p className="ant-upload-text">Click or drag MP3 file to upload</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                        <Divider orientation="left">Visuals & Performance</Divider>
                        <Space size="large" className="mb-4">
                            <Form.Item
                                label="Low Quality Mode"
                                name="low_quality_mode"
                                valuePropName="checked"
                                className="mb-0"
                            >
                                <Switch />
                            </Form.Item>
                             <Form.Item
                                label="Snowing"
                                name="is_snowing"
                                valuePropName="checked"
                                className="mb-0"
                            >
                                <Switch />
                            </Form.Item>
                        </Space>

                        <Row gutter={16}>
                             <Col span={12}>
                                <Form.Item
                                    label="Particle Multiplier"
                                    name="particle_multiplier"
                                >
                                    <InputNumber min={0.1} max={3} step={0.1} style={{ width: '100%' }} />
                                </Form.Item>
                             </Col>
                             <Col span={12}>
                                <Form.Item
                                    label="Snow Density"
                                    name="snow_density"
                                >
                                    <InputNumber min={0} max={2000} step={50} style={{ width: '100%' }} />
                                </Form.Item>
                             </Col>
                        </Row>

                        <Form.Item
                            label="Rotate Speed"
                            name="rotate_speed"
                        >
                            <InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} />
                        </Form.Item>

                        <Divider orientation="left">Auto Cycle</Divider>
                        <Form.Item
                            label="Enable Auto Mode Cycle"
                            name="auto_mode_cycle_enabled"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>

                        <Row gutter={16}>
                             <Col span={12}>
                                <Form.Item
                                    label="Min Duration (s)"
                                    name="mode_cycle_min_seconds"
                                >
                                    <InputNumber min={5} max={600} step={5} style={{ width: '100%' }} />
                                </Form.Item>
                             </Col>
                             <Col span={12}>
                                <Form.Item
                                    label="Max Duration (s)"
                                    name="mode_cycle_max_seconds"
                                >
                                    <InputNumber min={5} max={1200} step={5} style={{ width: '100%' }} />
                                </Form.Item>
                             </Col>
                        </Row>
                    </Col>
                </Row>
            </Form>
        </Edit>
    );
};
