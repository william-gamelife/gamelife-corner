# 遊戲人生 3.0 設計規範手冊 📐

## 🎯 版面對齊標準

### 核心規則：歡迎卡片對齊原則

所有模組的內容區域必須與 dashboard.html 頂部的**歡迎卡片左右邊距對齊**。

#### ✅ 正確示例（人員管理模組）
```css
.users-container {
    max-width: 1200px;        /* 限制最大寬度 */
    margin: 0 auto;           /* 水平置中 */
    padding: 0 24px;          /* 左右內邊距與歡迎卡片一致 */
}
```

#### ❌ 錯誤示例（其他模組）
```css
.module-container {
    padding: 20px;            /* 四周等距 - 會導致不對齊 */
    /* 或 */
    width: 100%;              /* 滿寬度 - 在大螢幕上會太寬 */
}
```

### 📏 標準數值

**Container 標準：**
- `max-width: 1200px` - 內容最大寬度
- `margin: 0 auto` - 水平置中
- `padding: 0 24px` - 左右內邊距
- `box-sizing: border-box` - 包含內邊距的盒模型

**歡迎卡片參考：**
```css
.welcome-card {
    max-width: 1200px;
    margin: 0 auto 30px auto;
    padding: 0 24px;
    box-sizing: border-box;
}
```

### 🎨 響應式斷點

#### 桌面版 (>= 1024px)
```css
.module-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}
```

#### 平板版 (768px - 1023px)
```css
.module-container {
    max-width: 100%;
    margin: 0 auto;
    padding: 0 20px;
}
```

#### 手機版 (<= 767px)
```css
.module-container {
    max-width: 100%;
    margin: 0 auto;
    padding: 0 16px;
}
```

### 🔧 實施步驟

1. **檢查現有模組**
   ```javascript
   // 檢查模組 container 的樣式
   const container = document.querySelector('.module-container');
   console.log(window.getComputedStyle(container));
   ```

2. **統一修正**
   - 所有模組的最外層容器都採用相同的對齊規則
   - 保持與歡迎卡片的視覺一致性

3. **測試驗證**
   - 在不同螢幕尺寸下檢查對齊效果
   - 確保左右邊距與歡迎卡片完全對齊

### 📋 檢查清單

- [ ] 模組容器設定 `max-width: 1200px`
- [ ] 使用 `margin: 0 auto` 置中
- [ ] 左右內邊距設定為 `24px`
- [ ] 響應式斷點正確實施
- [ ] 與歡迎卡片對齊驗證通過

### 🎪 為什麼這很重要？

1. **視覺一致性** - 所有模組看起來像同一個系統
2. **閱讀體驗** - 內容對齊提升可讀性
3. **專業感** - 精確對齊展現品質
4. **維護性** - 統一標準便於維護

---

## 🎨 色彩系統規範

### 主色調配色
```css
:root {
    --primary: #c9a961;           /* 金棕色 - 主要按鈕 */
    --primary-light: #e4d4a8;     /* 淺金色 - 懸停效果 */
    --primary-dark: #8b7355;      /* 深棕色 - 按下效果 */
}
```

### 背景色系
```css
:root {
    --bg: #f4f1eb;               /* 米白色 - 頁面背景 */
    --card: rgba(255,255,255,0.85); /* 半透明白 - 卡片背景 */
    --border: rgba(201,169,97,0.2);  /* 透明金棕 - 邊框 */
}
```

### 文字色系
```css
:root {
    --text: #3a3833;             /* 墨色 - 主要文字 */
    --text-light: #6d685f;       /* 淺墨色 - 次要文字 */
    --text-muted: #9b9588;       /* 極淺色 - 輔助文字 */
}
```

---

## 📦 標準模組模板

```javascript
class ModuleTemplate {
    static moduleInfo = {
        name: '模組名稱',
        subtitle: '模組副標題',
        version: '1.0.0',
        author: 'william'
    };

    getHTML() {
        return `
            <div class="module-container">
                <!-- 標題區域 -->
                <div class="module-header">
                    <h2>模組標題</h2>
                    <p>模組描述</p>
                </div>
                
                <!-- 主要內容 -->
                <div class="module-content">
                    <!-- 模組內容 -->
                </div>
            </div>
            
            <style>
                .module-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 24px;
                    box-sizing: border-box;
                }
                
                @media (max-width: 1023px) {
                    .module-container {
                        padding: 20px;
                    }
                }
                
                @media (max-width: 767px) {
                    .module-container {
                        padding: 16px;
                    }
                }
            </style>
        `;
    }
}
```

---

**版本：** v1.0  
**最後更新：** 2025年9月2日  
**維護者：** william