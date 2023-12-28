import { initializeApp } from 'firebase/app';
import {
	getFirestore,
	collection,
	getDocs,
	doc,
	addDoc,
	setDoc,
	deleteDoc,
} from 'firebase/firestore/lite';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { cn } from './utils';
import { Button } from './components';
import { BTN_DANGER, BTN_PRIMARY, BTN_SECONDARY } from './data';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_API_KEY,
	authDomain: import.meta.env.VITE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_APP_ID,
	measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const LIST_VIEW = 'view';
const CREATE_VIEW = 'create';
const USER = 'user';
const CHOSEN_IDS = 'chosenIds';
const AGREE_TO_TERMS = 'agreeToTerms';
const SECTORS_COLLECTION = 'sectors';
const CHOICES_COLLECTION = 'choices';
const schema = yup
	.object({
		[USER]: yup.string().required('Username is required'),
		[CHOSEN_IDS]: yup.array().min(1, 'Please choose one of the sectors'),
		[AGREE_TO_TERMS]: yup
			.boolean()
			.required('You must agree to our terms')
			.oneOf([true], 'You must agree to our terms'),
	})
	.required();

const SHARED_CELL_STYLING = 'align-top p-3 text-left whitespace-nowrap';
const SHARED_INPUT_FIELD_STYLING =
	'border border-gray-200 rounded-md py-1 px-2';

