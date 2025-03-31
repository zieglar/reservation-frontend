import { GRAPHQL_ENDPOINT } from '../config/environment'

export interface Table {
	id: string
	seats: number
}

interface TablesResponse {
	tables: Table[]
}

interface GraphQLResponse {
	data: TablesResponse
	errors?: { message: string }[]
}

interface AuthInfo {
	accessToken: string
	// ... 其他字段
}

export default async function getTables(): Promise<TablesResponse> {
	try {
		const authData = localStorage.getItem('auth_info')
		if (!authData) {
			throw new Error('未登录，请先登录')
		}

		const { accessToken } = JSON.parse(authData) as AuthInfo
		if (!accessToken) {
			throw new Error('未登录，请先登录')
		}

		const response = await fetch(GRAPHQL_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			},
			body: JSON.stringify({
				query: `
          query tables {
            tables {
              id
              seats
            }
          }
        `
			})
		})

		if (!response.ok) {
			throw new Error('网络请求失败')
		}

		const result = (await response.json()) as GraphQLResponse

		if (result.errors?.length) {
			throw new Error(result.errors[0].message)
		}

		return result.data
	} catch (error) {
		if (error instanceof Error) {
			throw error
		}
		throw new Error('获取餐桌信息失败')
	}
}
