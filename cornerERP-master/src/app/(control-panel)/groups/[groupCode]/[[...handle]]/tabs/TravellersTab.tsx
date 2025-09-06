'use client';

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
	Button,
	Typography,
	Paper,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	IconButton,
	Tooltip
} from '@mui/material';
import FuseLoading from '@fuse/core/FuseLoading';
import {
	Add as AddIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	Search as SearchIcon,
	CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import {
	useGetCustomersQuery,
	useGetCustomersByIdsQuery,
	useCreateCustomerMutation,
	useUpdateCustomerMutation,
	Customer
} from '@/app/(control-panel)/customers/CustomerApi';
import CustomerSearchDialog from './components/CustomerSearchDialog';
import CustomerEditDialog from './components/CustomerEditDialog';
import AddTravellersDialog from './components/AddTravellersDialog';
import ImportTravellersDialog from './components/ImportTravellersDialog';
import { formatPhoneNumber } from '@/utils/formatters';
import { useImportTravellersMutation } from '@/app/(control-panel)/groups/GroupApi';
import { useParams } from 'next/navigation';
import useUser from '@auth/useUser';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from '@/store/hooks';

function TravellersTab() {
	const methods = useFormContext();
	const { watch, setValue } = methods;
	const formValues = watch();
	const params = useParams<{ groupCode: string }>();
	const { data: user } = useUser();
	const dispatch = useAppDispatch();

	// 旅客 ID 陣列
	const travellerIds = formValues.travellerIds || [];

	// 狀態管理
	const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
	const [editIndex, setEditIndex] = useState<number | null>(null);
	const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
	const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
	const [isNewCustomer, setIsNewCustomer] = useState(false);

	// API Hooks
	const { data: allCustomers, isLoading: isLoadingCustomers } = useGetCustomersQuery();
	const [createCustomer] = useCreateCustomerMutation();
	const [updateCustomer] = useUpdateCustomerMutation();
	const [importTravellers, { isLoading: isImporting }] = useImportTravellersMutation();

	// 儲存各旅客 ID 對應的客戶資料
	const [travellers, setTravellers] = useState<(Customer | null)[]>([]);

	// 準備有效的 ID 陣列（過濾空值）
	const validTravellerIds = travellerIds.filter((id: string) => id && id.trim() !== '');

	// 使用批量查詢 hook 獲取客戶資料
	const { data: customersMap, isLoading: isBatchLoading } = useGetCustomersByIdsQuery(validTravellerIds, {
		skip: validTravellerIds.length === 0
	});

	// 當 travellerIds 或批量查詢結果變更時更新 travellers
	useEffect(() => {
		const newTravellers = travellerIds.map((id: string) => {
			if (!id || id.trim() === '') return null;

			return customersMap?.[id] || null;
		});
		setTravellers(newTravellers);
	}, [travellerIds, customersMap]);

	// 開啟新增旅客對話框
	const handleAddTraveller = () => {
		setIsAddDialogOpen(true);
	};

	// 開啟匯入旅客對話框
	const handleImportTravellers = () => {
		setIsImportDialogOpen(true);
	};

	// 處理匯入旅客
	const handleConfirmImport = async (file: File) => {
		if (!params.groupCode || !user?.id) {
			throw new Error('缺少必要參數：團號或使用者ID');
		}

		try {
			await importTravellers({
				file,
				groupCode: params.groupCode,
				employeeId: user.id
			}).unwrap();

			// 匯入成功後，清空當前旅客資料並重新載入
			setValue('travellerIds', [], {
				shouldDirty: true,
				shouldTouch: true
			});
			setTravellers([]);

			// 顯示成功訊息
			dispatch(showMessage({ message: '匯入旅客資訊成功！', variant: 'success' }));
		} catch (error) {
			console.error('匯入失敗:', error);
			throw new Error(error instanceof Error ? error.message : '匯入失敗，請稍後再試');
		}
	};

	// 批量新增旅客
	const handleAddMultipleTravellers = (count: number) => {
		// 建立指定數量的空字串 ID
		const newIds = Array(count).fill('');
		const newTravellerIds = [...travellerIds, ...newIds];

		// 明確設置 shouldDirty: true 確保表單被標記為已修改
		setValue('travellerIds', newTravellerIds, {
			shouldDirty: true,
			shouldTouch: true
		});

		// 建立對應數量的 null 旅客資料
		const newTravellerData = Array(count).fill(null);
		setTravellers([...travellers, ...newTravellerData]);

		// 關閉對話框
		setIsAddDialogOpen(false);
	};

	// 刪除旅客
	const handleDeleteTraveller = (index: number) => {
		const newTravellerIds = [...travellerIds];
		newTravellerIds.splice(index, 1);
		// 明確設置 shouldDirty: true 確保表單被標記為已修改
		setValue('travellerIds', newTravellerIds, {
			shouldDirty: true,
			shouldTouch: true
		});

		const newTravellers = [...travellers];
		newTravellers.splice(index, 1);
		setTravellers(newTravellers);
	};

	// 搜尋旅客
	const handleSearchTraveller = (index: number) => {
		setEditIndex(index);
		setSelectedCustomerId(travellerIds[index] || '');
		setIsSearchDialogOpen(true);
	};

	// 編輯旅客資料
	const handleEditTraveller = (index: number) => {
		setEditIndex(index);
		const customerId = travellerIds[index];
		const traveller = travellers[index];

		if (customerId && traveller) {
			// 如果有客戶資料，直接設置為編輯狀態
			setEditCustomer({ ...traveller });
			setIsNewCustomer(false);
		} else {
			// 如果沒有客戶資料，初始化一個空白客戶
			setEditCustomer({
				id: '',
				name: '',
				phone: '',
				email: '',
				birthday: '',
				note: ''
			});
			setIsNewCustomer(true);
		}

		setIsEditDialogOpen(true);
	};

	// 處理搜尋對話框的保存
	const handleSaveSearch = (customerId: string) => {
		if (editIndex !== null) {
			const newTravellerIds = [...travellerIds];
			const oldCustomerId = newTravellerIds[editIndex];
			newTravellerIds[editIndex] = customerId;

			// 只有當ID確實變更時才需更新
			if (oldCustomerId !== customerId) {
				// 明確設置 shouldDirty: true 確保表單被標記為已修改
				setValue('travellerIds', newTravellerIds, {
					shouldDirty: true,
					shouldTouch: true
				});

				// 如果選擇了客戶，更新 travellers 陣列中對應的客戶資料
				if (customerId && allCustomers) {
					const customer = allCustomers.find((c) => c.id === customerId);

					if (customer) {
						const newTravellers = [...travellers];
						newTravellers[editIndex] = customer;
						setTravellers(newTravellers);
					}
				}
			}
		}

		setEditIndex(null);
		setSelectedCustomerId('');
		setIsSearchDialogOpen(false);
	};

	// 處理編輯對話框的保存
	const handleSaveEdit = async (editedCustomer: Customer) => {
		if (editIndex === null) return;

		try {
			// 檢查基本必填欄位
			if (!editedCustomer.id || !editedCustomer.name) {
				dispatch(showMessage({ message: '身份證號和姓名為必填欄位', variant: 'error' }));
				return;
			}

			let savedCustomer: Customer;

			// 先檢查 ID 是否存在
			const checkResponse = await fetch(`/api/supabase/customers/${editedCustomer.id}`);
			const checkData = await checkResponse.json();

			// 根據檢查結果決定新增或更新
			if (checkResponse.ok && checkData.customer) {
				// ID 存在，執行更新操作
				savedCustomer = await updateCustomer(editedCustomer).unwrap();
			} else {
				// ID 不存在，執行新增操作
				savedCustomer = await createCustomer(editedCustomer).unwrap();
			}

			// 確保有獲得正確的回傳資料
			if (!savedCustomer || !savedCustomer.id) {
				throw new Error('儲存客戶資料失敗：回傳的資料不完整');
			}

			// 更新 travellerIds
			const newTravellerIds = [...travellerIds];
			newTravellerIds[editIndex] = savedCustomer.id;

			// 更新 travellers
			const newTravellers = [...travellers];
			newTravellers[editIndex] = savedCustomer;
			setTravellers(newTravellers);

			setValue('travellerIds', newTravellerIds, {
				shouldDirty: true,
				shouldTouch: true
			});

			// 確認資料已儲存後再關閉對話框
			setIsEditDialogOpen(false);
			setEditIndex(null);
			setEditCustomer(null);
		} catch (error) {
			console.error('保存客戶資料失敗:', error);
			dispatch(
				showMessage({
					message: '保存客戶資料失敗: ' + (error instanceof Error ? error.message : '未知錯誤'),
					variant: 'error'
				})
			);
		}
	};

	// 取消對話框
	const handleCloseDialogs = () => {
		setEditIndex(null);
		setSelectedCustomerId('');
		setEditCustomer(null);
		setIsSearchDialogOpen(false);
		setIsEditDialogOpen(false);
		setIsImportDialogOpen(false);
	};

	if (isLoadingCustomers || isBatchLoading) {
		return <FuseLoading />;
	}

	return (
		<div className="w-full">
			<Paper className="p-4">
				<div className="flex justify-between items-center mb-4">
					<Typography variant="h6">旅客名單</Typography>
					<div className="flex gap-2">
						<Button
							variant="outlined"
							color="primary"
							startIcon={<CloudUploadIcon />}
							onClick={handleImportTravellers}
							disabled={isImporting}
						>
							{isImporting ? '匯入中...' : '匯入旅客資訊'}
						</Button>
						<Button
							variant="contained"
							color="primary"
							startIcon={<AddIcon />}
							onClick={handleAddTraveller}
						>
							新增旅客
						</Button>
					</div>
				</div>

				<Table>
					<TableHead>
						<TableRow>
							<TableCell>序號</TableCell>
							<TableCell>身份證號</TableCell>
							<TableCell>姓名</TableCell>
							<TableCell>護照拼音</TableCell>
							<TableCell>生日</TableCell>
							<TableCell>護照號碼</TableCell>
							<TableCell>效期</TableCell>
							<TableCell>動作</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{travellerIds.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									align="center"
								>
									尚無旅客資料
								</TableCell>
							</TableRow>
						) : (
							travellerIds.map((id, index) => {
								const traveller = travellers[index];

								return (
									<TableRow key={index}>
										<TableCell>{index + 1}</TableCell>
										<TableCell>{id || '-'}</TableCell>
										<TableCell>{traveller ? traveller.name : `旅客(${index + 1})`}</TableCell>
										<TableCell>{traveller?.passportRomanization || '-'}</TableCell>
										<TableCell>{traveller?.birthday || '-'}</TableCell>
										<TableCell>{traveller?.passportNumber || '-'}</TableCell>
										<TableCell>{traveller?.passportValidTo || '-'}</TableCell>
										<TableCell>
											<Tooltip title="搜尋旅客">
												<IconButton
													color="info"
													onClick={() => handleSearchTraveller(index)}
												>
													<SearchIcon />
												</IconButton>
											</Tooltip>
											<Tooltip title={id ? '編輯旅客' : '新增旅客'}>
												<IconButton
													color="primary"
													onClick={() => handleEditTraveller(index)}
												>
													<EditIcon />
												</IconButton>
											</Tooltip>
											<Tooltip title="刪除旅客">
												<IconButton
													color="error"
													onClick={() => handleDeleteTraveller(index)}
												>
													<DeleteIcon />
												</IconButton>
											</Tooltip>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</Paper>

			{/* 客戶搜尋對話框 */}
			<CustomerSearchDialog
				open={isSearchDialogOpen}
				onClose={handleCloseDialogs}
				onSave={handleSaveSearch}
				initialCustomerId={selectedCustomerId}
				customers={allCustomers}
			/>

			{/* 客戶編輯對話框 */}
			<CustomerEditDialog
				open={isEditDialogOpen}
				onClose={handleCloseDialogs}
				onSave={handleSaveEdit}
				customer={editCustomer}
				isNew={isNewCustomer}
			/>

			{/* 新增旅客數量對話框 */}
			<AddTravellersDialog
				open={isAddDialogOpen}
				onClose={() => setIsAddDialogOpen(false)}
				onConfirm={handleAddMultipleTravellers}
			/>

			{/* 匯入旅客對話框 */}
			<ImportTravellersDialog
				open={isImportDialogOpen}
				onClose={handleCloseDialogs}
				onConfirm={handleConfirmImport}
				isLoading={isImporting}
			/>
		</div>
	);
}

export default TravellersTab;
