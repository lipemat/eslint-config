export function Custom() {
	return <>Accessible label</>;
}


function Foo() {
	return (
		<>
			<label htmlFor="1">
				<Custom />
			</label>
			<input id="1" />
		</>
	);
}

export default Foo;
