// 環境檢查工具
console.log('🔍 檢查 GAME-T 環境...')

// 檢查 API 檔案
const apiFiles = [
  'ProjectAPI.ts',
  'TimeboxAPI.ts',
  'FinanceAPI.ts'
]

const fs = require('fs')
const path = require('path')

apiFiles.forEach(file => {
  const filePath = path.join(__dirname, 'api', file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} 存在`)
  } else {
    console.log(`❌ ${file} 不存在`)
  }
})

// 檢查類型定義
const typesPath = path.join(__dirname, 'types.ts')
if (fs.existsSync(typesPath)) {
  const content = fs.readFileSync(typesPath, 'utf8')
  const types = ['TimeboxEntry', 'TimeboxActivity', 'Project', 'FinanceRecord']
  
  types.forEach(type => {
    if (content.includes(`interface ${type}`)) {
      console.log(`✅ 類型 ${type} 已定義`)
    } else {
      console.log(`❌ 類型 ${type} 未定義`)
    }
  })
} else {
  console.log('❌ types.ts 不存在')
}

// 檢查基礎檔案
const baseFiles = [
  'base-api.ts',
  'api-factory.ts',
  'migrate.ts',
  'page-integration-template.tsx'
]

baseFiles.forEach(file => {
  const filePath = path.join(__dirname, file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} 存在`)
  } else {
    console.log(`❌ ${file} 不存在`)
  }
})

console.log('檢查完成！')