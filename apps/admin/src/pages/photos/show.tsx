import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import { Descriptions, Tag, Image, Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

interface PhotoRecord {
    id: string;
    image_url: string;
    title: string;
    description: string;
    scene_id?: string;
    scenes?: { name: string };
    member_id?: string;
    members?: { name: string; avatar_url?: string };
    tags?: string[];
    position_index: number;
    is_featured: boolean;
    created_at: string;
}

export const PhotoShow: React.FC = () => {
    const { query, result: record } = useShow<PhotoRecord>({
        resource: "photos",
        // Join the scene / member names so the detail view can show them.
        meta: { select: "*, scenes(name), members(name)" },
    });

    return (
        <Show
            isLoading={query.isLoading}
            title={<Title level={4} style={{ margin: 0 }}>Photo Detail</Title>}
            breadcrumb={false}
        >
            <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Preview">
                    {record?.image_url ? (
                        <Image
                            src={record.image_url}
                            alt={record.title || "photo"}
                            style={{ maxWidth: 360, maxHeight: 260, objectFit: "cover", borderRadius: 8 }}
                        />
                    ) : (
                        <Text type="secondary">No image</Text>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Title">
                    {record?.title || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                    <Paragraph style={{ marginBottom: 0 }}>
                        {record?.description || "-"}
                    </Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label="Scene">
                    {record?.scenes?.name ? <Tag color="blue">{record.scenes.name}</Tag> : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Member">
                    {record?.members?.name ? <Tag color="green">{record.members.name}</Tag> : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Tags">
                    {record?.tags?.length
                        ? record.tags.map((tag: string) => <Tag key={tag}>{tag}</Tag>)
                        : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Position">
                    {record?.position_index ?? "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Featured">
                    {record?.is_featured ? <Tag color="gold">Yes</Tag> : <Tag>No</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                    {record?.created_at ? new Date(record.created_at).toLocaleString() : "-"}
                </Descriptions.Item>
            </Descriptions>
        </Show>
    );
};
