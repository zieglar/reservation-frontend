import { useQuery } from '@tanstack/react-query'
import type { ReactElement } from 'react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import addReservation from '../api/addReservation'
import getTables from '../api/getTables'

interface ReservationData {
	name: string
	phone: string
	numberOfPeople: number
	date: string
}

interface ConfirmModalProperties {
	data: ReservationData
	onConfirm: () => void
	onCancel: () => void
}

function ConfirmModal({
	data,
	onConfirm,
	onCancel
}: ConfirmModalProperties): ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleConfirm = async (): Promise<void> => {
		setIsSubmitting(true)
		try {
			await onConfirm()
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className='fixed inset-0 flex items-center justify-center bg-black/50'>
			<div className='w-96 rounded-lg bg-white p-6'>
				<h3 className='mb-4 text-xl font-bold text-black'>请确认预订信息</h3>
				<div className='space-y-3'>
					<div className='flex justify-between'>
						<span className='text-gray-600'>联系人：</span>
						<span className='font-medium text-black'>{data.name}</span>
					</div>
					<div className='flex justify-between'>
						<span className='text-gray-600'>联系电话：</span>
						<span className='font-medium text-black'>{data.phone}</span>
					</div>
					<div className='flex justify-between'>
						<span className='text-gray-600'>就餐人数：</span>
						<span className='font-medium text-black'>
							{data.numberOfPeople}人
						</span>
					</div>
					<div className='flex justify-between'>
						<span className='text-gray-600'>预约日期：</span>
						<span className='font-medium text-black'>{data.date}</span>
					</div>
				</div>
				<div className='mt-6 flex justify-end space-x-4'>
					<button
						type='button'
						onClick={onCancel}
						disabled={isSubmitting}
						className='px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50'
					>
						返回修改
					</button>
					<button
						type='button'
						onClick={handleConfirm}
						disabled={isSubmitting}
						className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50'
					>
						{isSubmitting ? '提交中...' : '确认预订'}
					</button>
				</div>
			</div>
		</div>
	)
}

export default function TableReservation(): ReactElement {
	const navigate = useNavigate()
	const [showConfirm, setShowConfirm] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// 添加获取餐桌数据的查询
	const { data: tablesData } = useQuery({
		queryKey: ['tables'],
		queryFn: getTables
	})

	// 从餐桌数据中获取最大座位数
	const maxSeats = useMemo(() => {
		if (!tablesData?.tables) return 0
		return Math.max(...tablesData.tables.map(table => table.seats))
	}, [tablesData])

	// 获取明天的日期作为最小可选日期
	const tomorrow = new Date()
	tomorrow.setDate(tomorrow.getDate() + 1)
	const minDate = tomorrow.toISOString().split('T')[0]

	const [formData, setFormData] = useState<ReservationData>({
		name: '',
		phone: '',
		numberOfPeople: 2,
		date: minDate
	})

	const onSubmit = (event: React.FormEvent): void => {
		event.preventDefault()
		setShowConfirm(true)
	}

	const onConfirm = async (): Promise<void> => {
		try {
			setIsSubmitting(true)
			await addReservation({
				name: formData.name,
				phone: formData.phone,
				numberOfPeople: formData.numberOfPeople,
				date: formData.date
			})
			alert('预订成功！')
			navigate('/')
		} catch (error) {
			alert(error instanceof Error ? error.message : '预订失败，请稍后重试')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className='min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
			<div className='mx-auto max-w-md'>
				<h2 className='mb-8 text-center text-3xl font-bold text-black'>
					预订餐桌
				</h2>
				<form
					onSubmit={onSubmit}
					className='mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md'
				>
					<div className='mb-4'>
						<label
							className='mb-2 block text-sm font-bold text-gray-700'
							htmlFor='name'
						>
							联系人姓名
						</label>
						<input
							id='name'
							type='text'
							required
							className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
							value={formData.name}
							onChange={event =>
								setFormData({ ...formData, name: event.target.value })
							}
						/>
					</div>

					<div className='mb-4'>
						<label
							className='mb-2 block text-sm font-bold text-gray-700'
							htmlFor='phone'
						>
							联系电话
						</label>
						<input
							id='phone'
							type='tel'
							required
							pattern='^1[3-9]\d{9}$'
							className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
							value={formData.phone}
							onChange={event =>
								setFormData({ ...formData, phone: event.target.value })
							}
						/>
					</div>

					<div className='mb-4'>
						<label
							className='mb-2 block text-sm font-bold text-gray-700'
							htmlFor='numberOfPeople'
						>
							就餐人数
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
							{Array.from(
								{ length: maxSeats - 1 },
								(_, index) => index + 2
							).map(number_ => (
								<option key={number_} value={number_}>
									{number_}人
								</option>
							))}
						</select>
					</div>

					<div className='mb-6'>
						<label
							className='mb-2 block text-sm font-bold text-gray-700'
							htmlFor='date'
						>
							预约日期
						</label>
						<input
							id='date'
							type='date'
							required
							min={minDate}
							className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
							value={formData.date}
							onChange={event =>
								setFormData({ ...formData, date: event.target.value })
							}
						/>
					</div>

					<div className='flex items-center justify-between'>
						<button
							type='button'
							onClick={() => navigate('/')}
							className='text-gray-600 hover:text-gray-800'
						>
							返回
						</button>
						<button
							type='submit'
							className='focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none'
						>
							提交预订
						</button>
					</div>
				</form>
			</div>

			{showConfirm ? (
				<ConfirmModal
					data={formData}
					onConfirm={onConfirm}
					onCancel={() => setShowConfirm(false)}
				/>
			) : null}
		</div>
	)
}
