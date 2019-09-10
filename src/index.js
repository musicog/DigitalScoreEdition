import React  from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import ReduxPromise from 'redux-promise';
import { Router, Route, browserHistory } from 'react-router'

import { reducers } from 'meld-clients-core/src/reducers';
import DigitalScoreEdition from './containers/digitalScoreEdition';
import {APP_PATH} from "./containers/settings";

const createStoreWithMiddleware = applyMiddleware(thunk, ReduxPromise)(createStore);

ReactDOM.render(
	<Provider store={createStoreWithMiddleware(reducers)}>
		<Router history={browserHistory}> 
			<Route path={`/${APP_PATH}`} component={DigitalScoreEdition} />
		</Router>
	</Provider>
		, document.querySelector('.container')
);
