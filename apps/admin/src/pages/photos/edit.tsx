import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Checkbox, Upload, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useStorageUpload } from "../../utility/useStorageUpload";

export const PhotoEdit: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();
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

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
            label="Image URL"
            name="image_url"
            help="Upload a new image to replace the current one"
        >
             <Input disabled />
        </Form.Item>

         <Form.Item
          label="New Image Upload"
          name="image_url"
          getValueFromEvent={(e: any) => {
             return e?.file?.response; 
          }}
        >
           <Upload.Dragger
              name="file"
              customRequest={customRequest}
              listType="picture"
              maxCount={1}
           >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
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
          label="Title"
          name="title"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          label="Description"
          name="description"
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label="Position Index (1-50)"
          name="position_index"
        >
          <InputNumber min={1} max={50} />
        </Form.Item>

        <Form.Item
            name="is_featured"
            valuePropName="checked"
        >
            <Checkbox>Is Featured?</Checkbox>
        </Form.Item>
      </Form>
    </Edit>
  );
};
