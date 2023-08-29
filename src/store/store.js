import { createStore, applyMiddleware } from 'redux';
import reducers from '../ducks';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas';

const sagaMiddleware = createSagaMiddleware()

export default function configureStore() {
	let middleware = [sagaMiddleware]
	if (process.env.NODE_ENV !== 'production') {
		// middleware = [...middleware, logger];
	}

	const store = createStore(reducers,
		applyMiddleware(...middleware),
	)

	sagaMiddleware.run(rootSaga)
	return store
}
