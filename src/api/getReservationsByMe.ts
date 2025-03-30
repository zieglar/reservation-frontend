import { GRAPHQL_ENDPOINT } from '../config/environment'

export enum ReservationStatus {
	Requested = 1,
	Approved = 2,
	Cancelled = 3,
	Completed = 4
}

interface Contact {
	name: string
	phone: string
}

interface Table {
	seats: number
}

export interface Reservation {
	id: string
	createdAt: string
	updatedAt: string
	contactId: string
	tableId: string
	date: string
	numberOfPeople: number
	status: ReservationStatus
	contact: Contact
	table: Table
}

interface ReservationsResponse {
	reservationsByCurrentUser: Reservation[]
}

interface ReservationsQueryParameters {
	page?: number
	limit?: number
	keyword?: string
	date?: string
	status?: number
	seats?: number
}

interface GraphQLResponse {
	data: ReservationsResponse
	errors?: { message: string }[]
}

interface AuthInfo {
	accessToken: string
	// ... 其他字段
}

export default async function getReservationsByMe(
	parameters: ReservationsQueryParameters = {}
): Promise<ReservationsResponse> {
	const query = `
    query ReservationsByCurrentUser(
      $page: Int
      $limit: Int
      $keyword: String
      $date: String
      $status: Int
      $seats: Int
    ) {
      reservationsByCurrentUser(
        page: $page
        limit: $limit
        keyword: $keyword
        date: $date
        status: $status
        seats: $seats
      ) {
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
				query,
				variables: {
					page: parameters.page,
					limit: parameters.limit,
					keyword: parameters.keyword,
					date: parameters.date,
					status: parameters.status,
					seats: parameters.seats
				}
			})
		})

		if (!response.ok) {
			throw new Error('获取预订信息失败')
		}

		const result = (await response.json()) as GraphQLResponse

		if (result.errors) {
			throw new Error(result.errors[0]?.message || '获取预订信息失败')
		}

		return result.data.reservationsByCurrentUser
	} catch (error) {
		console.error('Error fetching reservations:', error)
		throw error
	}
}
