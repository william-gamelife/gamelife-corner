import { BaseAPI, ApiResponse } from '@/lib/base-api'
import { FinanceRecord, FinanceCategory } from '@/lib/types'

export class FinanceAPI {
  private static RECORDS_MODULE = 'finance_records'
  private static CATEGORIES_MODULE = 'finance_categories'
  
  // 財務記錄 CRUD
  static async getRecords(userId: string, startDate?: string, endDate?: string): Promise<FinanceRecord[]> {
    const allRecords = await BaseAPI.loadData<FinanceRecord>(this.RECORDS_MODULE, userId, [])
    
    if (startDate && endDate) {
      return allRecords.filter(record => 
        record.date >= startDate && record.date <= endDate
      )
    }
    return allRecords
  }
  
  static async createRecord(userId: string, data: Partial<FinanceRecord>): Promise<ApiResponse<FinanceRecord>> {
    return BaseAPI.create<FinanceRecord>(this.RECORDS_MODULE, userId, data)
  }
  
  static async updateRecord(userId: string, id: string, data: Partial<FinanceRecord>): Promise<ApiResponse<FinanceRecord>> {
    return BaseAPI.update<FinanceRecord>(this.RECORDS_MODULE, userId, id, data)
  }
  
  static async deleteRecord(userId: string, id: string): Promise<ApiResponse<void>> {
    return BaseAPI.delete(this.RECORDS_MODULE, userId, id)
  }
  
  // 分類 CRUD
  static async getCategories(userId: string): Promise<FinanceCategory[]> {
    return BaseAPI.loadData<FinanceCategory>(this.CATEGORIES_MODULE, userId, [])
  }
  
  static async createCategory(userId: string, data: Partial<FinanceCategory>): Promise<ApiResponse<FinanceCategory>> {
    return BaseAPI.create<FinanceCategory>(this.CATEGORIES_MODULE, userId, data)
  }
  
  static async updateCategory(userId: string, id: string, data: Partial<FinanceCategory>): Promise<ApiResponse<FinanceCategory>> {
    return BaseAPI.update<FinanceCategory>(this.CATEGORIES_MODULE, userId, id, data)
  }
  
  static async deleteCategory(userId: string, id: string): Promise<ApiResponse<void>> {
    return BaseAPI.delete(this.CATEGORIES_MODULE, userId, id)
  }
  
  // Finance 特有方法
  static calculateBalance(records: FinanceRecord[]): { income: number; expense: number; balance: number } {
    const income = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
    const expense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
    return { income, expense, balance: income - expense }
  }
}