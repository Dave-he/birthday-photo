import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Switch, Upload, Button, message, Space, Card, Typography, Divider, Row, Col, UploadProps, Select } from "antd";
import { useStorageUpload } from "../../utility/useStorageUpload";
import { STORAGE_BUCKETS } from "../../utility/storage";
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
    default_scene_id?: string | null;
    default_mode?: string;
    default_layout?: string;
}

const SCENE_MODE_OPTIONS = [
    { value: "christmas", label: "🎄 Christmas" },
    { value: "birthday", label: "🎂 Birthday" },
    { value: "romantic", label: "💖 Romantic" },
    { value: "party", label: "🎉 Party" },
];

const GALLERY_LAYOUT_OPTIONS = [
    { value: "tree", label: "Tree" },
    { value: "helix", label: "Helix" },
    { value: "sphere", label: "Sphere" },
    { value: "grid", label: "Grid" },
];

const PRESET_ICONS: Record<PerformancePreset, React.ReactNode> = {
    mobile: <MobileOutlined />,
    desktop: <DesktopOutlined />,
    cinematic: <VideoCameraOutlined />,
}

export const SettingsEdit: React.FC = () => {
    // We treat settings as a singleton, so we always try to edit the first row
    const { formProps, saveButtonProps } = useForm<SettingsFormValues>();
    // Background music lives in its own bucket: the `photos` bucket only
    // accepts image MIME types, so an MP3 uploaded there is rejected.
    const customRequest = useStorageUpload({ bucket: STORAGE_BUCKETS.music, prefix: "track" });

    const { selectProps: sceneSelectProps } = useSelect({
        resource: "scenes",
        optionLabel: "name",
        optionValue: "id",
    });

    const handleUploadChange: NonNullable<UploadProps["onChange"]> = (info) => {
        const { file } = info
        if (file.status === "done") {
            const url = typeof file.response === "string" ? file.response : undefined
            if (url) {
                formProps.form?.setFieldValue("bg_music_url", url)
                message.success("Music uploaded successfully!")
            }
        } else if (file.status === "error") {
            // Surface the real reason (missing bucket, rejected MIME type,
            // not signed in) instead of a generic "upload failed".
            const reason = file.error instanceof Error ? file.error.message : undefined
            message.error(reason ? `Upload failed: ${reason}` : "Upload failed.")
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
                            label={`Upload Music File (${STORAGE_BUCKETS.music} bucket)`}
                            help={`Audio files are stored in the "${STORAGE_BUCKETS.music}" bucket. Create it with database/storage.sql if the upload fails.`}
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
                        <Divider orientation="left">Landing Configuration</Divider>
                        <Text type="secondary" className="block mb-4 text-xs">
                            The 3D client restores this configuration on every visit. It can also be
                            changed from the in-scene HUD.
                        </Text>

                        <Form.Item
                            label="Default Scene"
                            name="default_scene_id"
                        >
                            <Select
                                {...sceneSelectProps}
                                allowClear
                                placeholder="First available scene"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Default Mode"
                            name="default_mode"
                        >
                            <Select options={SCENE_MODE_OPTIONS} allowClear placeholder="Christmas" />
                        </Form.Item>

                        <Form.Item
                            label="Default Gallery Layout"
                            name="default_layout"
                        >
                            <Select options={GALLERY_LAYOUT_OPTIONS} allowClear placeholder="Tree" />
                        </Form.Item>

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
