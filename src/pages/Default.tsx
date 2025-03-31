import Head from 'components/Head'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export interface AuthInfo {
	id: string
	name: string
	accessToken: string
	role: string
}

export default function DefaultPage(): ReactElement {
	const navigate = useNavigate()
	const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null)

	useEffect(() => {
		const authData = localStorage.getItem('auth_info')
		if (authData) {
			try {
				setAuthInfo(JSON.parse(authData))
			} catch (error) {
				console.error('Error parsing auth data:', error)
			}
		}
	}, [])

	const handleLogout = (): void => {
		localStorage.removeItem('auth_info')
		setAuthInfo(null)
	}

	return (
		<>
			<Head title='餐厅预订系统' />
			<div className='flex min-h-screen items-center justify-center'>
				<div className='flex flex-col gap-4'>
					{authInfo ? (
						<>
							<div className='text-center'>
								<h2 className='mb-4 text-xl font-bold'>
									欢迎，{authInfo.name}
								</h2>
							</div>
							{authInfo.role === 'user' && (
								<button
									type='button'
									onClick={() => navigate('/reservation')}
									className='w-48 rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600'
								>
									预订餐桌
								</button>
							)}
							<button
								type='button'
								onClick={() => navigate('/reservations')}
								className='w-48 rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600'
							>
								查看预订信息
							</button>
							{authInfo.role === 'staff' && (
								<button
									type='button'
									onClick={() => navigate('/tables')}
									className='w-48 rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600'
								>
									查看餐桌信息
								</button>
							)}
							<button
								type='button'
								onClick={handleLogout}
								className='w-48 rounded-lg bg-red-500 px-6 py-2 text-white transition-colors hover:bg-red-600'
							>
								退出登录
							</button>
						</>
					) : (
						<>
							<div className='text-center'>
								<h2 className='mb-4 text-xl font-bold'>欢迎光临</h2>
							</div>
							<button
								type='button'
								onClick={() => navigate('/login')}
								className='w-48 rounded-lg bg-green-500 px-6 py-2 text-white transition-colors hover:bg-green-600'
							>
								账号登录
							</button>
						</>
					)}
				</div>
			</div>
		</>
	)
}
