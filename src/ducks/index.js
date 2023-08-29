import { combineReducers } from 'redux';
import categories from './categories';
import competition from './competition';
import setappstate from './setappstate';
import register from './register';
import home from './home';
import deliverydetails from './deliverydetails';
import cart from './cart';
import squardcorner from './squardcorner';
import notifications from './notifications';
import branches from './branches';
import vouchers from './vouchers';

export default combineReducers({
    app: setappstate,
    category: categories,
    competition,
    cart: cart,
    register: register,
    home: home,
    deliverydetails: deliverydetails,
    squardcorner: squardcorner,
    notifications: notifications,
    branches: branches,
    vouchers: vouchers
});
