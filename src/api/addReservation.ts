import { GRAPHQL_ENDPOINT } from '../config/environment'

interface Contact {
	name: string
	phone: string
}

interface Table {
	seats: number
}

interface ReservationResponse {
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

interface AddReservationInfoInput {
	name: string
	phone: string
	numberOfPeople: number
	date: string
}

export default async function addReservation(
	data: AddReservationInfoInput
): Promise<ReservationResponse> {
	const mutation = `
    mutation AddReservationInfo($data: AddReservationInfoInput!) {
      addReservationInfo(data: $data) {
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

	const { accessToken } = JSON.parse(authData) as AuthInfo

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
			throw new Error('预订失败，请稍后重试')
		}

		const result = await response.json()

		if (result.errors) {
			throw new Error(result.errors[0].message || '预订失败，请稍后重试')
		}

		return result.data.addReservationInfo
	} catch (error) {
		console.error('Error adding reservation:', error)
		throw error
	}
}
