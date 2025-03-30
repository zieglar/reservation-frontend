import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import getReservations, { ReservationStatus } from '../api/getReservations'
import getReservationsByMe from '../api/getReservationsByMe'
import updateReservationInfo from '../api/updateReservationInfo'
import type { AuthInfo } from './Default'

const STALE_TIME = 1000 // 1 seconds
const STATUS_MAP: Record<ReservationStatus, string> = {
	[ReservationStatus.Requested]: '待确认',
	[ReservationStatus.Approved]: '已确认',
	[ReservationStatus.Cancelled]: '已取消',
	[ReservationStatus.Completed]: '已完成'
}

interface FilterParameters {
	status?: number
	seats?: number
	date?: string
	keyword?: string
}

// 添加常量避免魔术数字
const SEATS_OPTIONS = [2, 4, 6, 8, 10] as const

export default function ReservationList(): ReactElement {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const [filters, setFilters] = useState<FilterParameters>({})
	const [authInfo, setAuthInfo] = useState<AuthInfo | undefined>()

	useEffect(() => {
		const authData = localStorage.getItem('auth_info')
		if (authData) {
			try {
				setAuthInfo(JSON.parse(authData) as AuthInfo)
			} catch (error) {
				console.error('Error parsing auth data:', error)
			}
		}
	}, [])

	const { data, isLoading, error } = useQuery({
		queryKey: ['reservations', filters, authInfo?.role],
		queryFn: async () => {
			if (authInfo?.role === 'user') {
				return getReservationsByMe(filters)
			}
			return getReservations(filters)
		},
		staleTime: STALE_TIME
	})

	const handleStatusUpdate = async (
		id: string,
		status: ReservationStatus
	): Promise<void> => {
		try {
			await updateReservationInfo({ id, status })
			await queryClient.invalidateQueries({ queryKey: ['reservations'] })
		} catch (error_) {
			alert(error_ instanceof Error ? error_.message : '更新状态失败')
		}
	}

	const handleFilterChange = (
		name: keyof FilterParameters,
		value: string
	): void => {
		setFilters(previous => {
			const updatedFilters = { ...previous }
			if (!value) {
				delete updatedFilters[name]
			} else if (name === 'status' || name === 'seats') {
				updatedFilters[name] = Number(value)
			} else {
				updatedFilters[name] = value
			}
			return updatedFilters
		})
	}

	const handleClearFilters = (): void => {
		setFilters({})
	}

	const handleReservationUpdate = (id: string): void => {
		navigate(`/reservations/${id}/edit`)
	}

	if (isLoading) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='text-lg'>加载中...</div>
			</div>
		)
	}

	if (error) {
		const errorMessage =
			error instanceof Error ? error.message : '获取预订信息失败'
		if (errorMessage === '未登录，请先登录') {
			navigate('/staff-login')
			return <div />
		}
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='text-lg text-red-500'>{errorMessage}</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gray-50 px-4 py-8'>
			<div className='mx-auto max-w-6xl'>
				<div className='mb-6 flex items-center justify-between'>
					<h1 className='text-2xl font-bold text-black'>预订信息列表</h1>
					<div className='flex gap-2'>
						<button
							type='button'
							onClick={handleClearFilters}
							className='rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
						>
							清除搜索
						</button>
						<button
							type='button'
							className='rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600'
							onClick={() => navigate('/')}
						>
							返回首页
						</button>
					</div>
				</div>

				{/* 搜索过滤区域 */}
				<div className='mb-6 grid grid-cols-1 gap-4 rounded-lg bg-white p-4 shadow sm:grid-cols-2 md:grid-cols-4'>
					<div>
						<label
							htmlFor='status'
							className='mb-1 block text-sm font-medium text-gray-700'
						>
							预订状态
						</label>
						<select
							id='status'
							className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black'
							value={filters.status ?? ''}
							onChange={event_ =>
								handleFilterChange('status', event_.target.value)
							}
						>
							<option value=''>全部状态</option>
							{Object.entries(STATUS_MAP).map(([status, label]) => (
								<option key={status} value={status}>
									{label}
								</option>
							))}
						</select>
					</div>

					<div>
						<label
							htmlFor='seats'
							className='mb-1 block text-sm font-medium text-gray-700'
						>
							餐桌人数
						</label>
						<select
							id='seats'
							className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black'
							value={filters.seats ?? ''}
							onChange={event_ =>
								handleFilterChange('seats', event_.target.value)
							}
						>
							<option value=''>全部人数</option>
							{SEATS_OPTIONS.map(number_ => (
								<option key={number_} value={number_}>
									{number_}人桌
								</option>
							))}
						</select>
					</div>

					<div>
						<label
							htmlFor='date'
							className='mb-1 block text-sm font-medium text-gray-700'
						>
							预订日期
						</label>
						<input
							id='date'
							type='date'
							className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black'
							value={filters.date ?? ''}
							onChange={event_ =>
								handleFilterChange('date', event_.target.value)
							}
						/>
					</div>

					<div>
						<label
							htmlFor='keyword'
							className='mb-1 block text-sm font-medium text-gray-700'
						>
							关键词搜索
						</label>
						<input
							id='keyword'
							type='text'
							placeholder='搜索姓名或电话'
							className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black'
							value={filters.keyword ?? ''}
							onChange={event_ =>
								handleFilterChange('keyword', event_.target.value)
							}
						/>
					</div>
				</div>

				<div className='overflow-x-auto rounded-lg bg-white shadow'>
					<table className='min-w-full divide-y divide-gray-200'>
						<thead className='bg-gray-50'>
							<tr>
								<th
									scope='col'
									className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
								>
									预订人
								</th>
								<th
									scope='col'
									className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
								>
									联系电话
								</th>
								<th
									scope='col'
									className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
								>
									就餐人数
								</th>
								<th
									scope='col'
									className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
								>
									预订日期
								</th>
								<th
									scope='col'
									className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
								>
									状态
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-200 bg-white'>
							{data?.map(reservation => (
								<tr key={reservation.id}>
									<td className='whitespace-nowrap px-6 py-4'>
										<div className='text-sm text-gray-900'>
											{reservation.contact.name}
										</div>
									</td>
									<td className='whitespace-nowrap px-6 py-4'>
										<div className='text-sm text-gray-900'>
											{reservation.contact.phone}
										</div>
									</td>
									<td className='whitespace-nowrap px-6 py-4'>
										<div className='text-sm text-gray-900'>
											{reservation.numberOfPeople}人(餐桌人数：
											{reservation.table.seats}人)
										</div>
									</td>
									<td className='whitespace-nowrap px-6 py-4'>
										<div className='text-sm text-gray-900'>
											{new Date(reservation.date).toLocaleDateString('zh-CN')}
										</div>
									</td>
									<td className='whitespace-nowrap px-6 py-4'>
										<div className='flex items-center gap-2'>
											<span
												className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusStyle(
													reservation.status
												)}`}
											>
												{STATUS_MAP[reservation.status]}
											</span>
											{reservation.status === ReservationStatus.Requested &&
												authInfo?.role === 'user' && (
													<>
														<button
															type='button'
															onClick={async () =>
																handleReservationUpdate(reservation.id)
															}
															className='rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600'
														>
															修改预订信息
														</button>
														<button
															type='button'
															onClick={async () =>
																handleStatusUpdate(
																	reservation.id,
																	ReservationStatus.Cancelled
																)
															}
															className='rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600'
														>
															取消预订
														</button>
													</>
												)}
											{reservation.status === ReservationStatus.Requested &&
												authInfo?.role === 'staff' && (
													<>
														<button
															type='button'
															onClick={async () =>
																handleStatusUpdate(
																	reservation.id,
																	ReservationStatus.Approved
																)
															}
															className='rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600'
														>
															确认
														</button>
														<button
															type='button'
															onClick={async () =>
																handleStatusUpdate(
																	reservation.id,
																	ReservationStatus.Cancelled
																)
															}
															className='rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600'
														>
															取消
														</button>
													</>
												)}
											{reservation.status === ReservationStatus.Approved &&
												authInfo?.role === 'staff' && (
													<button
														type='button'
														onClick={async () =>
															handleStatusUpdate(
																reservation.id,
																ReservationStatus.Completed
															)
														}
														className='rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600'
													>
														完成
													</button>
												)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

function getStatusStyle(status: ReservationStatus): string {
	switch (status) {
		case ReservationStatus.Requested: {
			return 'bg-yellow-100 text-yellow-800'
		}
		case ReservationStatus.Approved: {
			return 'bg-green-100 text-green-800'
		}
		case ReservationStatus.Cancelled: {
			return 'bg-red-100 text-red-800'
		}
		case ReservationStatus.Completed: {
			return 'bg-gray-100 text-gray-800'
		}
		default: {
			return 'bg-gray-100 text-gray-800'
		}
	}
}
