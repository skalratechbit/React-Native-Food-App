
export const types = {

	GET_VOUCHERS :'get_vouchers',
	GET_VOUCHERS_SUCCESS:"get_vouchers_success",
	GET_VOUCHERS_FAILURE:"get_vouchers_failure",

	GET_VOUCHERS_CAPTURE :'get_vouchers_capture',

	GET_VOUCHERS_SUCCESS_CAPTURE_DELIVERY:"get_vouchers_success_capture_delivery",
	GET_VOUCHERS_FAILURE_CAPTURE_DELIVERY:"get_vouchers_failure_capture_delivery",

	GET_VOUCHERS_CAPTURE_DINE_IN :'get_vouchers_capture_dine_in',
	GET_VOUCHERS_CAPTURE_DINE_IN_SUCCESS:"get_vouchers_capture_dine_in_success",
	GET_VOUCHERS_CAPTURE_DINE_IN_FAILURE:"get_vouchers_capture_dine_in_failure",

}


const  INITIAL_STATE = { vouchers:[], updateData:true ,vouchersDine:[],vouchersDelivery:[] };

//export  default (state= INITIAL_STATE , action) => {

export default function reducer(state = INITIAL_STATE,action = {}) {

	switch (action.type){

		// case types.GET_VOUCHERS:
		// return {...state,updateData:  false};
		// break;

		case types.GET_VOUCHERS_SUCCESS:
		return {...state,vouchers: action.payload};
		break;

		case types.GET_VOUCHERS_FAILURE:
		return {...state,vouchers: [] };
		break;

		case types.GET_VOUCHERS_CAPTURE_DINE_IN_SUCCESS:
		return {...state,vouchersDine:  action.payload};
		break;

		case types.GET_VOUCHERS_CAPTURE_DINE_IN_FAILURE:
		return {...state,vouchersDine: [] };
		break;

		case types.GET_VOUCHERS_SUCCESS_CAPTURE_DELIVERY:
		return {...state,vouchersDelivery:  action.payload};
		break;

		case types.GET_VOUCHERS_FAILURE_CAPTURE_DELIVERY:
		return {...state,vouchersDelivery: [] };
		break;

		default:
		return state;
		break;
	}
};

export const actions = {

	getVouchers: () => ({ type: types.GET_VOUCHERS , }),
	getVouchersWithCapture: (Capture) => ({ type: types.GET_VOUCHERS_CAPTURE ,Capture }),
	getDineVouchers: (params) => ({ type: types.GET_VOUCHERS_CAPTURE_DINE_IN ,params }),

}
