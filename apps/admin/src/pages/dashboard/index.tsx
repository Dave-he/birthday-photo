import { useList } from "@refinedev/core";
import { useGo } from "@refinedev/core";
import { Row, Col, Card, Statistic, Table, Typography, Space, Button } from "antd";
import { 
    PictureOutlined, 
    UserOutlined, 
    GlobalOutlined, 
    ArrowRightOutlined
} from "@ant-design/icons";
import { CONFIG } from "../../config";

const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
    const go = useGo();

    // Fetch stats
    const { data: photosData, isLoading: isLoadingPhotos } = useList({
        resource: "photos",
        pagination: { pageSize: 1, mode: "server" },
    });

    const { data: scenesData, isLoading: isLoadingScenes } = useList({
        resource: "scenes",
        pagination: { pageSize: 1, mode: "server" },
    });

    const { data: membersData, isLoading: isLoadingMembers } = useList({
        resource: "members",
        pagination: { pageSize: 1, mode: "server" },
    });

    // Fetch recent photos for the list
    const { data: recentPhotos, isLoading: isLoadingRecent } = useList({
        resource: "photos",
        pagination: { pageSize: 5, mode: "server" },
        sorters: [{ field: "created_at", order: "desc" }],
        meta: { select: "*, scenes(name), members(name)" }
    });

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Dashboard</Title>
                <Text type="secondary">Welcome back to the Birthday Photo Admin Panel</Text>
            </div>

            {/* KPI Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card variant="borderless">
                        <Statistic
                            title="Total Photos"
                            value={photosData?.total}
                            loading={isLoadingPhotos}
                            prefix={<PictureOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card variant="borderless">
                        <Statistic
                            title="Active Scenes"
                            value={scenesData?.total}
                            loading={isLoadingScenes}
                            prefix={<GlobalOutlined style={{ color: '#52c41a' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card variant="borderless">
                        <Statistic
                            title="Members"
                            value={membersData?.total}
                            loading={isLoadingMembers}
                            prefix={<UserOutlined style={{ color: '#722ed1' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                {/* Recent Activity */}
                <Col xs={24} lg={16}>
                    <Card 
                        title="Recent Uploads" 
                        variant="borderless"
                        extra={<Button type="link" onClick={() => go({ to: "/photos" })}>View All <ArrowRightOutlined /></Button>}
                    >
                        <Table 
                            dataSource={recentPhotos?.data} 
                            loading={isLoadingRecent} 
                            rowKey="id"
                            pagination={false}
                            size="small"
                        >
                            <Table.Column 
                                title="Preview" 
                                dataIndex="image_url" 
                                render={(val) => <img src={val} alt="preview" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />} 
                            />
                            <Table.Column title="Title" dataIndex="title" />
                            <Table.Column title="Scene" dataIndex={["scenes", "name"]} render={v => v || '-'} />
                            <Table.Column title="Member" dataIndex={["members", "name"]} render={v => v || '-'} />
                            <Table.Column 
                                title="Date" 
                                dataIndex="created_at" 
                                render={(val) => new Date(val).toLocaleDateString()} 
                            />
                        </Table>
                    </Card>
                </Col>

                {/* Quick Actions & System Info */}
                <Col xs={24} lg={8}>
                    <Card title="Quick Actions" variant="borderless" style={{ marginBottom: 16 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button type="primary" block icon={<PictureOutlined />} onClick={() => go({ to: "/photos" })}>
                                Manage Photos
                            </Button>
                            <Button block icon={<GlobalOutlined />} onClick={() => go({ to: "/scenes" })}>
                                Manage Scenes
                            </Button>
                            <Button block onClick={() => window.open(CONFIG.WEB_URL, '_blank')}>
                                Open Web App
                            </Button>
                        </Space>
                    </Card>

                    <Card title="System Status" variant="borderless">
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text>System Status</Text>
                            <Text type="success">Operational</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text>Database</Text>
                            <Text type="success">Connected</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Storage</Text>
                            <Text type="success">Available</Text>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};
