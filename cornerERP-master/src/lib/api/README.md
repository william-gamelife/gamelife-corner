# BaseAPI 抽象層使用指南

## 概述

BaseAPI 抽象層旨在減少 API 檔案中的重複代碼，統一 API 管理模式，並提供一致的開發體驗。

## 主要功能

### 1. 標準 CRUD 操作自動生成
- `getEntities` - 查詢多筆資料
- `getEntity` - 查詢單筆資料  
- `createEntity` - 建立資料
- `updateEntity` - 更新資料
- `deleteEntity` - 刪除單筆資料
- `deleteEntities` - 批量刪除資料

### 2. 統一查詢參數處理
- 自動處理 URLSearchParams
- 支援陣列參數
- 特殊陣列參數的 JSON.stringify 處理
- null/undefined 值自動過濾

### 3. 擴展功能支援
- 搜尋端點
- 群組查詢端點
- 選擇列表端點
- 自訂端點

## 使用方式

### 基礎用法

```typescript
import { createExtendedApi, StandardQueryParams } from '@/lib/api/BaseApi';

// 1. 定義實體類型
interface MyEntity {
  id: string;
  name: string;
  status: number;
}

// 2. 定義查詢參數類型
interface MyEntityQueryParams extends StandardQueryParams {
  status?: number[];
  category?: string;
}

// 3. 建立 API
const MyEntityApi = createExtendedApi<MyEntity, string, MyEntityQueryParams>({
  basePath: '/api/supabase/my-entities',
  entityTag: 'myEntity',
  entitiesTag: 'myEntities',
  idField: 'id'
});

// 4. 導出 hooks
export const {
  useGetMyEntitiesQuery,
  useGetMyEntityQuery,
  useCreateMyEntityMutation,
  useUpdateMyEntityMutation,
  useDeleteMyEntityMutation,
  useDeleteMyEntitiesMutation
} = MyEntityApi;
```

### 進階用法 - 自訂功能

```typescript
const MyEntityApi = createExtendedApi<MyEntity, string, MyEntityQueryParams>({
  basePath: '/api/supabase/my-entities',
  entityTag: 'myEntity',
  entitiesTag: 'myEntities',
  idField: 'id',
  
  // 資料模型轉換
  modelTransform: MyEntityModel,
  
  // 搜尋功能
  searchEndpoint: {
    path: '/search',
    transformResponse: (response: { entities: MyEntity[] }) => response.entities
  },
  
  // 群組查詢
  groupEndpoints: {
    categoryId: '/by-category',
    userId: '/by-user'
  },
  
  // 選擇列表
  selectEndpoint: {
    path: '/for-select'
  },
  
  // 自訂端點
  customEndpoints: {
    getMyEntities: (build) => build.query({
      query: (params) => {
        // 處理特殊陣列參數
        const processedParams = QueryParamsBuilder.processSpecialArrays(
          params, 
          ['status']
        );
        const queryString = QueryParamsBuilder.toQueryString(processedParams);
        return { url: `/api/supabase/my-entities${queryString}` };
      },
      providesTags: ['myEntities']
    })
  }
});
```

## 查詢參數處理工具

### QueryParamsBuilder

提供統一的查詢參數處理功能：

```typescript
import { QueryParamsBuilder } from '@/lib/api/BaseApi';

// 基本用法
const params = { query: 'test', limit: 10, status: [1, 2] };
const queryString = QueryParamsBuilder.toQueryString(params);
// 結果: "?query=test&limit=10&status=1&status=2"

// 處理特殊陣列（需要 JSON.stringify）
const processedParams = QueryParamsBuilder.processSpecialArrays(params, ['status']);
// 結果: { query: 'test', limit: 10, status: '[1,2]' }
```

## 重構指南

### 步驟 1: 分析現有 API

1. 識別實體類型和主鍵欄位
2. 分析查詢參數結構
3. 找出特殊端點和自訂邏輯

### 步驟 2: 建立新的 API 檔案

```typescript
// 新建 MyEntityApiRefactored.ts
import { createExtendedApi } from '@/lib/api/BaseApi';

const MyEntityApi = createExtendedApi({
  // 基本配置
  basePath: '/api/supabase/my-entities',
  entityTag: 'myEntity',
  entitiesTag: 'myEntities',
  idField: 'id',
  
  // 根據需要添加擴展功能
  searchEndpoint: { path: '/search' },
  groupEndpoints: { groupId: '/by-group' },
  customEndpoints: { /* 特殊邏輯 */ }
});
```

### 步驟 3: 測試向後相容性

1. 確保所有原有的 hooks 仍然可用
2. 驗證查詢參數處理邏輯
3. 測試特殊端點功能

### 步驟 4: 漸進式替換

1. 先在新功能中使用重構後的 API
2. 逐步替換現有使用
3. 刪除舊的 API 檔案

## 最佳實踐

### 1. 命名規範

```typescript
// ✅ 正確
const OrderApi = createExtendedApi({
  entityTag: 'order',      // 單數，小寫開頭
  entitiesTag: 'orders',   // 複數，小寫開頭
  idField: 'orderNumber'   // 實際的主鍵欄位名
});

// ❌ 錯誤
const OrderApi = createExtendedApi({
  entityTag: 'Order',      // 不要大寫開頭
  entitiesTag: 'order',    // 不要用單數
  idField: 'id'            // 確保是正確的主鍵欄位
});
```

### 2. 類型定義

```typescript
// ✅ 正確 - 擴展 StandardQueryParams
interface OrderQueryParams extends StandardQueryParams {
  orderType?: string;
  status?: number[];
}

// ❌ 錯誤 - 重新定義基本欄位
interface OrderQueryParams {
  query?: string;    // 重複定義
  limit?: number;    // 重複定義
  orderType?: string;
}
```

### 3. 自訂端點

```typescript
// ✅ 正確 - 明確的端點用途
customEndpoints: {
  getOrdersByStatus: (build) => build.query({
    query: (status: number) => ({
      url: `/api/supabase/orders/by-status/${status}`
    }),
    providesTags: ['orders']
  })
}

// ❌ 錯誤 - 應該使用標準 CRUD
customEndpoints: {
  getAllOrders: (build) => build.query({
    // 這應該使用標準的 getOrders
  })
}
```

## 遷移檢查清單

- [ ] 實體類型定義正確
- [ ] 查詢參數類型完整
- [ ] 主鍵欄位識別正確
- [ ] 特殊查詢參數處理邏輯保留
- [ ] 回應轉換邏輯保留
- [ ] 自訂端點功能完整
- [ ] Hooks 導出完整
- [ ] 類型導出完整
- [ ] 測試通過
- [ ] 向後相容性確認

## 性能優勢

### 代碼減少統計

| API 檔案 | 原始行數 | 重構後行數 | 減少比例 |
|----------|----------|------------|----------|
| OrderApi | 131 行 | ~90 行 | 30% |
| BillApi | 115 行 | ~90 行 | 22% |
| CustomerApi | 129 行 | ~110 行 | 15% |
| ReceiptApi | 161 行 | ~140 行 | 13% |

### 維護優勢

1. **一致性**: 所有 API 使用相同的模式
2. **可維護性**: 修改基礎邏輯只需要更新 BaseAPI
3. **擴展性**: 新增 API 只需要配置，不需要重寫邏輯
4. **類型安全**: 強類型支援，減少運行時錯誤