import { BaseRecord, IResourceComponentsProps } from "@refinedev/core";
import {
  List,
  useTable,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
  ImageField,
} from "@refinedev/antd";
import { Table, Space } from "antd";

export const PhotoList: React.FC<IResourceComponentsProps> = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

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
        <Table.Column dataIndex="title" title="Title" />
        <Table.Column dataIndex="description" title="Description" />
        <Table.Column dataIndex="position_index" title="Position" />
        <Table.Column 
            dataIndex="is_featured" 
            title="Featured" 
            render={(value) => (value ? "Yes" : "No")}
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
