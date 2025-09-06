import * as yup from 'yup';

export const supplierSchema = yup
	.object({
		supplierName: yup.string().required('請輸入供應商名稱'),
		supplierType: yup.string().required('請選擇供應商類別'),
		accountCode: yup.string(),
		accountName: yup.string(),
		bankCode: yup.string(),
		isQuoted: yup.boolean().default(false)
	})
	.required();

export type SupplierFormData = yup.InferType<typeof supplierSchema>;
