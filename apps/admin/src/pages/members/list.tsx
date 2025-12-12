import type { BaseRecord, IResourceComponentsProps } from "@refinedev/core";
import {
  List,
  useTable,
  EditButton,
  
  DeleteButton,
  DateField,
  ImageField,
} from "@refinedev/antd";
import { Table, Space } from "antd";

export const MemberList: React.FC<IResourceComponentsProps> = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="avatar_url"
          title="Avatar"
          render={(value) => (
            <ImageField value={value} title="Avatar" width={40} style={{ borderRadius: '50%' }} />
          )}
        />
        <Table.Column dataIndex="name" title="Name" />
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
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
