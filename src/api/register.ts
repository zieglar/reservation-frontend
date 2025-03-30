interface RegisterResponse {
	id: string
	username: string
	createdAt: string
}

interface RegisterInput {
	username: string
	password: string
	role: string
}

export default async function register(
	data: RegisterInput
): Promise<RegisterResponse> {
	try {
		const response = await fetch('/auth/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: JSON.stringify(data)
		})

		if (!response.ok) {
			throw new Error('注册失败，请稍后重试')
		}

		const result = (await response.json()) as RegisterResponse

		return result
	} catch (error) {
		console.error('Error registering:', error)
		throw error
	}
}
