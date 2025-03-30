import LoadingOrError from 'components/LoadingOrError'
import type { ReactElement } from 'react'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

const Default = lazy(async () => import('pages/Default'))
const TableReservation = lazy(async () => import('pages/TableReservation'))
const Login = lazy(async () => import('pages/Login'))
const Register = lazy(async () => import('pages/Register'))
const ReservationList = lazy(async () => import('pages/ReservationList'))
const ReservationEdit = lazy(async () => import('pages/ReservationEdit'))

export default function App(): ReactElement {
	return (
		<BrowserRouter>
			<Suspense fallback={<LoadingOrError />}>
				<Routes>
					<Route path='/' element={<Default />} />
					<Route path='/reservation' element={<TableReservation />} />
					<Route path='/login' element={<Login />} />
					<Route path='/register' element={<Register />} />
					<Route path='/reservations' element={<ReservationList />} />
					<Route path='/reservations/:id/edit' element={<ReservationEdit />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
	)
}
