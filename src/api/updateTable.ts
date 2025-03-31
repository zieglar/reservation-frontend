import { GRAPHQL_ENDPOINT } from '../config/environment'
import type { TableInfoInput } from './addTable'
import type { Table } from './getTables'

interface UpdateTableResponse {
	updateTableInfo: Table
}

interface GraphQLResponse {
	data: UpdateTableResponse
	errors?: { message: string }[]
}

interface AuthInfo {
	accessToken: string
	// ... 其他字段
}

interface UpdateTableInput {
	id: string
	data: TableInfoInput
}

export default async function updateTable(
	input: UpdateTableInput
): Promise<Table> {
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
          mutation UpdateTableInfo($id: String!, $data: TableInfoInput!) {
            updateTableInfo(id: $id, data: $data) {
              id
              seats
            }
          }
        `,
				variables: {
					id: input.id,
					data: input.data
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

		return result.data.updateTableInfo
	} catch (error) {
		if (error instanceof Error) {
			throw error
		}
		throw new Error('修改餐桌失败')
	}
}
