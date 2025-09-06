# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

這是一個**生產就緒**的旅遊業 ERP (企業資源規劃) 系統，使用 Next.js 15 + React 19 + TypeScript 開發。
系統已完成完整的安全性修復、測試基礎建設、程式碼品質改善和架構優化。

## 系統狀態 🎯

### ✅ 已完成的改進項目
- **安全性**: 100% API 認證覆蓋，0 個已知安全漏洞
- **測試覆蓋**: 14 個測試檔案，500+ 測試案例
- **程式碼品質**: TypeScript 嚴格模式，ESLint 優化
- **架構優化**: BaseAPI 抽象層，減少 18% 重複程式碼
- **效能優化**: 系統可穩定建置，所有路由正常

### 🚀 系統特色
- **高安全性**: 完整的認證機制和 CORS 保護
- **高品質**: 嚴格的 TypeScript 和測試覆蓋
- **高可維護性**: 統一的 API 架構和程式碼規範
- **高效能**: 優化的建置流程和載入速度

## 開發指令

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置專案
npm run build

# 啟動生產伺服器
npm start

# 程式碼檢查
npm run lint

# 修復 lint 問題
npm run lint:fix

# 執行測試
npm test

# 測試覆蓋率
npm run test:coverage

# 監控測試
npm run test:watch
```

## 核心技術棧

- **前端框架**: Next.js 15.1.7 (App Router) + React 19
- **語言**: TypeScript 5.4.5 (嚴格模式啟用)
- **UI 組件**: Material-UI v6 + Fuse React
- **CSS**: Tailwind CSS v4
- **狀態管理**: Redux Toolkit + RTK Query
- **表單處理**: React Hook Form + Zod/Yup
- **認證系統**: 純 Supabase 認證 (已移除 NextAuth)
- **資料庫**: Supabase
- **國際化**: i18next (支援繁體中文、英文)
- **測試框架**: Jest + React Testing Library + MSW v2

## 專案架構

### 目錄結構
```
src/
├── @auth/               # Supabase 認證系統
├── @fuse/               # Fuse UI 框架組件
├── @i18n/               # 國際化配置
├── app/
│   ├── (control-panel)/ # 主要業務模組
│   │   ├── orders/      # 訂單管理
│   │   ├── groups/      # 旅遊團管理
│   │   ├── customers/   # 客戶管理
│   │   ├── suppliers/   # 供應商管理
│   │   ├── invoices/    # 請款單管理
│   │   ├── receipts/    # 收款單管理
│   │   ├── bills/       # 出納單管理
│   │   ├── esims/       # 網卡管理
│   │   └── users/       # 員工管理
│   └── api/             # API 路由 (33 個端點)
├── components/          # 共用組件
├── store/              # Redux 狀態管理
├── lib/                # 工具函式庫
│   ├── api/            # BaseAPI 抽象層
│   ├── auth/           # 認證中介層
│   └── supabase/       # Supabase 配置
├── config/             # CORS 等安全配置
├── utils/              # 輔助函式 (包含 calculations.ts)
├── contexts/           # React Context
├── test-utils/         # 測試工具函數
├── __tests__/          # 測試檔案 (14 個)
├── constants/          # 常數定義
└── types/              # TypeScript 類型定義
```

### 業務模組標準結構
每個業務模組遵循統一架構：
```
模組名稱/
├── page.tsx              # 頁面入口
├── [模組名稱].tsx        # 列表頁主組件
├── [模組名稱]Header.tsx  # 列表頁標題
├── [模組名稱]Table.tsx   # 表格組件
├── [模組名稱]Api.ts      # RTK Query API (使用 BaseAPI)
├── models/               # 資料模型
│   └── [模組名稱]Model.ts
├── components/           # 模組專用組件
└── [id]/                # 詳細頁
    ├── page.tsx
    └── tabs/            # 分頁內容
```

## API 開發模式

### 使用 BaseAPI 抽象層
所有 API 模組統一使用 BaseAPI，提供標準 CRUD 操作：

```typescript
// 標準 API 結構
const ModuleApi = BaseAPI.createEntityApi<ModuleType>(
  'Module',           // 實體名稱
  'modules',          // API 端點
  {
    providesTags: ['modules'],
    allowedParams: ['search', 'status', 'dateFrom', 'dateTo'],
    specialEndpoints: {
      custom: { path: 'custom-action', method: 'POST' }
    }
  }
);

