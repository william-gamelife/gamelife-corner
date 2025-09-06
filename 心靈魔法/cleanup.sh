#!/bin/bash
# 心靈魔法資料夾清理腳本
# 執行前請先確認備份

echo "=== 心靈魔法資料夾整理 ==="
echo "開始整理..."

# 建立備份資料夾
mkdir -p backup_old_files

# 移動要刪除的檔案到備份資料夾
echo "移動舊檔案到備份資料夾..."

# Volume系列檔案
mv aphrodite_volume_part*.md backup_old_files/ 2>/dev/null
mv hercules_volume_complete.md backup_old_files/ 2>/dev/null
mv horus_volume.md backup_old_files/ 2>/dev/null
mv isis_volume.md backup_old_files/ 2>/dev/null
mv loki_volume.md backup_old_files/ 2>/dev/null
mv odin_volume_complete.md backup_old_files/ 2>/dev/null
mv prometheus_volume_complete.md backup_old_files/ 2>/dev/null
mv zeus_volume.md backup_old_files/ 2>/dev/null

# Spirits批次檔案
mv spirits_batch_*.md backup_old_files/ 2>/dev/null

# Heroic spirits檔案
mv heroic_spirits_*.md backup_old_files/ 2>/dev/null

# 臨時檔案
mv ＦＩＮＡ２.txt backup_old_files/ 2>/dev/null

# 優化方案檔案（已讀取完成）
mv 1320組合優化方案.md backup_old_files/ 2>/dev/null
mv 1320獨特英靈生成系統.md backup_old_files/ 2>/dev/null

echo "✅ 檔案整理完成！"
echo ""
echo "=== 保留的檔案 ==="
echo "📊 master_database.json - 主資料庫"
echo "📝 測驗系統完整規格.md - 系統文件"
echo "📑 資料庫整理方案.md - 整理說明"
echo "📁 ＦＩＮＡＬ.xlsx - 原始框架(備份)"
echo "📁 combinations_1320_complete.xlsx - 組合表(備份)"
echo ""
echo "=== 備份資料夾 ==="
echo "📁 backup_old_files/ - 包含所有移除的檔案"
echo ""
echo "如果確定不需要舊檔案，可以執行："
echo "rm -rf backup_old_files/"