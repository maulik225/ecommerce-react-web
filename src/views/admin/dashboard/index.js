import React from 'react';
import useDocumentTitle from 'hooks/useDocumentTitle';
import useScrollTop from 'hooks/useScrollTop';

const Dashboard = () => {
	useDocumentTitle('Welcome | Admin Dashboard');
	useScrollTop();

	return (
		<div className="loader">
			<h2>Welcome to Admin dashboard</h2>
		</div>
	);
};

export default Dashboard;