const App = () => {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	});
	const [sectors, setSectors] = useState([]);
	const [sectorKeys, setSectorKeys] = useState({});
	const [choices, setChoices] = useState([]);
	const [view, setView] = useState(LIST_VIEW);

	const getSectors = async db => {
		const sectorsCol = collection(db, SECTORS_COLLECTION);
		const sectorSnapshot = await getDocs(sectorsCol);
		const sectorList = sectorSnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}));
		return sectorList;
	};

	const getChoices = async db => {
		const choicesCol = collection(db, CHOICES_COLLECTION);
		const choiceSnapshot = await getDocs(choicesCol);
		const choiceList = choiceSnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}));
		return choiceList;
	};

	const createUserChoices = async (db, values) => {
		const choicesCollection = collection(db, CHOICES_COLLECTION);
		const userChoices = {
			[USER]: values[USER],
			[CHOSEN_IDS]: values[CHOSEN_IDS],
			[AGREE_TO_TERMS]: values[AGREE_TO_TERMS],
		};

		if (values?.id) {
			await setDoc(doc(db, CHOICES_COLLECTION, values?.id), userChoices);
		} else {
			await addDoc(choicesCollection, userChoices);
		}

		getChoices(db).then(data => {
			setChoices(data);
		});
	};

	const onSubmit = async values => {
		await createUserChoices(db, values);
		reset({});
		setView(LIST_VIEW);
	};

	const handleCreate = () => {
		setView(CREATE_VIEW);
		reset({});
	};

	const handleEdit = values => {
		reset(values);
		setView(CREATE_VIEW);
	};

	const handleCancel = () => {
		setView(LIST_VIEW);
		reset({});
	};

	const handleDelete = async id => {
		await deleteDoc(doc(db, CHOICES_COLLECTION, id));
		getChoices(db).then(data => {
			setChoices(data);
		});
	};

	useEffect(() => {
		getSectors(db).then(data => {
			const sectorKeys = {};
			const sorted = [...data]?.sort((a, b) => {
				const nameA = a.nesting; // ignore upper and lowercase
				const nameB = b.nesting; // ignore upper and lowercase
				if (nameA < nameB) {
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}

				// names must be equal
				return 0;
			});
			console.log({ data, sorted });
			sorted?.map(({ id, name } = {}) => (sectorKeys[id] = name));
			setSectorKeys(sectorKeys);
			setSectors(sorted);
		});
		getChoices(db).then(data => {
			setChoices(data);
		});
	}, []);

	const ErrorMessage = ({ children, ...rest }) => (
		<small className='text-red-600' {...rest}>
			{children}
		</small>
	);

	const InputGroup = ({ children, ...rest }) => (
		<div className='flex flex-col gap-px' {...rest}>
			{children}
		</div>
	);

	if (view === LIST_VIEW)
		return (
			<div className='w-[max(420px,100%)] flex flex-col gap-4 my-auto p-4 md:px-10'>
				<Button
					variant={BTN_PRIMARY}
					onClick={handleCreate}
					className='ml-auto'>
					Create
				</Button>
				<div className='overflow-auto'>
					<table className='w-full'>
						<thead>
							<tr className='border border-collapse border-gray-200'>
								<th className={SHARED_CELL_STYLING}>User</th>
								<th className={SHARED_CELL_STYLING}>Sectors</th>
								<th className={SHARED_CELL_STYLING}>Agree to Terms</th>
							</tr>
						</thead>
						<tbody>
							{choices?.map(({ user, agreeToTerms, chosenIds, id } = {}) => (
								<tr key={id} className='border border-collapse border-gray-200'>
									<td className={cn(SHARED_CELL_STYLING, 'w-1/3')}>{user}</td>
									<td className={cn(SHARED_CELL_STYLING, 'w-1/3')}>
										{chosenIds?.map(item => (
											<span key={item} className='flex'>
												{sectorKeys[item]}
											</span>
										))}
									</td>
									<td className={cn(SHARED_CELL_STYLING, 'w-1/3')}>
										{agreeToTerms ? 'Yes' : 'No'}
									</td>
									<td className={cn(SHARED_CELL_STYLING, 'flex gap-1')}>
										<Button
											onClick={() =>
												handleEdit({ id, user, agreeToTerms, chosenIds })
											}
											className='text-black border border-gray-200 hover:bg-gray-50'>
											Edit
										</Button>
										<Button
											onClick={() => handleDelete(id)}
											variant={BTN_DANGER}>
											Delete
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		);

	if (view === CREATE_VIEW)
		return (
			<form
				onSubmit={handleSubmit(onSubmit)}
				className='flex flex-col gap-4 w-[min(424px,100%)] px-3 m-auto'>
				<h3 className='text-xl font-bold py-4'>
					Please enter your name and pick the Sectors you are currently involved
					in
				</h3>
				<InputGroup>
					<label>Name</label>
					<input
						type='text'
						className={SHARED_INPUT_FIELD_STYLING}
						autoFocus
						{...register(USER)}
					/>
					{errors[USER] && <ErrorMessage>{errors[USER]?.message}</ErrorMessage>}
				</InputGroup>

				<InputGroup>
					<label>Sectors</label>
					<select
						className={cn(SHARED_INPUT_FIELD_STYLING, 'px-0')}
						multiple={true}
						size='5'
						{...register(CHOSEN_IDS)}>
						{sectors?.map(({ id, name, nesting } = {}) => {
							const splitted = nesting?.split('-');
							const length = splitted.length;
							return (
								<option
									key={id}
									value={id}
									className={cn(
										'py-2 px-4 checked::bg-blue-50',
										length === 2 && 'px-8',
										length === 3 && 'px-12',
										length === 4 && 'px-16'
									)}>
									{name}
								</option>
							);
						})}
					</select>
					{errors[CHOSEN_IDS] && (
						<ErrorMessage>{errors[CHOSEN_IDS]?.message}</ErrorMessage>
					)}
				</InputGroup>
				<InputGroup>
					<div className='flex gap-1'>
						<input type='checkbox' {...register(AGREE_TO_TERMS)} />
						<span>Agree to terms</span>
					</div>
					{errors[AGREE_TO_TERMS] && (
						<ErrorMessage>{errors[AGREE_TO_TERMS]?.message}</ErrorMessage>
					)}
				</InputGroup>
				<div className='flex gap-1 py-3'>
					<Button type='submit' variant={BTN_PRIMARY}>
						Save
					</Button>
					<Button onClick={handleCancel} variant={BTN_SECONDARY}>
						Cancel
					</Button>
				</div>
			</form>
		);

	return null;
};

export default App;
