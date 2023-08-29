import { put, call } from 'redux-saga/effects';
import { AppState } from 'react-native';

import { Alert } from 'react-native';

import { types as stateTypes } from '../ducks/setappstate';

export function* showErrorAlert(action) {
  const { error } = action;
  const { currentState } = AppState;
  const status = currentState === 'active';
  const message = error;
  yield put({ type: stateTypes.SET_ERROR, payload: { status, message } });
}

export function* disableError(action) {
  yield put({ type: stateTypes.SET_ERROR, payload: { status: false, message: '' } });
}
