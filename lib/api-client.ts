// Безопасный API клиент с обработкой ошибок

interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API Error ${response.status}:`, errorText)
        
        return {
          success: false,
          error: `Ошибка ${response.status}: ${response.statusText}`
        }
      }

      const data = await response.json()
      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('API Response Error:', error)
      return {
        success: false,
        error: 'Ошибка обработки ответа сервера'
      }
    }
  }

  async get<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('API GET Error:', error)
      return {
        success: false,
        error: 'Ошибка сетевого запроса'
      }
    }
  }

  async post<T>(url: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('API POST Error:', error)
      return {
        success: false,
        error: 'Ошибка сетевого запроса'
      }
    }
  }

  async put<T>(url: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('API PUT Error:', error)
      return {
        success: false,
        error: 'Ошибка сетевого запроса'
      }
    }
  }

  async patch<T>(url: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('API PATCH Error:', error)
      return {
        success: false,
        error: 'Ошибка сетевого запроса'
      }
    }
  }

  async delete<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('API DELETE Error:', error)
      return {
        success: false,
        error: 'Ошибка сетевого запроса'
      }
    }
  }
}

// Экспортируем экземпляр клиента
export const apiClient = new ApiClient()

// Утилиты для работы с API
export function isApiError(response: ApiResponse<any>): response is { success: false; error: string } {
  return !response.success
}

export function getApiData<T>(response: ApiResponse<T>): T | null {
  return response.success ? response.data || null : null
}

export function getApiError(response: ApiResponse<any>): string | null {
  return isApiError(response) ? response.error : null
}