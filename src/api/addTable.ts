import { GRAPHQL_ENDPOINT } from '../config/environment'
import type { Table } from './getTables'

export interface TableInfoInput {
	seats: number
}

interface AddTableResponse {
	addTableInfo: Table
}

interface GraphQLResponse {
	data: AddTableResponse
	errors?: { message: string }[]
}

interface AuthInfo {
	accessToken: string
	// ... 其他字段
}

export default async function addTable(data: TableInfoInput): Promise<Table> {
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
          mutation AddTableInfo($data: TableInfoInput!) {
            addTableInfo(data: $data) {
              id
              seats
            }
          }
        `,
				variables: {
					data
				}
			})
		})

		if (!response.ok) {
			throw new Error('网络请求失败')
		}

		const result = (await response.json()) as GraphQLResponse

		if (result.errors?.length) {
			throw new Error(result.errors[0].message)
		}

		return result.data.addTableInfo
	} catch (error) {
		if (error instanceof Error) {
			throw error
		}
		throw new Error('添加餐桌失败')
	}
}
