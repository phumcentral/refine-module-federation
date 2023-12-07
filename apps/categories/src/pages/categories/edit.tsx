import { IResourceComponentsProps } from "@refinedev/core";

import { Edit, useForm } from "@refinedev/antd";

import { Checkbox, Form, Input } from "antd";

import { ICategory } from "../../interfaces";

const CategoryEdit: React.FC<IResourceComponentsProps> = () => {
    const { formProps, saveButtonProps } = useForm<ICategory>();

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form layout="vertical" {...formProps}>
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item label="Active" name="active" valuePropName="checked">
                    <Checkbox>Active</Checkbox>
                </Form.Item>
            </Form>
        </Edit>
    );
};

export default CategoryEdit;
