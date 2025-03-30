import { useMutation, useQuery } from '@tanstack/react-query'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import getReservationInfo from '../api/getReservationInfo'
import updateReservationInfo from '../api/updateReservationInfo'

interface FormData {
	name: string
	phone: string
	date: string
	numberOfPeople: number
}

export default function ReservationEditPage(): ReactElement {
	const navigate = useNavigate()
	const { id } = useParams<{ id: string }>()
	const [formData, setFormData] = useState<FormData>({
		name: '',
		phone: '',
		date: '',
		numberOfPeople: 2
	})
	const [error, setError] = useState<string>('')

	const { data: reservation, isLoading } = useQuery({
		queryKey: ['reservation', id],
		queryFn: async () => getReservationInfo(id!),
		enabled: !!id
	})

	const updateMutation = useMutation({
		mutationFn: updateReservationInfo,
		onSuccess: () => {
			navigate('/reservations')
		},
		onError: (error_: Error) => {
			setError(error_.message)
		}
	})

	useEffect(() => {
		if (reservation) {
			setFormData({
				name: reservation.contact.name,
				phone: reservation.contact.phone,
				date: reservation.date,
				numberOfPeople: reservation.numberOfPeople
			})
		}
	}, [reservation])

	const handleSubmit = (event_: React.FormEvent): void => {
		event_.preventDefault()
		if (!id) return
		setError('')
		updateMutation.mutate({
			id,
			...formData
		})
	}

	const handleChange = (
		event_: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	): void => {
		const { name, value } = event_.target
		setFormData(previous => ({
			...previous,
			[name]: name === 'numberOfPeople' ? Number(value) : value
		}))
	}

	if (isLoading) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='text-xl'>加载中...</div>
			</div>
		)
	}

	if (!reservation) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='text-xl text-red-500'>未找到预订信息</div>
			</div>
		)
	}

	return (
		<div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
			<div className='w-full max-w-md space-y-8'>
				<div>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
						修改预订信息
					</h2>
				</div>
				<form className='mt-8 space-y-6' onSubmit={handleSubmit}>
					<div className='-space-y-px rounded-md shadow-sm'>
						<div className='space-y-4 rounded-t-md border bg-white p-4'>
							<div>
								<label
									htmlFor='name'
									className='block text-sm font-medium text-gray-700'
								>
									预订人
								</label>
								<input
									id='name'
									name='name'
									type='text'
									required
									className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
									value={formData.name}
									onChange={handleChange}
								/>
							</div>
							<div>
								<label
									htmlFor='phone'
									className='block text-sm font-medium text-gray-700'
								>
									联系电话
								</label>
								<input
									id='phone'
									name='phone'
									type='tel'
									required
									className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
									value={formData.phone}
									onChange={handleChange}
								/>
							</div>
							<div>
								<label
									htmlFor='date'
									className='block text-sm font-medium text-gray-700'
								>
									预订日期
								</label>
								<input
									id='date'
									name='date'
									type='date'
									required
									className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
									value={formData.date}
									onChange={handleChange}
								/>
							</div>
							<div>
								<label
									htmlFor='numberOfPeople'
									className='block text-sm font-medium text-gray-700'
								>
									用餐人数
								</label>
								<select
									id='numberOfPeople'
									required
									className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
									value={formData.numberOfPeople}
									onChange={event =>
										setFormData({
											...formData,
											numberOfPeople: Number(event.target.value)
										})
									}
								>
									{Array.from({ length: 9 }, (_, index) => index + 2).map(
										number_ => (
											<option key={number_} value={number_}>
												{number_}人
											</option>
										)
									)}
								</select>
							</div>
						</div>
					</div>

					{error ? (
						<div className='text-center text-sm text-red-500'>{error}</div>
					) : undefined}

					<div className='flex space-x-4'>
						<button
							type='submit'
							disabled={updateMutation.isPending}
							className='group relative flex w-full flex-1 justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
						>
							{updateMutation.isPending ? '保存中...' : '保存'}
						</button>
						<button
							type='button'
							onClick={() => navigate('/reservations')}
							className='group relative flex w-full flex-1 justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
						>
							返回
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
