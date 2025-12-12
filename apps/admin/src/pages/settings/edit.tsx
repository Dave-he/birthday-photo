import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Switch, Upload, Button, message, Space, Card, Typography, Divider, Row, Col } from "antd";
import { supabaseClient } from "../../utility/supabaseClient";
import { UploadOutlined, MobileOutlined, DesktopOutlined, VideoCameraOutlined } from "@ant-design/icons";

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

export const SettingsEdit: React.FC = () => {
    // We treat settings as a singleton, so we always try to edit the first row
    const { formProps, saveButtonProps } = useForm<SettingsFormValues>();
    
    const customRequest = async (options: any, _: any) => {
        try {
            const file = options.file as File;
            const fileName = `music-${Date.now()}-${file.name}`;
            const { error } = await supabaseClient.storage
                .from("photos") // Reusing photos bucket for now, ideally 'assets'
                .upload(fileName, file);

            if (error) throw error;

            const { data: urlData } = supabaseClient.storage
                .from("photos")
                .getPublicUrl(fileName);
            
            if (options.onSuccess) options.onSuccess(urlData.publicUrl);
            message.success("Music uploaded successfully!");
            
            // Auto fill the URL input
            formProps.form?.setFieldValue("bg_music_url", urlData.publicUrl);
        } catch (error) {
            console.error(error);
            if (options.onError) options.onError(error as Error);
            message.error("Upload failed.");
        }
    };

    const applyPreset = (preset: 'mobile' | 'desktop' | 'cinematic') => {
        const form = formProps.form;
        if (!form) return;
        
        if (preset === 'mobile') {
            form.setFieldsValue({
                low_quality_mode: true,
                particle_multiplier: 0.5,
                rotate_speed: 0.5,
                auto_mode_cycle_enabled: true,
                mode_cycle_min_seconds: 60,
                mode_cycle_max_seconds: 120,
            })
            message.info("Applied Mobile Preset");
        } else if (preset === 'desktop') {
            form.setFieldsValue({
                low_quality_mode: false,
                particle_multiplier: 1,
                rotate_speed: 0.8,
                auto_mode_cycle_enabled: true,
                mode_cycle_min_seconds: 60,
                mode_cycle_max_seconds: 180,
            })
            message.info("Applied Desktop Preset");
        } else {
            form.setFieldsValue({
                low_quality_mode: false,
                particle_multiplier: 1.5,
                rotate_speed: 1.2,
                auto_mode_cycle_enabled: true,
                mode_cycle_min_seconds: 90,
                mode_cycle_max_seconds: 240,
            })
            message.info("Applied Cinematic Preset");
        }
    }

    return (
        <Edit saveButtonProps={saveButtonProps} title="Global Configuration">
            <Form {...formProps} layout="vertical">
                <Card className="mb-4" size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>Quick Presets</Text>
                        <Space wrap>
                            <Button icon={<MobileOutlined />} onClick={() => applyPreset('mobile')}>Mobile</Button>
                            <Button icon={<DesktopOutlined />} onClick={() => applyPreset('desktop')}>Desktop</Button>
                            <Button icon={<VideoCameraOutlined />} onClick={() => applyPreset('cinematic')}>Cinematic</Button>
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
