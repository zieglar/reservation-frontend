import { GRAPHQL_ENDPOINT } from '../config/environment'
import type { Reservation, ReservationStatus } from './getReservations'

interface UpdateReservationInfoInput {
	id: string
	status?: ReservationStatus
	name: string
	phone: string
	numberOfPeople: number
	date: string
}

export default async function updateReservationInfo(
	data: UpdateReservationInfoInput
): Promise<Reservation> {
	const mutation = `
    mutation UpdateReservationInfo($data: UpdateReservationInfoInput!) {
      updateReservationInfo(data: $data) {
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
  `

	const authData = localStorage.getItem('auth_info')
	if (!authData) {
		throw new Error('未登录，请先登录')
	}

	const { accessToken } = JSON.parse(authData) as { accessToken: string }

	try {
		const response = await fetch(GRAPHQL_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				Authorization: `Bearer ${accessToken}`
			},
			body: JSON.stringify({
				query: mutation,
				variables: { data }
			})
		})

		if (!response.ok) {
			throw new Error('更新预订信息失败')
		}

		const result = await response.json()

		if (result.errors) {
			throw new Error(result.errors[0]?.message || '更新预订信息失败')
		}

		return result.data.updateReservationStatus
	} catch (error) {
		console.error('Error updating reservation status:', error)
		throw error
	}
}
