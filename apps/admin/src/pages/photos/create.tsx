import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Checkbox, Upload } from "antd";
import { supabaseClient } from "../../utility/supabaseClient";
import { useState } from "react";
import { UploadOutlined } from "@ant-design/icons";

export const PhotoCreate: React.FC = () => {
  const { formProps, saveButtonProps, onFinish } = useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  const customRequest = async ({ file, onSuccess, onError }: any) => {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabaseClient.storage
        .from("photos")
        .upload(fileName, file);

      if (error) throw error;

      // Get Public URL
      const { data: urlData } = supabaseClient.storage
        .from("photos")
        .getPublicUrl(fileName);
      
      onSuccess(urlData.publicUrl);
    } catch (error) {
      onError(error);
    }
  };

  const handleFinish = async (values: any) => {
     // Assuming the upload component sets the 'image_url' in values via normalization or we handle it manually
     // Here we just pass the values as AntD form handles the binding
     // But we need to make sure the image field has the URL string, not the file object
     
     // Note: A better way with Refine+Antd Upload is to use `getValueFromEvent`
     onFinish(values);
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Image"
          name="image_url"
          rules={[{ required: true }]}
          getValueFromEvent={(e: any) => {
             if (Array.isArray(e)) return e;
             return e?.file?.response; // The customRequest onSuccess passes the URL as response
          }}
        >
           <Upload.Dragger
              name="file"
              customRequest={customRequest}
              listType="picture"
              maxCount={1}
              onChange={({ fileList }) => setFileList(fileList)}
           >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
           </Upload.Dragger>
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
    </Create>
  );
};
