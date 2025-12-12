import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Checkbox, Upload } from "antd";
import { supabaseClient } from "../../utility/supabaseClient";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";

export const PhotoEdit: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();
  
  // Custom Request logic reused (in a real app, extract this to a hook)
  const customRequest = async ({ file, onSuccess, onError }: any) => {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabaseClient.storage
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
