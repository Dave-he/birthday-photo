import type { BaseRecord, IResourceComponentsProps } from "@refinedev/core";
import {
  List,
  useTable,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
  ImageField,
  FilterDropdown,
  useSelect,
} from "@refinedev/antd";
import { Table, Space, Tag, Button, Input, Select, Radio } from "antd";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { CONFIG } from "../../config";

interface PhotoRecord extends BaseRecord {
    image_url: string;
    title: string;
    scene_id?: string;
    scenes?: { name: string };
    member_id?: string;
    members?: { name: string };
    tags?: string[];
    position_index: number;
    is_featured: boolean;
    created_at: string;
}

export const PhotoList: React.FC<IResourceComponentsProps> = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    meta: {
        select: '*, scenes(name), members(name)' // Join query
    }
  });

  const { selectProps: sceneSelectProps } = useSelect({
    resource: "scenes",
    optionLabel: "name",
    optionValue: "id",
  });

  const { selectProps: memberSelectProps } = useSelect({
    resource: "members",
    optionLabel: "name",
    optionValue: "id",
  });

  const handlePreview = (sceneId: string) => {
      window.open(`${CONFIG.WEB_URL}?sceneId=${sceneId}`, '_blank');
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="image_url"
          title="Image"
          render={(value) => (
            <ImageField value={value} title="Image" width={80} />
          )}
        />
        <Table.Column 
            dataIndex="title" 
            title="Title" 
            filterIcon={<SearchOutlined />}
            filterDropdown={(props) => (
                <FilterDropdown {...props}>
                    <Input placeholder="Search Title" />
                </FilterDropdown>
            )}
        />
        
        {/* Scenes Column */}
        <Table.Column 
            dataIndex={["scenes", "name"]} 
            title="Scene" 
            filterDropdown={(props) => (
                <FilterDropdown {...props} mapValue={(selectedKeys) => selectedKeys.map(i => i)}>
                    <Select
                        style={{ minWidth: 200 }}
                        mode="multiple"
                        placeholder="Select Scene"
                        {...sceneSelectProps}
                    />
                </FilterDropdown>
            )}
            render={(value, record: PhotoRecord) => (
                <Space>
                    {value ? <Tag color="blue">{value}</Tag> : "-"}
                    {record.scene_id && (
                        <Button 
                            type="link" 
                            size="small" 
                            icon={<EyeOutlined />} 
                            onClick={() => handlePreview(record.scene_id!)}
                            title="Preview Scene in 3D"
                        />
                    )}
                </Space>
            )}
        />

        {/* Members Column */}
        <Table.Column 
            dataIndex={["members", "name"]} 
            title="Member"
            filterDropdown={(props) => (
                <FilterDropdown {...props} mapValue={(selectedKeys) => selectedKeys.map(i => i)}>
                    <Select
                        style={{ minWidth: 200 }}
                        mode="multiple"
                        placeholder="Select Member"
                        {...memberSelectProps}
                    />
                </FilterDropdown>
            )}
            render={(value) => value ? <Tag color="green">{value}</Tag> : "-"} 
        />

        {/* Tags Column */}
        <Table.Column 
            dataIndex="tags" 
            title="Tags"
            render={(tags: string[]) => (
                <>
                    {tags?.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                    ))}
                </>
            )}
        />

        <Table.Column dataIndex="position_index" title="Position" />
        <Table.Column 
            dataIndex="is_featured" 
            title="Featured" 
            filterDropdown={(props) => (
                <FilterDropdown {...props}>
                    <Radio.Group>
                        <Radio value="true">Yes</Radio>
                        <Radio value="false">No</Radio>
                    </Radio.Group>
                </FilterDropdown>
            )}
            render={(value) => (value ? <Tag color="gold">Yes</Tag> : <Tag>No</Tag>)}
        />
        <Table.Column
          dataIndex="created_at"
          title="Created At"
          render={(value: any) => <DateField value={value} />}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
