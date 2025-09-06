# 網卡管理模組 (Esims)

本模組提供完整的網卡管理功能，包含新增、修改、刪除和查詢功能。

## 檔案結構

```
esims/
├── page.tsx                          # 主頁面路由
├── Esims.tsx                         # 主要元件
├── EsimsHeader.tsx                   # 頁面標題和新增按鈕
├── EsimsTable.tsx                    # 資料表格和搜尋功能
├── EsimApi.ts                        # API 定義和 RTK Query hooks
├── models/
│   └── EsimModels.ts                 # 資料模型定義
├── schemas/
│   └── esimSchema.ts                 # 表單驗證規則
├── components/
│   ├── EsimDialog.tsx                # 新增網卡對話框
│   └── EsimSearchDialog.tsx          # 搜尋對話框
├── hooks/
│   └── useEsimDictionary.ts          # 網卡字典 hook
└── [esimNumber]/
    ├── page.tsx                      # 詳細頁面路由
    ├── Esim.tsx                      # 詳細頁面主元件
    ├── EsimHeader.tsx                # 詳細頁面標題和操作按鈕
    └── tabs/
        └── BasicInfoTab.tsx          # 基本資訊表單
```

## API 路由

```
api/supabase/esims/
├── route.ts                          # GET, POST, DELETE (批量)
└── [esimNumber]/
    └── route.ts                      # GET, PUT, DELETE (單筆)
```

## 功能特色

### 1. 清單頁面 (`/esims`)
- 顯示所有網卡資料
- 支援詳細搜尋功能
- 可點擊網卡單號進入詳細頁面
- 狀態顯示使用彩色標籤

### 2. 詳細頁面 (`/esims/[esimNumber]`)
- 新增模式：`/esims/new`
- 編輯模式：`/esims/[esimNumber]`
- 表單驗證
- 即時儲存功能

### 3. 搜尋功能
- 網卡單號
- 團號
- 訂單編號
- 供應商訂單編號
- 狀態篩選

### 4. 狀態管理
- 0: 待確認 (警告色)
- 1: 已確認 (成功色)
- 2: 已出帳 (資訊色)

## 資料表結構

對應 Supabase 中的 `esims` 資料表：

```sql
create table esims (
    esim_number           varchar(25) not null primary key,
    group_code            varchar(25) not null,
    order_number          varchar(11),
    supplier_order_number varchar(50),
    status                smallint    not null,
    created_at            timestamp   not null,
    created_by            varchar(4)  not null,
    modified_at           timestamp   not null,
    modified_by           varchar(4)  not null
);
```

## 使用方式

### 1. 匯入 API hooks
```typescript
import { 
  useGetEsimsQuery,
  useCreateEsimMutation,
  useUpdateEsimMutation,
  useDeleteEsimMutation 
} from './EsimApi';
```

### 2. 使用網卡字典
```typescript
import { useEsimDictionary } from './hooks/useEsimDictionary';

const { getEsimInfo } = useEsimDictionary();
const esimInfo = getEsimInfo('ESIM001'); // "ESIM001 (GROUP001)"
```

### 3. 表單驗證
```typescript
import { esimSchema, EsimFormData } from './schemas/esimSchema';
```

## 注意事項

1. 所有 API 都會自動處理欄位名稱的轉換（駝峰式 ↔ 蛇形命名）
2. 狀態值必須為 0、1、2 其中之一
3. 網卡單號為主鍵，不可重複
4. 團號必須存在於 groups 資料表中（外鍵約束） 