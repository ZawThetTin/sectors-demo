import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

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
const USER_NAME = 'userName';
const CHOSEN_IDS = 'chosenIds';
const AGREE_TO_TERMS = 'agreeToTerms';
const schema = yup
	.object({
		[USER_NAME]: yup.string().required('Username is required'),
		[CHOSEN_IDS]: yup
			.array()
			.min(1)
			.required('Please choose one of the sectors'),
		[AGREE_TO_TERMS]: yup
			.boolean()
			.required('You must agree to our terms')
			.oneOf([true], 'You must agree to our terms'),
	})
	.required();

const App = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	});
	const [sectors, setSectors] = useState([]);
	const [choices, setChoices] = useState([]);
	const [view, setView] = useState(LIST_VIEW);

	const getSectors = async db => {
		const sectorsCol = collection(db, 'sectors');
		const sectorSnapshot = await getDocs(sectorsCol);
		const sectorList = sectorSnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}));
		return sectorList;
	};

	const getChoices = async db => {
		const choicesCol = collection(db, 'choices');
		const choiceSnapshot = await getDocs(choicesCol);
		const choiceList = choiceSnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}));
		return choiceList;
	};

	const onSubmit = data => {
		console.log(data);
		setView(LIST_VIEW);
	};

	useEffect(() => {
		getSectors(db).then(data => {
			setSectors(data);
		});
		getChoices(db).then(data => {
			setChoices(data);
		});
	}, []);

	useEffect(() => {
		console.log({ sectors });
		console.log({ choices });
	}, [sectors, choices]);

	const ErrorMessage = ({ children, ...rest }) => (
		<small {...rest}>{children}</small>
	);

	if (view === LIST_VIEW)
		return (
			<div>
				<button onClick={() => setView(CREATE_VIEW)}>Create</button>
				<table>
					<thead>
						<tr>
							<th>User</th>
							<th>Sectors</th>
							<th>Agree to terms</th>
						</tr>
					</thead>
					<tbody>
						{choices?.map(({ user, agreeToTerms, chosenIds, id } = {}) => (
							<tr key={id}>
								<td>{user}</td>
								<td>{chosenIds}</td>
								<td>{agreeToTerms ? 'Yes' : 'No'}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);

	if (view === CREATE_VIEW)
		return (
			<form onSubmit={handleSubmit(onSubmit)}>
				Please enter your name and pick the Sectors you are currently involved
				in.
				<br />
				<br />
				Name:
				<input type='text' {...register(USER_NAME)} />
				{errors[USER_NAME] && (
					<ErrorMessage>{errors[USER_NAME]?.message}</ErrorMessage>
				)}
				<br />
				<br />
				Sectors:
				<select multiple={true} size='5' {...register(CHOSEN_IDS)}>
					{sectors?.map(({ id, name } = {}) => (
						<option key={id} value={id}>
							{name}
						</option>
					))}
					{/* <option value='1'>Manufacturing</option>
					<option value='19'>
						&nbsp;&nbsp;&nbsp;&nbsp;Construction materials
					</option>
					<option value='18'>
						&nbsp;&nbsp;&nbsp;&nbsp;Electronics and Optics
					</option>
					<option value='6'>&nbsp;&nbsp;&nbsp;&nbsp;Food and Beverage</option>
					<option value='342'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bakery &amp;
						confectionery products
					</option>
					<option value='43'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Beverages
					</option>
					<option value='42'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Fish &amp; fish
						products
					</option>
					<option value='40'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Meat &amp; meat
						products
					</option>
					<option value='39'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Milk &amp; dairy
						products
					</option>
					<option value='437'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Other
					</option>
					<option value='378'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Sweets &amp; snack
						food
					</option>
					<option value='13'>&nbsp;&nbsp;&nbsp;&nbsp;Furniture</option>
					<option value='389'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bathroom/sauna
					</option>
					<option value='385'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bedroom
					</option>
					<option value='390'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Children’s room
					</option>
					<option value='98'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Kitchen
					</option>
					<option value='101'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Living room
					</option>
					<option value='392'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Office
					</option>
					<option value='394'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Other (Furniture)
					</option>
					<option value='341'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Outdoor
					</option>
					<option value='99'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Project furniture
					</option>
					<option value='12'>&nbsp;&nbsp;&nbsp;&nbsp;Machinery</option>
					<option value='94'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Machinery components
					</option>
					<option value='91'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Machinery
						equipment/tools
					</option>
					<option value='224'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Manufacture of
						machinery
					</option>
					<option value='97'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Maritime
					</option>
					<option value='271'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Aluminium
						and steel workboats
					</option>
					<option value='269'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Boat/Yacht
						building
					</option>
					<option value='230'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ship
						repair and conversion
					</option>
					<option value='93'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Metal structures
					</option>
					<option value='508'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Other
					</option>
					<option value='227'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Repair and
						maintenance service
					</option>
					<option value='11'>&nbsp;&nbsp;&nbsp;&nbsp;Metalworking</option>
					<option value='67'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Construction of
						metal structures
					</option>
					<option value='263'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Houses and buildings
					</option>
					<option value='267'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Metal products
					</option>
					<option value='542'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Metal works
					</option>
					<option value='75'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;CNC-machining
					</option>
					<option value='62'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Forgings,
						Fasteners
					</option>
					<option value='69'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Gas,
						Plasma, Laser cutting
					</option>
					<option value='66'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MIG,
						TIG, Aluminum welding
					</option>
					<option value='9'>&nbsp;&nbsp;&nbsp;&nbsp;Plastic and Rubber</option>
					<option value='54'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Packaging
					</option>
					<option value='556'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Plastic goods
					</option>
					<option value='559'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Plastic processing
						technology
					</option>
					<option value='55'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Blowing
					</option>
					<option value='57'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Moulding
					</option>
					<option value='53'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Plastics
						welding and processing
					</option>
					<option value='560'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Plastic profiles
					</option>
					<option value='5'>&nbsp;&nbsp;&nbsp;&nbsp;Printing</option>
					<option value='148'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Advertising
					</option>
					<option value='150'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Book/Periodicals
						printing
					</option>
					<option value='145'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Labelling and
						packaging printing
					</option>
					<option value='7'>
						&nbsp;&nbsp;&nbsp;&nbsp;Textile and Clothing
					</option>
					<option value='44'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Clothing
					</option>
					<option value='45'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Textile
					</option>
					<option value='8'>&nbsp;&nbsp;&nbsp;&nbsp;Wood</option>
					<option value='337'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Other (Wood)
					</option>
					<option value='51'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Wooden building
						materials
					</option>
					<option value='47'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Wooden houses
					</option>
					<option value='3'>Other</option>
					<option value='37'>
						&nbsp;&nbsp;&nbsp;&nbsp;Creative industries
					</option>
					<option value='29'>&nbsp;&nbsp;&nbsp;&nbsp;Energy technology</option>
					<option value='33'>&nbsp;&nbsp;&nbsp;&nbsp;Environment</option>
					<option value='2'>Service</option>
					<option value='25'>&nbsp;&nbsp;&nbsp;&nbsp;Business services</option>
					<option value='35'>&nbsp;&nbsp;&nbsp;&nbsp;Engineering</option>
					<option value='28'>
						&nbsp;&nbsp;&nbsp;&nbsp;Information Technology and
						Telecommunications
					</option>
					<option value='581'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Data processing, Web
						portals, E-marketing
					</option>
					<option value='576'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Programming,
						Consultancy
					</option>
					<option value='121'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Software, Hardware
					</option>
					<option value='122'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Telecommunications
					</option>
					<option value='22'>&nbsp;&nbsp;&nbsp;&nbsp;Tourism</option>
					<option value='141'>
						&nbsp;&nbsp;&nbsp;&nbsp;Translation services
					</option>
					<option value='21'>
						&nbsp;&nbsp;&nbsp;&nbsp;Transport and Logistics
					</option>
					<option value='111'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Air
					</option>
					<option value='114'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Rail
					</option>
					<option value='112'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Road
					</option>
					<option value='113'>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Water
					</option> */}
				</select>
				{errors[CHOSEN_IDS] && (
					<ErrorMessage>{errors[CHOSEN_IDS]?.message}</ErrorMessage>
				)}
				<input type='checkbox' {...register(AGREE_TO_TERMS)} /> Agree to terms
				{errors[AGREE_TO_TERMS] && (
					<ErrorMessage>{errors[AGREE_TO_TERMS]?.message}</ErrorMessage>
				)}
				<button type='submit'>Save</button>
			</form>
		);

	return null;
};

export default App;
