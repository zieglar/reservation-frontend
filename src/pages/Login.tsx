import type { ReactElement } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import login from '../api/login'

interface LoginForm {
	username: string
	password: string
	verifyCode: string
}

export default function Login(): ReactElement {
	const navigate = useNavigate()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showVerifyCode, setShowVerifyCode] = useState(false)
	const [formData, setFormData] = useState<LoginForm>({
		username: '',
		password: '',
		verifyCode: ''
	})

	const handleSubmit = async (event: React.FormEvent): Promise<void> => {
		event.preventDefault()

		try {
			setIsSubmitting(true)
			await login({
				username: formData.username,
				password: formData.password,
				...(formData.verifyCode ? { verifyCode: formData.verifyCode } : {})
			})
			alert('登录成功！')
			navigate('/') // 或者导航到员工管理页面
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : '登录失败，请稍后重试'
			if (errorMessage.includes('验证码')) {
				setShowVerifyCode(true)
			}
			alert(errorMessage)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className='min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
			<div className='mx-auto max-w-md'>
				<div className='text-center'>
					<h2 className='mb-8 text-3xl font-bold text-black'>登录</h2>
				</div>
				<form
					onSubmit={handleSubmit}
					className='mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md'
				>
					<div className='mb-4'>
						<label
							className='mb-2 block text-sm font-bold text-gray-700'
							htmlFor='username'
						>
							用户名
						</label>
						<input
							id='username'
							type='text'
							required
							className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
							value={formData.username}
							onChange={event =>
								setFormData({ ...formData, username: event.target.value })
							}
						/>
					</div>

					<div className='mb-6'>
						<label
							className='mb-2 block text-sm font-bold text-gray-700'
							htmlFor='password'
						>
							密码
						</label>
						<input
							id='password'
							type='password'
							required
							className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
							value={formData.password}
							onChange={event =>
								setFormData({ ...formData, password: event.target.value })
							}
						/>
					</div>

					{showVerifyCode ? (
						<div className='mb-6'>
							<label
								className='mb-2 block text-sm font-bold text-gray-700'
								htmlFor='verifyCode'
							>
								验证码
							</label>
							<input
								id='verifyCode'
								type='text'
								required
								className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
								value={formData.verifyCode}
								onChange={event =>
									setFormData({ ...formData, verifyCode: event.target.value })
								}
							/>
							<p className='mt-2 text-sm text-gray-600'>
								请联系管理员获取验证码
							</p>
						</div>
					) : null}

					<div className='flex flex-col gap-4'>
						<button
							type='submit'
							disabled={isSubmitting}
							className='focus:shadow-outline w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50'
						>
							{isSubmitting ? '登录中...' : '登录'}
						</button>

						<div className='flex items-center justify-between'>
							<button
								type='button'
								onClick={() => navigate('/')}
								className='text-gray-600 hover:text-gray-800'
							>
								返回首页
							</button>
							<button
								type='button'
								onClick={() => navigate('/register')}
								className='text-blue-500 hover:text-blue-700'
							>
								没有账号？注册一个吧
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	)
}
