import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Upload } from "antd";
import { supabaseClient } from "../../utility/supabaseClient";
import { UploadOutlined } from "@ant-design/icons";

export const MemberCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();

  const customRequest = async ({ file, onSuccess, onError }: any) => {
    try {
      const fileName = `avatar-${Date.now()}-${file.name}`;
      const { error } = await supabaseClient.storage
        .from("photos") // Using 'photos' bucket for avatars too
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

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Avatar"
          name="avatar_url"
          getValueFromEvent={(e: any) => e?.file?.response}
        >
           <Upload.Dragger
              name="file"
              customRequest={customRequest}
              listType="picture-card"
              maxCount={1}
           >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
           </Upload.Dragger>
        </Form.Item>
      </Form>
    </Create>
  );
};
