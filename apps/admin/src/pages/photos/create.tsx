import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Checkbox, Upload, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useCreateMany, useList } from "@refinedev/core";
import { useStorageUpload } from "../../utility/useStorageUpload";

interface CreateFormValues {
  image_urls: Array<{ response?: string; url?: string }>
  title?: string
  description?: string
  is_featured?: boolean
  scene_id?: string
  member_id?: string
  tags?: string[]
}

export const PhotoCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();
  const { mutate: createMany } = useCreateMany();
  const customRequest = useStorageUpload({ bucket: "photos", prefix: "photo" });

  // Select for Scenes
  const { selectProps: sceneSelectProps } = useSelect({
    resource: "scenes",
    optionLabel: "name",
    optionValue: "id",
  });

  // Select for Members
  const { selectProps: memberSelectProps } = useSelect({
    resource: "members",
    optionLabel: "name",
    optionValue: "id",
  });

  // Look up the highest existing position_index so bulk uploads don't all
  // collide on the same index. Falls back to 0 when the table is empty.
  const photosQuery = useList({
    resource: "photos",
    pagination: { pageSize: 1, mode: "server" },
    sorters: [{ field: "position_index", order: "desc" }],
  })
  const maxPositionIndex = (photosQuery.result?.data?.[0]?.position_index as number) ?? 0

  const handleFinish = (values: any) => {
    const v = values as CreateFormValues
    const images = v.image_urls ?? []
    if (images.length === 0) return // `rules: [{ required: true }]` covers this

    const records = images
      .map((img) => img.response || img.url)
      .filter((url): url is string => Boolean(url))
      .map((url, i) => ({
        image_url: url,
        title: v.title,
        description: v.description,
        // Stagger positions so each photo lands at a unique slot
        // (maxPositionIndex + i + 1).
        position_index: maxPositionIndex + i + 1,
        is_featured: v.is_featured,
        scene_id: v.scene_id,
        member_id: v.member_id,
        tags: v.tags,
      }))

    if (records.length === 0) return
    createMany({ resource: "photos", values: records })
  };

  return (
    <Create saveButtonProps={{ ...saveButtonProps, onClick: () => formProps.form?.submit() }}>
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Images (Multiple)"
          name="image_urls"
          rules={[{ required: true }]}
          getValueFromEvent={(e: any) => {
             if (Array.isArray(e)) return e;
             return e?.fileList;
          }}
        >
           <Upload.Dragger
              name="file"
              multiple
              customRequest={customRequest}
              listType="picture"
           >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag files to this area to upload</p>
              <p className="ant-upload-hint">Support for a single or bulk upload. Next free position starts at {(maxPositionIndex ?? 0) + 1}.</p>
           </Upload.Dragger>
        </Form.Item>

        <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
                label="Scene"
                name="scene_id"
                style={{ flex: 1 }}
            >
                <Select {...sceneSelectProps} allowClear placeholder="Select a scene" />
            </Form.Item>

            <Form.Item
                label="Member (User)"
                name="member_id"
                style={{ flex: 1 }}
            >
                <Select {...memberSelectProps} allowClear placeholder="Select a member" />
            </Form.Item>
        </div>

        <Form.Item
          label="Tags"
          name="tags"
        >
          <Select mode="tags" style={{ width: '100%' }} placeholder="Add tags" />
        </Form.Item>

        <Form.Item
          label="Title (Shared)"
          name="title"
        >
          <Input placeholder="e.g. Christmas Eve" />
        </Form.Item>

        <Form.Item
          label="Description (Shared)"
          name="description"
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
            name="is_featured"
            valuePropName="checked"
        >
            <Checkbox>Is Featured?</Checkbox>
        </Form.Item>
      </Form>
    </Create>
  );
};
