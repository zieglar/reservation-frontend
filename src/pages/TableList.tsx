import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReactElement } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import addTable from '../api/addTable'
import getTables from '../api/getTables'
import updateTable from '../api/updateTable'

const MIN_SEATS = 2
const MAX_SEATS = 20

interface EditModalProperties {
	table?: { id: string; seats: number }
	onClose: () => void
	onSave: (seats: number) => Promise<void>
	seatsArray: number[]
	isAdd?: boolean
}

function EditModal({
	table,
	onClose,
	onSave,
	seatsArray,
	isAdd = false
}: EditModalProperties): ReactElement {
	const [seats, setSeats] = useState(table?.seats ?? 0)
	const [isSaving, setIsSaving] = useState(false)
	const [error, setError] = useState<string>('')

	const availableSeats = useMemo(() => {
		if (!seatsArray) return []
		if (!isAdd && table) {
			const newArray = seatsArray.filter(seats => seats >= table.seats)
			setSeats(newArray[0])
			return newArray
		}
		return seatsArray
	}, [seatsArray, isAdd, table])

	useEffect(() => {
		if (isAdd && availableSeats.length > 0) {
			setSeats(availableSeats[0])
		}
	}, [isAdd, availableSeats])

	const handleSubmit = async (event_: React.FormEvent): Promise<void> => {
		event_.preventDefault()
		setError('')
		setIsSaving(true)
		try {
			if (!isAdd && table && seats < table.seats) {
				setError('不能将座位数修改为小于当前座位数')
				return
			}
			await onSave(seats)
			onClose()
		} catch (error_) {
			setError(error_ instanceof Error ? error_.message : '保存失败')
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<div className='fixed inset-0 z-10 overflow-y-auto'>
			<div className='flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0'>
				<div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
				<div className='inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle'>
					<form onSubmit={handleSubmit}>
						<div>
							<label
								htmlFor='seats'
								className='block text-sm font-medium text-gray-700'
							>
								座位数
							</label>
							<select
								id='seats'
								required
								className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
								value={seats}
								onChange={(event_: React.ChangeEvent<HTMLSelectElement>) => {
									const value = Number(event_.target.value)
									setSeats(value)
								}}
							>
								{availableSeats.map(number_ => (
									<option key={number_} value={number_}>
										{number_}人桌
									</option>
								))}
							</select>
						</div>

						{error ? (
							<div className='mt-2 text-sm text-red-500'>{error}</div>
						) : undefined}

						<div className='mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3'>
							<button
								type='submit'
								disabled={isSaving}
								className='inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm'
							>
								{isSaving ? '保存中...' : isAdd ? '新增' : '保存'}
							</button>
							<button
								type='button'
								onClick={onClose}
								className='mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm'
							>
								取消
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default function TableList(): ReactElement {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const [editingTable, setEditingTable] = useState<
		{ id: string; seats: number } | undefined
	>()
	const [isAdding, setIsAdding] = useState(false)

	const { data, isLoading, error } = useQuery({
		queryKey: ['tables'],
		queryFn: getTables
	})

	const TOTAL_SEATS = MAX_SEATS - MIN_SEATS + 1
	let seatsArray = Array.from(
		{ length: TOTAL_SEATS },
		(_, index) => index + MIN_SEATS
	)
	const existingSeats = data?.tables.map(table => table.seats) ?? []
	seatsArray = seatsArray.filter(seats => !existingSeats.includes(seats))
	seatsArray.sort((a, b) => a - b)

	const handleSave = async (seats: number): Promise<void> => {
		if (isAdding) {
			await addTable({ seats })
		} else if (editingTable) {
			await updateTable({
				id: editingTable.id,
				data: { seats }
			})
		}
		await queryClient.invalidateQueries({ queryKey: ['tables'] })
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
			error instanceof Error ? error.message : '获取餐桌信息失败'
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
					<h1 className='text-2xl font-bold text-black'>餐桌列表</h1>
					<div className='flex gap-4'>
						<button
							type='button'
							className='rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700'
							onClick={() => setIsAdding(true)}
						>
							新增餐桌
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

				<div className='overflow-x-auto rounded-lg bg-white shadow'>
					<table className='min-w-full divide-y divide-gray-200'>
						<thead className='bg-gray-50'>
							<tr>
								<th
									scope='col'
									className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
								>
									座位数
								</th>
								<th
									scope='col'
									className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
								>
									操作
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-200 bg-white'>
							{data?.tables.map(table => (
								<tr key={table.id}>
									<td className='whitespace-nowrap px-6 py-4'>
										<div className='text-sm text-gray-900'>{table.seats}人</div>
									</td>
									<td className='whitespace-nowrap px-6 py-4 text-right text-sm font-medium'>
										<button
											type='button'
											onClick={() => setEditingTable(table)}
											className='text-indigo-600 hover:text-indigo-900'
										>
											修改
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{editingTable || isAdding ? (
					<EditModal
						table={editingTable}
						onClose={() => {
							setEditingTable(undefined)
							setIsAdding(false)
						}}
						onSave={handleSave}
						seatsArray={seatsArray}
						isAdd={isAdding}
					/>
				) : undefined}
			</div>
		</div>
	)
}