// 自動生成的端點
// - getModules (GET /api/supabase/modules)
// - getModuleById (GET /api/supabase/modules/:id)
// - createModule (POST /api/supabase/modules)
// - updateModule (PUT /api/supabase/modules/:id)
// - deleteModule (DELETE /api/supabase/modules/:id)
```

### 查詢參數處理
使用 QueryParamsBuilder 處理複雜查詢：
```typescript
const builder = new QueryParamsBuilder();
builder.add('search', '測試');
builder.addArray('status', ['active', 'pending']);
builder.addDateRange('2024-01-01', '2024-12-31');
const queryString = builder.build();
```

### 認證機制
所有 API 路由使用統一認證中介層：
```typescript
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: Request) {
  const user = await requireAuth(request);
  // API 邏輯
}
```

## 測試架構

### 測試類型與覆蓋
- **單元測試**: 工具函數、計算邏輯、組件
- **整合測試**: API 端點、認證流程
- **業務邏輯測試**: 訂單計算、收款流程、LinkPay 整合
- **安全性測試**: 認證中介層、權限控制

### 測試工具
```typescript
// MSW 模擬 API
import { server } from '@/test-utils/msw-server';
import { http, HttpResponse } from 'msw';

// React Testing Library
import { render, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/test-utils';
```

## 重要開發規範

### 1. 資料轉換
- **前端**: camelCase
- **資料庫**: snake_case
- **轉換工具**: `toCamelCase()`, `toSnakeCase()`

### 2. 安全性要求
- **所有 API 路由必須有認證檢查**
- **使用 CORS 白名單保護**
- **敏感資料存放在 .env.local**
- **Session 驗證和在職狀態檢查**

### 3. 程式碼品質
- **TypeScript 嚴格模式啟用**
- **ESLint 規則遵循**
- **使用 BaseAPI 減少重複程式碼**
- **所有業務邏輯需要測試覆蓋**

### 4. 效能最佳化
- **使用客戶端分頁 (統一策略)**
- **圖片壓縮和懶加載**
- **Bundle 大小優化**
- **API 回應時間監控**

## 命名規範

- **組件/檔案**: PascalCase (如 `OrderTable.tsx`)
- **API 函式**: camelCase (如 `getOrders`)
- **資料庫欄位**: snake_case (如 `created_at`)
- **前端資料**: camelCase (自動轉換)
- **測試檔案**: `*.test.ts` 或 `*.test.tsx`

## 表單處理

使用 React Hook Form + Zod 驗證：
```typescript
const schema = z.object({
  name: z.string().min(1, '必填'),
  email: z.string().email('無效的 Email')
});

const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema)
});
```

## 常見功能實作

### PDF 生成
```typescript
import { generatePDF } from '@/utils/generatePDF';
await generatePDF(element, 'filename.pdf');
```

### Excel 匯出
```typescript
import { exportToExcel } from '@/utils/exportExcel';
exportToExcel(data, 'filename');
```

### 商業計算
```typescript
import { calculateOrderTotal, calculateProfit } from '@/utils/calculations';
const total = calculateOrderTotal(orderItems);
const profit = calculateProfit(revenue, costs);
```

### 批量操作
大部分模組支援批量刪除、批量更新等操作，使用 selection state 管理選取狀態。

## 部署與環境

### 生產環境
- **平台**: Vercel
- **Node.js**: >= 22.12.0
- **npm**: >= 10.9.0
- **環境配置**: `.env`, `.env.development`, `.env.production`

### 環境變數
```env
# Supabase (必需)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE=your_service_role_key

# 認證 (必需)
AUTH_SECRET=your_auth_secret

# 環境
NODE_ENV=production
```

## 重要注意事項

### ✅ 系統優勢
1. **高安全性**: 完整認證和 CORS 保護
2. **高品質**: TypeScript 嚴格模式 + 測試覆蓋
3. **高可維護性**: BaseAPI 抽象層 + 統一架構
4. **高效能**: 優化建置 + 客戶端分頁
5. **完整測試**: 500+ 測試案例覆蓋關鍵功能

### ⚠️ 開發限制
1. **禁止降低安全性**: 不可移除認證檢查
2. **保持測試覆蓋**: 新功能必須包含測試
3. **遵循 BaseAPI**: 新 API 應使用 BaseAPI 架構
4. **保持程式碼品質**: 遵循 ESLint 和 TypeScript 規則

### 🎯 專注方向
**系統已達到生產就緒狀態，建議專注於**:
- 用戶體驗改善
- 新業務功能開發
- 實際業務需求實作
- 效能監控和優化

### 🚫 避免過度優化
- 技術債務已大幅改善，避免過度追求技術完美
- 專注商業價值而非技術指標
- 系統穩定性已足夠，避免不必要的重構

---

## 支援資源

- **進度記錄**: `PROGRESS_LOG.md` - 完整的系統改進歷程
- **API 指南**: `src/lib/api/README.md` - BaseAPI 使用說明
- **測試範例**: `src/__tests__/` - 各類型測試範例
- **工具函數**: `src/utils/calculations.ts` - 商業計算邏輯

**備註**: 此系統已完成完整的安全性修復、測試基礎建設和架構優化，現在應專注於業務功能開發和用戶價值創造。