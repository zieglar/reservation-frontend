import type { ReactElement } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import register from '../api/register'

interface RegisterForm {
	username: string
	password: string
	confirmPassword: string
	role: string
}

export default function Register(): ReactElement {
	const navigate = useNavigate()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [formData, setFormData] = useState<RegisterForm>({
		username: '',
		password: '',
		confirmPassword: '',
		role: 'user'
	})

	const handleSubmit = async (event: React.FormEvent): Promise<void> => {
		event.preventDefault()

		if (formData.password !== formData.confirmPassword) {
			alert('两次输入的密码不一致')
			return
		}

		try {
			setIsSubmitting(true)
			await register({
				username: formData.username,
				password: formData.password,
				role: formData.role
			})
			alert('注册成功！')
			navigate('/login')
		} catch (error) {
			alert(error instanceof Error ? error.message : '注册失败，请稍后重试')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className='min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
			<div className='mx-auto max-w-md'>
				<div className='text-center'>
					<h2 className='mb-8 text-3xl font-bold'>注册</h2>
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

					<div className='mb-4'>
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

					<div className='mb-6'>
						<label
							className='mb-2 block text-sm font-bold text-gray-700'
							htmlFor='confirmPassword'
						>
							确认密码
						</label>
						<input
							id='confirmPassword'
							type='password'
							required
							className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
							value={formData.confirmPassword}
							onChange={event =>
								setFormData({
									...formData,
									confirmPassword: event.target.value
								})
							}
						/>
					</div>

					<div className='mb-6'>
						<label
							className='mb-2 block text-sm font-bold text-gray-700'
							htmlFor='role'
						>
							身份
						</label>
						<select
							id='role'
							name='role'
							required
							className='relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
							value={formData.role}
							onChange={event =>
								setFormData({ ...formData, role: event.target.value })
							}
						>
							<option value='user'>用户</option>
							<option value='staff'>员工</option>
						</select>
					</div>

					<div className='flex flex-col gap-4'>
						<button
							type='submit'
							disabled={isSubmitting}
							className='focus:shadow-outline w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50'
						>
							{isSubmitting ? '注册中...' : '注册'}
						</button>

						<button
							type='button'
							onClick={() => navigate('/login')}
							className='text-gray-600 hover:text-gray-800'
						>
							返回登录
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
