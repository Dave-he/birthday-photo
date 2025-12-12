import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Checkbox, Upload, Select } from "antd";
import { supabaseClient } from "../../utility/supabaseClient";
import { UploadOutlined } from "@ant-design/icons";
import { useCreateMany } from "@refinedev/core";

export const PhotoCreate: React.FC = () => {
  const { formProps, saveButtonProps, onFinish } = useForm();
  const { mutate: createMany } = useCreateMany();
  
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

  const customRequest = async ({ file, onSuccess, onError }: any) => {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabaseClient.storage
        .from("photos")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabaseClient.storage
        .from("photos")
        .getPublicUrl(fileName);
      
      onSuccess(urlData.publicUrl);
    } catch (error) {
      onError(error);
    }
  };

  const handleFinish = async (values: any) => {
      // Handle multiple file uploads
      // 'image_urls' will be an array of file objects if using default Upload behavior with multiple=true
      // However, we used customRequest, so 'image_urls' might be handled differently depending on how we normalize it.
      // Let's assume 'image_urls' in values is an array of objects where 'response' is the URL.
      
      const images = values.image_urls; // Expecting array of { response: string, ... }
      
      if (Array.isArray(images) && images.length > 0) {
          const records = images.map((img: any) => ({
              image_url: img.response || img.url,
              title: values.title, // Shared title
              description: values.description, // Shared description
              position_index: values.position_index, // Shared (might overlap)
              is_featured: values.is_featured,
              scene_id: values.scene_id,
              member_id: values.member_id,
              tags: values.tags, // Array of strings
          }));
          
          createMany({
              resource: "photos",
              values: records,
          });
      } else {
          // Fallback for single or error
          onFinish(values);
      }
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
              <p className="ant-upload-hint">Support for a single or bulk upload.</p>
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
    </Create>
  );
};
