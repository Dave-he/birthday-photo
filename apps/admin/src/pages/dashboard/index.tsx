import { useEffect, useState } from "react";
import { useList } from "@refinedev/core";
import { useGo } from "@refinedev/core";
import { Row, Col, Card, Statistic, Table, Typography, Space, Button, Spin } from "antd";
import {
    PictureOutlined,
    UserOutlined,
    GlobalOutlined,
    ArrowRightOutlined,
    CheckCircleTwoTone,
    CloseCircleTwoTone,
} from "@ant-design/icons";
import { CONFIG } from "../../config";
import { supabaseClient } from "../../utility/supabaseClient";

const { Title, Text } = Typography;

type ProbeState = "checking" | "ok" | "down"

interface SystemStatus {
    api: ProbeState
    storage: ProbeState
}

async function probeSupabase(): Promise<SystemStatus> {
    // Lightweight `head: true` + `count: exact` request — returns 200 without
    // any row payload if the database is reachable, so this is cheap.
    const apiPromise = (async () => {
        try {
            const { error } = await supabaseClient
                .from("scenes")
                .select("id", { head: true, count: "exact" })
            return error ? "down" : "ok"
        } catch {
            return "down" as const
        }
    })()

    // Storage ping: list a single file (limit 1) in the photos bucket.
    const storagePromise = (async () => {
        try {
            const { error } = await supabaseClient.storage
                .from("photos")
                .list("", { limit: 1 })
            return error ? "down" : "ok"
        } catch {
            return "down" as const
        }
    })()

    const [api, storage] = await Promise.all([apiPromise, storagePromise])
    return { api, storage }
}

const StatusLine: React.FC<{ label: string; state: ProbeState }> = ({ label, state }) => (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <Text>{label}</Text>
        <Space size={4}>
            {state === "checking" ? (
                <Spin size="small" />
            ) : state === "ok" ? (
                <CheckCircleTwoTone twoToneColor="#52c41a" />
            ) : (
                <CloseCircleTwoTone twoToneColor="#f5222d" />
            )}
            <Text type={state === "ok" ? "success" : state === "down" ? "danger" : "secondary"}>
                {state === "checking" ? "Checking..." : state === "ok" ? "Available" : "Unavailable"}
            </Text>
        </Space>
    </div>
)

export const DashboardPage: React.FC = () => {
    const go = useGo();
    const [status, setStatus] = useState<SystemStatus>({ api: "checking", storage: "checking" })

    // Fetch stats
    const photosQuery = useList({
        resource: "photos",
        pagination: { pageSize: 1, mode: "server" },
    });
    const photosData = photosQuery.result;
    const isLoadingPhotos = photosQuery.query.isLoading;

    const scenesQuery = useList({
        resource: "scenes",
        pagination: { pageSize: 1, mode: "server" },
    });
    const scenesData = scenesQuery.result;
    const isLoadingScenes = scenesQuery.query.isLoading;

    const membersQuery = useList({
        resource: "members",
        pagination: { pageSize: 1, mode: "server" },
    });
    const membersData = membersQuery.result;
    const isLoadingMembers = membersQuery.query.isLoading;

    // Fetch recent photos for the list
    const recentPhotosQuery = useList({
        resource: "photos",
        pagination: { pageSize: 5, mode: "server" },
        sorters: [{ field: "created_at", order: "desc" }],
        meta: { select: "*, scenes(name), members(name)" }
    });
    const recentPhotos = recentPhotosQuery.result;
    const isLoadingRecent = recentPhotosQuery.query.isLoading;

    // Probe Supabase liveness on mount and every 30s.
    useEffect(() => {
        let cancelled = false
        const run = async () => {
            const next = await probeSupabase()
            if (!cancelled) setStatus(next)
        }
        run()
        const id = window.setInterval(run, 30_000)
        return () => {
            cancelled = true
            window.clearInterval(id)
        }
    }, [])

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
                        <StatusLine label="API (PostgREST)" state={status.api} />
                        <StatusLine label="Storage" state={status.storage} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};
