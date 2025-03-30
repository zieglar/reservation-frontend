import type { AuthInfo } from 'pages/Default'
import { GRAPHQL_ENDPOINT } from '../config/environment'

interface Contact {
	name: string
	phone: string
}

interface Table {
	seats: number
}

interface ReservationInfo {
	id: string
	createdAt: string
	updatedAt: string
	contactId: string
	tableId: string
	date: string
	numberOfPeople: number
	status: string
	contact: Contact
	table: Table
}

interface ReservationInfoResponse {
	data: {
		reservationInfo: ReservationInfo
	}
}

export default async function getReservationInfo(
	id: string
): Promise<ReservationInfo> {
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
          query ReservationInfo($id: String!) {
            reservationInfo(id: $id) {
              id
              createdAt
              updatedAt
              contactId
              tableId
              date
              numberOfPeople
              status
              contact {
                name
                phone
              }
              table {
                seats
              }
            }
          }
        `,
				variables: {
					id
				}
			})
		})

		if (!response.ok) {
			throw new Error('网络请求失败')
		}

		const result = (await response.json()) as ReservationInfoResponse

		if (result.errors?.length) {
			throw new Error(result.errors[0].message)
		}

		return result.data.reservationInfo
	} catch (error) {
		if (error instanceof Error) {
			throw error
		}
		throw new Error('获取预订信息失败')
	}
}
