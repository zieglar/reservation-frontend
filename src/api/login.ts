interface LoginResponse {
	id: string
	username: string
	accessToken: string
}

interface LoginInput {
	username: string
	password: string
	verifyCode?: string
}

interface ErrorResponse {
	message: string
	error: string
	statusCode: number
}

export default async function login(data: LoginInput): Promise<LoginResponse> {
	try {
		const response = await fetch('/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: JSON.stringify(data)
		})

		const result = await response.json()

		if (!response.ok) {
			const errorData = result as ErrorResponse
			throw new Error(errorData.message)
		}

		const loginData = result as LoginResponse
		// 将登录信息存储到 localStorage
		localStorage.setItem('auth_info', JSON.stringify(loginData))

		return loginData
	} catch (error) {
		console.error('Error logging in:', error)
		throw error
	}
}
