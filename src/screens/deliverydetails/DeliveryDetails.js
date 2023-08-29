import React, { Component } from 'react'
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    BackHandler,
    NativeModules
} from 'react-native'
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-community/async-storage'
import _ from 'lodash'
import ContactViewPopUp from '../squadcorner/ContactViewPopUp'
import GoodToGoConfirmation from './GoodToGoConfirmation'
import {
    COMMON_BUTTON_TEXT_STYLE,
    COMMON_BUTTON_STYLE,
    IF_OS_IS_IOS,
    USER_INPUTS_ERROR_TEXT_STYLE,
    FONT_SCALLING,
    SCREEN_WIDTH,
} from '../../config/common_styles'
import { Actions } from 'react-native-router-flux'
import { bindActionCreators } from 'redux'
import ScheduleOrderPopUp from './ScheduleOrderPopUp'
import ExtraPopUp from './ExtraPopUp'
import {
    RIGHT_ARROW_LARGE_WHITE,
    ADDRESS_PIN,
    ADDD_NEW_ADDRESS_PIN,
    PAYMENT_METHOD_IC,
    INSTRUCTION_IC,
    CROSS_BLACK_IMAGE,
} from '../../assets/images'
import {
    ORGANIZATION_ID,
    CURRENCY
} from '../../config/constants/network_constants'
import strings from '../../config/strings/strings'
import {
    APP_COLOR_WHITE,
    APP_COLOR_RED,
    APP_COLOR_BLACK,
    TRANSPARENT_COLOR,
    TEXT_INPUT_PLACEHOLDER_COLOR
} from '../../config/colors'
import {
    DINENGSCHRIFT_REGULAR,
    ROADSTER_REGULAR,
    HELVETICANEUE_LT_STD_CN,
    DIN_CONDENSED,
    DINENGSCHRIFT_BOLD
} from '../../assets/fonts'
import { Button } from 'native-base'
import { CommonInputSmall } from '../../components'
import CommonLoader from '../../components/CommonLoader'
import { connect } from 'react-redux'
import {
    numberWithCommas,
    validate,
} from '../../config/common_functions'
import { actions as deliveryDetailsAction } from '../../ducks/deliverydetails'
import DateTimePicker from 'react-native-modal-datetime-picker'
import Moment from 'moment'
import VouchersHelper from './VouchersHelper'
import { actions as vouchersActions } from '../../ducks/vouchers'
import { BoostYourStartPopUp } from '../../components'
import { getUserObject, getUserPaymentMethods } from '../../helpers/UserHelper'
import { validatePromo } from '../../helpers/CartHelper'
import { getThemeByLevel } from '../../config/common_styles/appthemes'
import TitleBar from '../../components/TitleBar'
import CardsHolder from './CardsHolder/Index'
import { AppEventsLogger } from 'react-native-fbsdk'
import Common from '../../components/Common'
import {
    MINIMUM_ONLINE_PAYMENT_WARNING,
    VOUCHER_PAYMENT_CODE,
    VOUCHER_PAYMENT_POSSName,
    REDEEMABLE_PAYMENT_CODE,
    REDEEMABLE_PAYMENT_POSSName,
    CASH_PAYMENT_CODE,
    CASH_PAYMENT_POSSNAME,
    ONLINE_PAYMENT_CODE,
    ONLINE_PAYMENT_POSSNAME,
    VOUCHERS_WILL_SUFFICE_WARNING,
    NO_VOUCHERS_WARNING,
    WALLET_PAYMENT_CODE,
    FILTER_VOUCHER_STATUS
} from '../../config/constants/app_logic'
import CurrencySelection from './CardsHolder/CurrencySelection'
import {CachedImage} from 'react-native-img-cache';
import {isEmpty} from "ramda";
import {scale} from "react-native-size-matters";

const DefaultSelectedCurrency = {
    Currency: 'USD',
    Sorting: 2,
    Rate: 1500
}
const TITLE_CONTAINER_HEIGHT = 52
const TITLE_TEXT_SIZE = 30
const ITEM_CELL_HEIGHT = 453.5
const ITEMS_MARGIN = 5
const ADD_ITEMS_TEXT_SIZE = 20.5
const ADD_ITEMS_ARROW_WIDTH = 12
const ADD_ITEMS_ARROW_HEIGHT = 18
const ADD_ITEMS_ARROW_MARGIN_LEFT = 5
const SUBSELECTION_HEADING_VIEW_HEIGHT = 45
const CROSS_PRESSED = 'cross pressed'
const TIME_FOR_NOW_ORDER = '0000-00-00 00:00:00'

class DeliveryDetails extends Component {
    instructionDetailsIndex = 0;

    constructor(props) {
        super(props)
        this.paymentCache = {}
        this.state = {

            confirmationData: {},
            // goodToGoPressed: false,
            latitude: null,
            longitude: null,
            error: null,
            editedAddressID: '',
            showEditOrderView: false,
            selectedVoucherArray: [],
            totalAmount: 0,
            deliveryAddressArray: [],
            paymentMethodsArray: [],
            disabledItems: [],
            timesArray: [
                strings.NOW.toUpperCase(),
                strings.IN30_MINUTES.toUpperCase()
            ],
            showNewAddress: false,
            name: '',
            city: '',
            building: '',
            floor: '',
            direction: '',
            street: '',
            addressTypesArray: [],
            provincesCitiesArray: [],
            selectedCity: 'Select City',
            specialInstructionsArray: [],
            selectedCityObject: '',
            isDateTimePickerVisible: false,
            orderSchadualDateTimeArray: [
                { title: 'NOW', selection: 1, dateTime: TIME_FOR_NOW_ORDER },
                {
                    title: 'Scheduled  Order',
                    selection: 0,
                    dateTime: TIME_FOR_NOW_ORDER
                }
            ],
            orderNotes: '',
            componentTheme: getThemeByLevel(this.props.LevelName),
            voucherCAlled: false,
            company: '',
            timePopupVisibilty: false,
            scheduleOrderPopUpVisibilty: false,
            extraPopupVisible: false,
            extraPopupMessage: '',
            showUnavailableOrder: false,
            unavailableOrderText: '',
            scheduleSubHeadText: '',
            showContactPopUp: false,
            submittingOrder: false,
            visibilty: false,
            selectedCurrency: DefaultSelectedCurrency,
            // to indicate when the selected vouchers cover the bill
            vouchersWillSuffice: false,
            onlineOrderId: 0,
            expressPayment: {},
            showAddressInactivePopUp: false,
            addressInactiveMessage: '',
            isScheduled: false,
            cartItemsArray: [],
            alertVisibilty: false,
            alertMessage: '',
            alertTitle: '',
        }
    }

    onCrossPressOnContatcPopup = () => {
        this.setState({ showContactPopUp: false })
    };
    setSelectedObject = (event, object) => {
        // console.log(object);
        this.setState({
            selectedCity: object.label,
            selectedCityObject: object,
            showContactPopUp: false
        })

    };

    openCitiesList() {
        this.setState({ showContactPopUp: true })
    }

    getTotalAmountOfVouchers(array) {
        let amount = 0
        for (var i = 0; i < array.length; i++) {
            amount = amount + parseInt(array[i].Value)
        }
        return amount;
    }

    componentDidMount() {
        Geolocation.getCurrentPosition(
            position => {
                this.setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null
                })
            },
            error => this.setState({ error: error.message }),
            { enableHighAccuracy: false, timeout: 50000, maximumAge: 1000 }
        )

        this.props.getAddressTypes()

        // list for back button
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress)

        // log fb checkout event
        const { cartItemsArray, currency, totalAmount } = this.props
        this.setState({
            cartItemsArray: cartItemsArray
        })
        AppEventsLogger.logEvent(
            'fb_mobile_initiated_checkout',
            cartItemsArray.length,
            totalAmount
        )
    }

    componentWillUnmount() {
        if (this.selectOrderTimeout) clearInterval(this.selectOrderTimeout)
        if (this.submitEnablerTimeout) clearInterval(this.submitEnablerTimeout)

        // clean up
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
    }

    onBackPress() {
        Actions.yourcart({
            hideRecommended: true
        })
        return true
    }

    componentWillMount() {
        this.resetOrderStatus()
        this.setSelectedAddressFromHistory()
        // get special instruction listing
        // this.props.getSpecialInstructions()
        // get checkout tokens for online option
        // this.props.getPaymentTokens()
        // get payment methods (unify this data with delivery data)
        // this.props.getPaymentMethods()
    }

    setSelectedAddressFromHistory() {
        AsyncStorage.getItem('selectedAddressIndex').then(selectedAddressIndex => {
            if (selectedAddressIndex != undefined) {
                const { deliveryAddressArray } = this.state
                console.log('DELIVERY ADDRESSES', deliveryAddressArray)
                deliveryAddressArray.map(
                    address => (address.selection = address.ID == selectedAddressIndex)
                )
                this.setState({
                    selectedAddressIndex,
                    deliveryAddressArray
                })
            }
        })
    }

    resetOrderStatus() {
        this.setState({ submittingOrder: false })
    }

    setPaymentMethodSelectionBy(Code, Value) {
        const { paymentMethodsArray } = this.state
        // deselect other payment methods
        paymentMethodsArray.map((method, i) => {
            const {
                selection,
                POSCode,
                POSSName
            } = method
            if (selection == 1 && POSSName.toLowerCase() != Code) {
                paymentMethodsArray[i].selection = Value
                if (Value === 0) paymentMethodsArray[i].Amount = 0
            }
        })
    }

    setSelectedVoucherArray = (event, array) => {
        let { paymentMethodsArray, totalOfRedeemable, totalOfVouchers } = this.state

        const { totalAmount } = this.props

        const anySelectedMethods = paymentMethodsArray.filter(
            obj => obj.selection == 1
        )
        const selectedWalletMethod = anySelectedMethods.filter(
            obj => obj.POSSName == WALLET_PAYMENT_CODE
        )

        let selectedVoucherArray = array.filter(obj => obj.selection == 1)

        const totalAmountOfVouchers = this.getTotalAmountOfVouchers(
            selectedVoucherArray
        );
        let totalWalletPrice = parseInt(totalAmountOfVouchers);

        const walletPaymentIndex = _.findIndex(paymentMethodsArray, paymentMethod =>
            paymentMethod.POSSName.toLowerCase() === WALLET_PAYMENT_CODE
        );

        const redeemablePaymentIndex = _.findIndex(paymentMethodsArray[walletPaymentIndex]?.methods, method =>
            method.POSSName.toLowerCase() === REDEEMABLE_PAYMENT_POSSName
        );

        const voucherPaymentIndex = _.findIndex(paymentMethodsArray[walletPaymentIndex]?.methods, method =>
            method.POSSName.toLowerCase() === VOUCHER_PAYMENT_POSSName
        );

        const isOtherMethodsSelected = anySelectedMethods.length > 1
        const isWalletMethodSelected = selectedWalletMethod.length == 1

        const hasOnlineSelected = this.ifOtherMethodeIsOnline()
        const isRemainingLessThanMin = totalAmount - totalAmountOfVouchers - totalOfRedeemable < this.props.minimumOnlinePayment
        const isOnlineLessThanMin = hasOnlineSelected && isRemainingLessThanMin

        if (isOnlineLessThanMin) {
            this.setPaymentMethodSelectionBy(WALLET_PAYMENT_CODE, 0)

            this.setState({
                extraPopupVisible: true,
                extraPopupMessage: MINIMUM_ONLINE_PAYMENT_WARNING(this.props.minimumOnlinePayment, this.props.currency),
                paymentMethodsArray,
            });
        }

        if (isOtherMethodsSelected && isWalletMethodSelected) {
            for (var i = 0; i < paymentMethodsArray.length; i++) {
                const isMethodSelected = paymentMethodsArray[i].selection == 1
                const isMethodFromWallet =
                    paymentMethodsArray[i].POSSName == WALLET_PAYMENT_CODE
                if (isMethodSelected) {
                    if (isMethodFromWallet) {
                        // set method to the total value of selected wallet
                        paymentMethodsArray[i].Amount = totalWalletPrice;
                        paymentMethodsArray[i].methods[voucherPaymentIndex].Amount = totalAmountOfVouchers;
                    } else {
                        // set method to the total value of selected wallet if difference is greater than 0
                        paymentMethodsArray[i].Amount =
                            totalAmount - totalAmountOfVouchers - totalOfRedeemable;
                    }
                }
            }
        } else {
            if (walletPaymentIndex > -1) {
                paymentMethodsArray[walletPaymentIndex].Amount = totalWalletPrice;
                if (voucherPaymentIndex > -1) {
                    paymentMethodsArray[walletPaymentIndex].methods[voucherPaymentIndex].Amount = totalAmountOfVouchers;
                }
            }
        }

        // if voucher total is greater than the bill, deselect other payment methods
        let vouchersWillSuffice = false
        if (totalAmountOfVouchers >= totalAmount) {
            vouchersWillSuffice = true
            this.setState({
                alertVisibilty: true,
                alertMessage: VOUCHERS_WILL_SUFFICE_WARNING,
                alertTitle: '',
            })
            this.selectWalletOptions(1, REDEEMABLE_PAYMENT_POSSName, 0)
            this.setPaymentMethodSelectionBy(WALLET_PAYMENT_CODE, 0)
        }

        if (walletPaymentIndex > -1) {
            if (redeemablePaymentIndex > -1) {
                if (parseInt(totalAmountOfVouchers) +
                    parseInt(paymentMethodsArray[walletPaymentIndex].methods[redeemablePaymentIndex].Amount) >= totalAmount) {
                    this.setPaymentMethodSelectionBy(WALLET_PAYMENT_CODE, 0)
                }
            }
        }

        this.setState({
            totalOfVouchers: totalAmountOfVouchers,
            vouchersWillSuffice,
            selectedVoucherArray,
            paymentMethodsArray
        })
    };

    clearError = () => {
        this.setState({ error: '' })
        IF_OS_IS_IOS && this.scrollView.scrollToEnd({ animated: true })
    };

    onCrossPressGoodToGo = () => {
        this.setState({ visibilty: false })
    };

    onPressGrabIt = () => {
        this.setState({ visibilty: false })
        this.goodToGo()
    };

    onPressCancel = () => {
        this.setState({ visibilty: false })
    };

    getIndex(value, array) {
        for (var x = 0; x < array.length; x++) {
            if (array[x].selection == value.i) {
                return x
            }
        }
        return -1
    }

    selectItem(i, selectionName) {
        var array = []
        if (selectionName == strings.ADDRESS) {
            array = this.state.deliveryAddressArray
            if (array[i].CityCode !== null && array[i].DepartmentStatus !== 'inactive') {
                for (var j = 0; j < array.length; j++) {
                    array[j].selection = 0
                }
                array[i].selection = array[i].selection == 0 ? 1 : 1
                this.setState({ deliveryAddressArray: array }, () => {
                    AsyncStorage.setItem('selectedAddressIndex', String(array[i].ID))
                })
            } else {
                this.setState({
                    alertVisibilty: true,
                    alertMessage: array[i].InactiveMessage || 'Please select another address',
                    alertTitle: 'WHOOPS!'
                })
            }
        }
        if (selectionName == strings.PAYMENT_METHOD) {
            array = this.state.paymentMethodsArray
            const filterArray = array.filter(obj => obj.selection == 1)

            const wlatteArray = filterArray.filter(
                obj => obj.selection == 1 && obj.methods.length == 2
            )

            if (filterArray.length >= 2) {
                array[i].selection = 0
            } else {
                array[i].selection = 1
            }
            this.setState({ paymentMethodsArray: array })
        }
        if (selectionName == strings.INSTRUCTIONS) {
            array = this.state.specialInstructionsArray
            if (array[i].selection == 0) {
                array[i].selection = 1
            } else {
                array[i].selection = 0
            }
            this.setState({ specialInstructionsArray: array })
        }

        if (selectionName == strings.ADDRESS_TYPE) {
            array = this.state.addressTypesArray
            if (array[i].selection == 0) {
                for (var j = 0; j < array.length; j++) {
                    array[j].selection = 0
                }
                array[i].selection = 1
            } else {
                // array[i].selection=0;
            }
            this.setState({ addressTypesArray: array })
        }
        if (selectionName == strings.ORDER_TIME) {
            if (i == 0) this.selectOrderTime(i, TIME_FOR_NOW_ORDER)
            else this._showDateTimePicker()
        }
    }

    selectOrderTime(i, dateTime, dontWarnMe) {
        Moment.locale('en')
        const timeSchedules = this.state.orderSchadualDateTimeArray
        // get selected address
        const filterArray = this.state.deliveryAddressArray.filter(
            obj => obj.selection == 1
        )

        if (i == 0) {
            // console.log('for "NOW" orders');
            // NOTE: for "NOW" orders
            const isValidTime = this.checkForValidRestaurantTime(new Date(), true, true)

            // if now is a valid time
            if (isValidTime) {
                // deselect "schedule" and reset time
                timeSchedules[1].selection = 0
                timeSchedules[1].dateTime = TIME_FOR_NOW_ORDER

                // select "now" and reset time
                timeSchedules[0].selection = 1
                timeSchedules[0].dateTime = TIME_FOR_NOW_ORDER

                // delivery time is good, update state
                this.setState({ orderSchadualDateTimeArray: timeSchedules })
                // kill process
                return
            }
        }

        // NOTE: for "Scheduled" orders beyond here
        // deselect "now" and reset time || earlier time cannot be selected
        let isNow = false
        if (dateTime === TIME_FOR_NOW_ORDER || Moment(dateTime) < Moment()) {
            dateTime = new Date()
            isNow = true
        }
        timeSchedules[0].selection = 0
        timeSchedules[0].dateTime = TIME_FOR_NOW_ORDER

        // select "schedule" and reset time
        timeSchedules[1].selection = 1

        // validate time
        // console.log('VALIDATING TIME', dateTime);
        if (this.checkForValidRestaurantTime(dateTime, true, isNow)) {
            // console.log('VALID TIME SETTING', dateTime);
            // delivery time is good, update state
            timeSchedules[1].dateTime = Moment(dateTime).format(
                'YYYY-MM-DD HH:mm:00'
            )
            this.setState({ orderSchadualDateTimeArray: timeSchedules })
        } else {
            let newText = new String('The branch is closed at your scheduled order time.\nThe first scheduled order is at OPENING_TIME_DELIVERY_TIME, and the last scheduled order is at CLOSING_TIME_DELIVERY_TIME')
            let firstScheduleTime = this.formatEtaTime(filterArray[0].OpenHours || "08:00:00", isNow ? '00' : filterArray[0].DeliveryEta || 35)
            let lastScheduleTime = this.formatEtaTime(filterArray[0].CloseHours || '00:35:00', isNow ? '00' : filterArray[0].DeliveryEta || 35)
            let filteredString1 = newText.replace('OPENING_TIME_DELIVERY_TIME', this.formatAMPM(firstScheduleTime))
            let filteredString2 = filteredString1.replace('CLOSING_TIME_DELIVERY_TIME', this.formatAMPM(lastScheduleTime))
            timeSchedules[1].dateTime = Moment(dateTime).format(
                'YYYY-MM-DD HH:mm:00'
            )
            this.setState({
                scheduleSubHeadText: filteredString2,
                scheduleOrderPopUpVisibilty: true,
                orderSchadualDateTimeArray: timeSchedules
            })
        }
    }

    checkForValidRestaurantTime(dateTime, dontCheckAddress, isNow) {
        // console.log('RUNNING checkForValidRestaurantTime', dateTime, dontCheckAddress);
        Moment.locale('en')

        const timeSchedules = this.state.orderSchadualDateTimeArray.slice()
        const filterArray = this.state.deliveryAddressArray.filter(
            obj => obj.selection == 1
        )

        // if there are no addresses selected
        if (!dontCheckAddress || filterArray.length === 0) {
            if (filterArray.length == 0) {
                this.setState({
                    alertVisibilty: true,
                    alertMessage: 'Select address',
                    alertTitle: 'Oh!'
                })
                return true
            }
        }

        // get opening and closing hours

        let openEtaTime = this.formatEtaTime(filterArray[0].OpenHours || "08:00:00", isNow ? '00' : filterArray[0].DeliveryEta || 35)

        let closeEtaTime = this.formatEtaTime(filterArray[0].CloseHours || '00:35:00', isNow ? '00' : filterArray[0].DeliveryEta || 35)
        let openHours = openEtaTime
        let closeHours = closeEtaTime
        // get current date / time moment from dateTime arg
        let currentDateTime = Moment(dateTime)

        // reset time of the "NOW" order
        timeSchedules[0].dateTime = TIME_FOR_NOW_ORDER

        // get date / times for closing hours today
        const currentDate = currentDateTime.format('YYYY-MM-DD')
        const isToday = currentDate === Moment().format('YYYY-MM-DD')

        const theDayOpeningTime = currentDate + ' ' + openHours
        const theDayClosingTime = currentDate + ' ' + closeHours
        // get opening / closing time moments
        // const openingTime = Moment(theDayOpeningTime)
        // const closingTime = Moment(theDayClosingTime)
        const openHoursArray = openHours.split(':');
        const closeHoursArray = closeHours.split(':');

        const openingTime = Moment(currentDateTime).set({
            hours: parseInt(openHoursArray[0]),
            minutes: parseInt(openHoursArray[1])
        });
        let closingTime = Moment(currentDateTime).set({
            hours: parseInt(closeHoursArray[0]),
            minutes: parseInt(closeHoursArray[1])
        });

        console.log('Open time--->', Moment(currentDateTime).set({
            hours: parseInt(openHoursArray[0]),
            minutes: parseInt(openHoursArray[1])
        }).format('YYYY-MM-DD HH:mm'))
        console.log('Close time--->', Moment(currentDateTime).set({
            hours: parseInt(closeHoursArray[0]),
            minutes: parseInt(closeHoursArray[1])
        }).format('YYYY-MM-DD HH:mm'))

        console.log('currentDateTime--->', Moment(currentDateTime).format('YYYY-MM-DD HH:mm'))

        let isValidTime = false

        // check for a late closing time (that goes over the next day)
        if (closingTime < openingTime) {
            const prevOpening = Moment(theDayOpeningTime).subtract(1, 'day')
            const nextClosing = Moment(theDayClosingTime).add(1, 'day')
            isValidTime =
                // if currentDateTime is after previous opening
                // and before currentClosing or after current opening
                // but before next closing
                (currentDateTime >= prevOpening && currentDateTime <= closingTime) ||
                (currentDateTime >= openingTime && currentDateTime <= nextClosing)
        } else {
            // if currentDateTime is after opening opening
            // or if currentDateTime is before closing hours
            // then the currentDateTime is valid
            let tempClosingTime = closingTime
            let tempOpeningTime = openingTime
            if (currentDateTime.date() < tempClosingTime.date()) {
                tempOpeningTime = currentDateTime.hours() < openingTime.hours() ? Moment(openingTime).subtract(1, 'day') : openingTime
                tempClosingTime = (currentDateTime.hours() >= 0 && currentDateTime.hours() < openingTime.hours()) ? Moment(closingTime).subtract(1, 'day') : closingTime
            }
            isValidTime =
                currentDateTime >= tempOpeningTime && currentDateTime <= tempClosingTime
        }
        return isValidTime
    }

    selectPaymentOptions(i, selectionName, rowObj) {
        // console.log('in selectPaymentOptions');
        const { totalAmount } = this.props
        const { vouchersWillSuffice } = this.state
        const isOnlinePayment = rowObj.POSSName.toLowerCase() === ONLINE_PAYMENT_POSSNAME
        const isOnlineLessThanMinumum =
            isOnlinePayment && this.calculateTotalNowDue() < this.props.minimumOnlinePayment
        let array = this.state.paymentMethodsArray
        const isMethodNotSelected = array[i].selection == 0
        const filterArray = array.filter(obj => obj.selection == 1)

        // first tier checks
        // do nothing if vouchers will cover the bill
        if (vouchersWillSuffice) return
        if (isOnlineLessThanMinumum) {
            this.setState({
                extraPopupVisible: true,
                extraPopupMessage: MINIMUM_ONLINE_PAYMENT_WARNING(this.props.minimumOnlinePayment, this.props.currency)
            });
            return;
        }

        if (selectionName == strings.PAYMENT_METHOD) {
            if (filterArray.length >= 2) {
                if (isMethodNotSelected) return

                array[i].selection = 0
                array[i].Amount = 0

                if (array[i].POSSName == WALLET_PAYMENT_CODE) {
                    // array[i].methods[1].selection = 0;
                    // array[i].methods[1].Amount = 0;
                }
                this.setState({ paymentMethodsArray: array }, () =>
                    this.setCartAmountInPaymentArray(array, i, false)
                )
            } else {
                array[i].selection = 1

                this.setState({ paymentMethodsArray: array }, () =>
                    this.setCartAmountInPaymentArray(array, i, true)
                )
            }
        }
    }

    setCartAmountInPaymentArray(array, i, selection) {
        let { totalOfRedeemable, totalOfVouchers, selectedVoucherArray } = this.state
        if (selection) {
            const paymentFilterArray = array.filter(obj => obj.selection == 1)
            const wlatteArray = paymentFilterArray.filter(
                obj => obj.selection == 1 && obj.POSSName == WALLET_PAYMENT_CODE
            )

            if (paymentFilterArray.length == 1 && wlatteArray.length == 0) {
                array[i].Amount = this.props.totalAmount
                this.setState({ paymentMethodsArray: array })
            } else if (paymentFilterArray.length == 1 && wlatteArray.length == 1) {
                const redeemIndex = _.findIndex(array[i]?.methods, (value) =>
                    value.POSSName.toLowerCase() === REDEEMABLE_PAYMENT_POSSName
                );
                const voucherIndex = _.findIndex(array[i]?.methods, (value) =>
                    value.POSSName.toLowerCase() === VOUCHER_PAYMENT_POSSName
                );
                if (redeemIndex > -1) {
                    array[i].methods[redeemIndex].Amount = 0
                }
                if (voucherIndex > -1) {
                    array[i].methods[voucherIndex].Amount = 0
                }
                this.setState({ paymentMethodsArray: array })

            } else if (paymentFilterArray.length == 2 && wlatteArray.length == 1) {
                for (var i = 0; i < this.state.paymentMethodsArray.length; i++) {
                    if (this.state.paymentMethodsArray[i].selection == 1) {
                        if (
                            this.state.paymentMethodsArray[i].POSSName == WALLET_PAYMENT_CODE
                        ) {
                            array[i].Amount = 0
                            const redeemIndex = _.findIndex(array[i]?.methods, (value) =>
                                value.POSSName.toLowerCase() === REDEEMABLE_PAYMENT_POSSName
                            );
                            if (redeemIndex > -1) {
                                array[i].methods[redeemIndex].Amount = 0
                                // array[i].methods[0].Amount = 0
                            }
                            totalOfRedeemable = 0
                        } else {
                            array[i].Amount = this.props.totalAmount

                            const walletPaymentIndex = _.findIndex(this.state.paymentMethodsArray, (value) =>
                                value.POSSName.toLowerCase() === WALLET_PAYMENT_CODE
                            );

                            if (walletPaymentIndex > -1) {
                                const voucherIndex = _.findIndex(this.state.paymentMethodsArray[walletPaymentIndex]?.methods, (value) =>
                                    value.POSSName.toLowerCase() === VOUCHER_PAYMENT_POSSName
                                );
                                if (voucherIndex > -1 && this.state.paymentMethodsArray[walletPaymentIndex]?.methods[voucherIndex].selection == 1) {
                                    array[i].Amount =
                                        this.props.totalAmount -
                                        this.state.paymentMethodsArray[walletPaymentIndex].methods[voucherIndex].Amount
                                }
                            }
                        }
                    }
                }
            } else {
                for (var i = 0; i < this.state.paymentMethodsArray.length; i++) {
                    if (this.state.paymentMethodsArray[i].selection == 1) {
                        if (
                            this.state.paymentMethodsArray[i].POSSName.toLowerCase() == CASH_PAYMENT_POSSNAME
                        ) {
                            array[i].Amount = this.ifOtherMethodeIsOnline() ? 0 : this.props.totalAmount - totalOfRedeemable - totalOfVouchers
                        } else if (
                            this.state.paymentMethodsArray[i].POSSName.toLowerCase() == ONLINE_PAYMENT_POSSNAME
                        ) {
                            array[i].Amount = this.props.totalAmount
                        }
                    }
                }
            }

            this.setState({ paymentMethodsArray: array, totalOfRedeemable })
        } else {
            for (var i = 0; i < array.length; i++) {
                if (array[i].selection == 1) {
                    array[i].Amount = this.props.totalAmount
                    if (array[i].POSSName == WALLET_PAYMENT_CODE) {
                        const redeemIndex = _.findIndex(array[i]?.methods, (value) =>
                            value.POSSName.toLowerCase() === REDEEMABLE_PAYMENT_POSSName
                        );
                        const voucherIndex = _.findIndex(array[i]?.methods, (value) =>
                            value.POSSName.toLowerCase() === VOUCHER_PAYMENT_POSSName
                        );
                        if (redeemIndex > -1) {
                            array[i].methods[redeemIndex].Amount = 0
                        }
                        if (voucherIndex > -1) {
                            array[i].methods[voucherIndex].Amount = 0
                        }
                        totalOfRedeemable = 0
                    }
                } else {
                    array[i].Amount = 0
                    if (array[i].POSSName == WALLET_PAYMENT_CODE) {
                        const redeemIndex = _.findIndex(array[i]?.methods, (value) =>
                            value.POSSName.toLowerCase() === REDEEMABLE_PAYMENT_POSSName
                        );
                        const voucherIndex = _.findIndex(array[i]?.methods, (value) =>
                            value.POSSName.toLowerCase() === VOUCHER_PAYMENT_POSSName
                        );
                        if (redeemIndex > -1) {
                            array[i].methods[redeemIndex].Amount = 0
                        }
                        if (voucherIndex > -1) {
                            array[i].methods[voucherIndex].Amount = 0
                        }
                        totalOfVouchers = 0
                        selectedVoucherArray = [];
                    }
                }
            }
            this.setState({ paymentMethodsArray: array, totalOfRedeemable, totalOfVouchers, selectedVoucherArray })
        }
    }

    selectWalletOptions(x, POSSName, isSelected) {
        let {
            selectedVoucherArray,
            paymentMethodsArray,
            vouchersWillSuffice,
            totalOfRedeemable,
            totalOfVouchers,
        } = this.state
        const array = paymentMethodsArray

        let willSuffice = vouchersWillSuffice
        let isVoucher = true
        let isRedeemable = true
        for (let i = 0; i < array.length; i++) {
            if (array[i].POSSName === WALLET_PAYMENT_CODE) {
                if (array[i].methods[x].selection == 1) {
                    const redeemableIndex = _.findIndex(array[i]?.methods, method =>
                        method.POSSName.toLowerCase() === REDEEMABLE_PAYMENT_POSSName
                    );
                    if (POSSName.toLowerCase() == VOUCHER_PAYMENT_POSSName  && redeemableIndex > -1 && array[i].methods[redeemableIndex].selection == 1) {
                        array[i].methods[x].selection =
                            typeof isSelected === 'number' ? isSelected : 0
                        willSuffice = false
                        isVoucher = array[i].methods[x].selection
                    }
                    const voucherIndex = _.findIndex(array[i]?.methods, method =>
                        method.POSSName.toLowerCase() === VOUCHER_PAYMENT_POSSName
                    );
                    if (POSSName.toLowerCase() == REDEEMABLE_PAYMENT_POSSName && voucherIndex > -1 && array[i].methods[voucherIndex].selection == 1) {
                        array[i].methods[x].selection =
                            typeof isSelected === 'number' ? isSelected : 0
                        isRedeemable = array[i].methods[x].selection
                    }
                } else {
                    array[i].methods[x].selection =
                        typeof isSelected === 'number' ? isSelected : 1
                    if (POSSName.toLowerCase() == VOUCHER_PAYMENT_POSSName) {
                        const voucherArray = [];
                        this.props.Vouchers.filter(
                            item => item.Vouchers.filter(voucher => {
                                if (voucher.Status === FILTER_VOUCHER_STATUS) {
                                    voucherArray.push({
                                        ...voucher,
                                        Icon: item.Icon,
                                    });
                                }
                            })
                        );

                        if (!voucherArray.length) {
                            const voucherIndex = _.findIndex(array[i]?.methods, method =>
                                method.POSSName.toLowerCase() === VOUCHER_PAYMENT_POSSName
                            );

                            if (voucherIndex > -1) {
                                array[i].methods[voucherIndex].selection = 0;
                            }

                            willSuffice = false;
                            this.setState({
                                alertVisibilty: true,
                                alertMessage: NO_VOUCHERS_WARNING,
                                alertTitle: ''
                            });
                            // alert(NO_VOUCHERS_WARNING)
                        }
                    }
                    // Redeemable Amount
                    if (array[i].methods[x].POSSName.toLowerCase() === WALLET_PAYMENT_CODE && vouchersWillSuffice) {
                        array[i].methods[x].selection = 0
                        this.setState({
                            alertVisibilty: true,
                            alertMessage: VOUCHERS_WILL_SUFFICE_WARNING,
                            alertTitle: ''
                        })
                    }
                }
            }
        }

        // console.log('isRedeemable', isRedeemable);
        // console.log('isVoucher', isVoucher);

        if (!isVoucher) {
            totalOfVouchers = 0;
            selectedVoucherArray = [];
        }

        this.setState({
            selectedVoucherArray,
            totalOfVouchers: isVoucher ? totalOfVouchers : 0,
            vouchersWillSuffice:
                willSuffice || totalOfVouchers > this.props.totalAmount,
            paymentMethodsArray: array
        })
    }

    componentWillReceiveProps(nextProps) {

        if(!isEmpty(nextProps.error_messages) && nextProps.error_messages!==undefined)
        {
            let message= ''
            Object.keys(nextProps.error_messages).map(data=>{
                message = message+nextProps.error_messages[data]+'\n'
            })
            this.setState({
                alertVisibilty: true,
                alertMessage: message,
                alertTitle: 'OH NO!'
            })
            this.props.removeErrorMessage()
            return true
        }
        if (nextProps.provincesCities && nextProps.provincesCities.length > 0) {
            this.setState({
                provincesCitiesArray: this.setNewAttributesInaddressTypesArray(
                    nextProps.provincesCities
                )
            })
        }
        if (nextProps.cartItemsArray && nextProps.cartItemsArray.length > 0) {
            this.setState({
                cartItemsArray: nextProps.cartItemsArray
            })
        }

        if (nextProps.paymentMethods && nextProps.paymentMethods.length > 0) {
            this.setState({
                paymentMethodsArray: this.setNewAttributesINpaymentMethodsArray(
                    nextProps
                )
            })
        }
        if (
            nextProps.specialInstructions &&
            nextProps.specialInstructions.length > 0
        ) {
            if (this.instructionDetailsIndex == 0) {
                var inscttArray = _.cloneDeep(nextProps.specialInstructions)
                this.setState({
                    specialInstructionsArray: this.setSelectionParamINArrayOBJECTForRadioButtonsForInstruction(
                        inscttArray
                    )
                })
            }
            this.instructionDetailsIndex++
        }
        if (nextProps.disabledItems !== this.state.disabledItems) {
            this.setState({
                disabledItems: nextProps.disabledItems,
            });
        }
        if (
            nextProps.addedDeliveryAddresseID !== this.props.addedDeliveryAddresseID
        ) {
            var array = []
            if (nextProps.userAddresses) {
                array = nextProps.userAddresses
            }

            const selectedAddress = this.state.addressTypesArray.filter(
                obj => obj.selection == 1
            )

            array.push({
                ID: nextProps.addedDeliveryAddresseID.toString(),
                Name: this.state.name,
                selection: 0,
                Line1: this.state.building,
                Line2: this.state.street,
                AptNumber: this.state.floor,
                TypeID: selectedAddress[0] ? selectedAddress[0].ID : 1,
                Company: this.state.company,
                CloseHours: '00:35:00',
                OpenHours: '08:00:00'
            })

            // console.log('nextProps.addedDeliveryAddresseID', array, nextProps.addedDeliveryAddresseID);
            this.setState(
                { deliveryAddressArray: array },
                this.props.getAddressTypes
            )
        } else {
            const hasAddress =
                nextProps.userAddresses && nextProps.userAddresses.length > 0
            if (hasAddress) {
                // get current selection of addresses
                const { deliveryAddressArray } = this.state
                const selectedAddress = this.getAddressSelectionInArray(
                    deliveryAddressArray
                )

                // now mark the selected address in the new address data
                const { selectedAddressIndex } = this.state
                nextProps.userAddresses = this.selectAddressInArray(
                    nextProps.userAddresses,
                    selectedAddress ? selectedAddress.ID : selectedAddressIndex || 0 // nextProps.userAddresses[0].ID
                )

              
                // only update if there is data to update with
                this.setState({ deliveryAddressArray: nextProps.userAddresses })
            } else {
                this.setState({ deliveryAddressArray: [] })
            }
        }

        if (nextProps.addressTypes && nextProps.addressTypes.length > 0) {
            this.setState({
                addressTypesArray: this.setSelectionParamINArrayOBJECTForRadioButtons(
                    nextProps.addressTypes
                )
            })
        }

        if (
            this.props.orderStatus !== nextProps.orderStatus &&
            nextProps.orderStatus === 'failed'
        ) {
            setTimeout(
                () => {
                    this.setState({
                        alertVisibilty: true,
                        alertMessage: 'OH NO! There seems to be a problem placing your order. Contact our support team.',
                        alertTitle: 'WHOOPS!'
                    })
                }
                ,
                1e3
            )
        } else {
            const { onlineOrderId } = this.state
            const { OrderId } = nextProps.orderStatus
            const Url = nextProps?.orderStatus?.Payments?.OnlinePayment?.Url
            if (
                nextProps.orderTimestamp > this.props.orderTimestamp &&
                onlineOrderId
            ) {
                // there was a processed order
                console.log('RUNNING goToPostPaymentWebView')
                if (Url) this.goToPostPaymentWebView(OrderId, Url)
                else this.concludeOnlineTransaction(OrderId)
            }
        }
    }

    concludeOnlineTransaction(OrderId) {
        Actions.myorders({ viewFirstOrder: String(OrderId) })
    }

    selectAddressInArray(arrayToMakeSelection, idToSelectBy) {
        // select the address by ID
        for (let a = 0; a < arrayToMakeSelection.length; a++) {
            const { ID } = arrayToMakeSelection[a]
            arrayToMakeSelection[a].selection = idToSelectBy === ID ? 1 : 0
        }
        return arrayToMakeSelection
    }

    getAddressSelectionInArray(arrayToGetSelection) {
        // select the address by ID
        let selectedAddress = false
        for (let a = 0; a < arrayToGetSelection.length; a++) {
            const { selection } = arrayToGetSelection[a]
            if (selection === 1) {
                selectedAddress = arrayToGetSelection[a]
                break
            }
        }
        return selectedAddress
    }

    setNewAttributesInaddressTypesArray(provincesCitiesArray) {
        var array = []
        for (var i = 0; i < provincesCitiesArray.length; i++) {
            for (var j = 0; j < (provincesCitiesArray[i].Cities || []).length; j++) {
                provincesCitiesArray[i].Cities[j]['selection'] = 0
                provincesCitiesArray[i].Cities[j]['key'] = j
                provincesCitiesArray[i].Cities[j]['label'] =
                    provincesCitiesArray[i].Cities[j].CityName
                provincesCitiesArray[i].Cities[j]['displayName'] =
                    provincesCitiesArray[i].Cities[j].CityName

                array.push(provincesCitiesArray[i].Cities[j])
            }
        }
        // sort array
        array.sort(function (a, b) {
            var textA = a.label.toUpperCase()
            var textB = b.label.toUpperCase()
            return textA < textB ? -1 : textA > textB ? 1 : 0
        })

        return array
    }

    setSelectionParamINArrayOBJECTForRadioButtonsForInstruction(array) {
        for (var i = 0; i < array.length; i++) {
            array[i]['selection'] = 0
            if (array[i].Details) {
                var detailArrya = []
                for (var j = 0; j < array[i].Details.length; j++) {
                    var objec = { data: array[i].Details[j], selection: 0 }

                    detailArrya.push(objec)
                }
                array[i].Details = detailArrya
                detailArrya = []
            }
        }
        // console.log('array==', array);
        return array
    }

    setSelectionParamINArrayOBJECTForRadioButtons(array) {
        var detailArrya = []
        for (var i = 0; i < array.length; i++) {
            array[i]['selection'] = 0
        }
        return array
    }

    setNewAttributesINpaymentMethodsArray(props) {
        const { paymentMethods: array, totalAmount } = props

        let walletPayments = {
            methods: []
        };

        for (let i = 0; i < array.length; i++) {
            const POSSName = array[i]['POSSName'].toLowerCase();

            array[i]['selection'] = 0;
            array[i]['Amount'] = 0;

            if (POSSName === CASH_PAYMENT_POSSNAME) {
                array[i]['selection'] = 1;
                array[i]['Amount'] = totalAmount;
            }

            if (POSSName.toLowerCase() === WALLET_PAYMENT_CODE) {
                array[i]['Amount'] = totalAmount;
            }

            if (array[i]['HeaderLabel']) {
                walletPayments['POSSName'] = WALLET_PAYMENT_CODE;
                walletPayments['Label'] = array[i].HeaderLabel;
                walletPayments['selection'] = 0;
                walletPayments.methods.push(array[i]);
            }

            if (walletPayments.methods.length) {
                const walletIndex = _.findIndex(walletPayments.methods, (value) =>
                    value.POSSName.toLowerCase() === WALLET_PAYMENT_CODE
                );
                const voucherIndex = _.findIndex(walletPayments.methods, (value) =>
                    value.POSSName.toLowerCase() === VOUCHER_PAYMENT_POSSName
                );

                if (walletIndex > -1) {
                    if (voucherIndex > -1) {
                        walletPayments.methods[voucherIndex].selection = 0;
                    }
                    walletPayments.methods[walletIndex].selection = 1;
                } else {
                    if (voucherIndex > -1) {
                        walletPayments.methods[voucherIndex].selection = 1;
                    }
                }
            }

            if (POSSName == ONLINE_PAYMENT_POSSNAME) {
                // set the first selected currency for online payments
                // console.log('CURRENCIES METHOD', array[i].details)
                const { currencies = [] } = array[i] || {}

                this.setState({
                    selectedCurrency: currencies && currencies[0] ? currencies[0] : DefaultSelectedCurrency
                })
            }
        }

        // Remove wallet and voucher and set its combined array instead in PaymentsMethods array
        const formattedPaymentMethods = array.filter((item) => item.HeaderLabel === null);
        formattedPaymentMethods.push(walletPayments);

        // console.log('formattedPaymentMethods', formattedPaymentMethods);

        return formattedPaymentMethods;
    }

    setTotalAmount(amount) {
        // this.setState({totalAmount:amount})
    }

    parseNotesDescription() {
        const { specialInstructions = [], notesDescription } = this.props
        return notesDescription || strings.NOTES_DESCRIPTION
    }

    getRedeemableView(RedeemAableObject) {
        return (
            <View style={{ flex: 1, marginTop: IF_OS_IS_IOS ? 0 : 0 }}>
                <View style={[styles.timeInnerViewStyle, styles.walletinnerviewStyle]}>
                    <View
                        style={[
                            styles.amountViewstyle,
                            { marginTop: IF_OS_IS_IOS ? -10 : -5 }
                        ]}>
                        <View style={styles.amountInnerViewstyle}>
                            <Text
                                allowFontScaling={FONT_SCALLING}
                                style={styles.itemQuanityTextStyle}>
                                {strings.AMOUNT_COLON}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.priceViewStyle, { marginStart: 120, marginTop: IF_OS_IS_IOS ? -10 : -5 }]}>
                        <View style={styles.amountInnerViewstyle}>
                            <Text
                                allowFontScaling={FONT_SCALLING}
                                style={styles.itemQuanityTextStyle}>
                                {numberWithCommas(
                                    this.props.RedeemableAmountBalance ?
                                        this.props.RedeemableAmountBalance :
                                        this.props.userWalletAmount,
                                    this.props.currency
                                )}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.timeInnerViewStyle, styles.walletinnerviewStyle, { marginStart: 18 }]}>
                    <View
                        style={[
                            styles.amountViewstyle,
                            { marginTop: IF_OS_IS_IOS ? -10 : -10, justifyContent: 'flex-start' }
                        ]}>
                        <View style={[styles.amountInnerViewstyle, { justifyContent: 'flex-start' }]}>
                            <Text
                                allowFontScaling={FONT_SCALLING}
                                style={[styles.itemQuanityTextStyle]}>
                                {/* AMOUNT CHOSEN: */}
                                {RedeemAableObject.Label}:
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.priceViewStyle, { marginStart: 8 }]}>
                        {/* {IF_OS_IS_IOS ? ( */}
                        <View style={[styles.amountInnerViewstyle]}>
                            <View
                                style={[
                                    styles.quantityViewStyle,
                                    styles.redeemableVoucherStyle,
                                    { borderRadius: 7 }
                                ]}>
                                <Common.SlimInput
                                    returnKeyType='done'
                                    keyboardType='phone-pad'
                                    onBlur={this.onBlurTextView}
                                    placeholder={'ENTER AMOUNT'}
                                    placeholderTextColor={TEXT_INPUT_PLACEHOLDER_COLOR}
                                    value={
                                        RedeemAableObject.Amount
                                            ? RedeemAableObject.Amount.toString()
                                            : ''
                                    }
                                    onFocus={this.clearError}
                                    style={styles.redeemableAmountInput}
                                    onChangeText={value =>
                                        this.setRedeemAableAmountInPaymentArray(value)
                                    }
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    onBlurTextView = event => {
       
    };

    setRedeemAableAmountInPaymentArray(amount) {
        // console.log('set redeemable amount in array', amount);
        const { selectedVoucherArray } = this.state
        const { totalAmount, userWalletAmount } = this.props
        const walletAmount = parseInt(userWalletAmount)
        const totalAmountOfVouchers = this.getTotalAmountOfVouchers(
            selectedVoucherArray
        )

        if (amount <= walletAmount) {
            // have enough in wallet
            const array = this.state.paymentMethodsArray
            const remainingAmount = totalAmount - amount - totalAmountOfVouchers
            const hasOnlineSelected = this.ifOtherMethodeIsOnline()
            const isRemainingLessThanMin = remainingAmount < this.props.minimumOnlinePayment
            const remainingMinusMin =
                totalAmount - this.props.minimumOnlinePayment - totalAmountOfVouchers
            const isOnlineLessThanMin = hasOnlineSelected && isRemainingLessThanMin
            let redeemableAmount = isOnlineLessThanMin
                ? remainingMinusMin < 0
                    ? 0
                    : remainingMinusMin
                : totalAmount >= amount
                    ? amount
                    : totalAmount
            const otherAmount = totalAmount - redeemableAmount
            const voucherLessOtherAmount = totalAmount - totalAmountOfVouchers

            if (parseInt(totalAmountOfVouchers) + parseInt(redeemableAmount) >= parseInt(totalAmount)) {
                this.setPaymentMethodSelectionBy(WALLET_PAYMENT_CODE, 0);
            }

            // in case of a voucher selection
            if (
                totalAmountOfVouchers &&
                redeemableAmount &&
                voucherLessOtherAmount < redeemableAmount
            ) {
                this.setState({
                    alertVisibilty: true,
                    alertMessage: 'Redeemable Amount cannot be more than the remaining balance.',
                    alertTitle: 'WHOOPS!'
                })
                redeemableAmount = voucherLessOtherAmount
            }

            if (isOnlineLessThanMin) {
                this.setState({
                    alertVisibilty: true,
                    alertMessage: MINIMUM_ONLINE_PAYMENT_WARNING(this.props.minimumOnlinePayment, this.props.currency),
                    alertTitle: 'WHOOPS!'
                })
            }

            for (let i = 0; i < array.length; i++) {
                if (array[i].selection == 1) {
                    // only address selected methods
                    if (array[i].POSSName == WALLET_PAYMENT_CODE) {
                        // if this is reedeemable amount
                        array[i].Amount = parseInt(redeemableAmount) + parseInt(totalAmountOfVouchers);
                        array[i].methods[1].Amount = parseInt(redeemableAmount);

                    } else {
                        // set other selection to the remaining amount
                        array[i].Amount = remainingAmount
                    }
                }
            }
            if (otherAmount < this.props.minimumOnlinePayment && hasOnlineSelected) {
                // deselect online amount | this logic should never run if so, something is broken
                this.setPaymentMethodSelectionBy(ONLINE_PAYMENT_POSSNAME, 0)
                this.setState({
                    alertVisibilty: true,
                    alertMessage: MINIMUM_ONLINE_PAYMENT_WARNING(this.props.minimumOnlinePayment, this.props.currency),
                    alertTitle: 'WHOOPS!'
                })
                redeemableAmount = 0
            }
            this.setState({
                paymentMethodsArray: array,
                totalOfRedeemable: redeemableAmount
            })
        } else {
            this.setState({
                alertVisibilty: true,
                alertMessage: `Your total wallet amount is ${walletAmount}`,
                alertTitle: '',
            });
        }
    }

    getVouchersView() {
        let { totalOfVouchers, totalOfRedeemable } = this.state;

        let totalWalletPrice =
            parseInt(totalOfVouchers);
        let { totalAmount } = this.props

        return (
            <View style={styles.vouchersContainer}>
                <VouchersHelper
                    vouchers={this.props.Vouchers}
                    totalAmount={totalAmount}
                    totalWalletPrice={totalWalletPrice}
                    fromDelivery
                    fromdine={false}
                    setSelectedVoucherArray={this.setSelectedVoucherArray}
                />
                <Text
                    allowFontScaling={FONT_SCALLING}
                    style={[
                        styles.itemQuanityTextStyle,
                        { color: APP_COLOR_WHITE, alignSelf: 'center', marginBottom: 15 }
                    ]}>
                    {strings.MIX_AND_MATCH_VOUCHERS_AS_YOU_PLEASE}
                </Text>
            </View>
        )
    }

    getWalletView(object) {
        const redeemIndex = _.findIndex(object.methods, (value) =>
            value.POSSName.toLowerCase() === REDEEMABLE_PAYMENT_POSSName
        );
        const voucherIndex = _.findIndex(object.methods, (value) =>
            value.POSSName.toLowerCase() === VOUCHER_PAYMENT_POSSName
        );
        return object.selection == 1 ? (
            <View style={{ backgroundColor: APP_COLOR_BLACK, marginTop: 10, marginBottom: -12 }}>
                <View
                    style={[
                        styles.addressBarViewStyle,
                        {
                            height: 50,
                            flexDirection: 'row',
                            borderBottomWidth: 2,
                            borderColor: APP_COLOR_WHITE,
                            flex: 1,
                        }
                    ]}>
                    <View
                        style={[
                            {
                                backgroundColor: APP_COLOR_BLACK,
                                marginStart: 30,
                                borderWidth: 0,
                                flex: 1,
                                flexDirection: 'row',
                            }
                        ]}>

                        {
                            object.methods.map((method, index) => {
                                return (
                                    <TouchableOpacity
                                        key={index.toString()}
                                        onPress={() => this.selectWalletOptions(index, method.POSSName)}
                                        style={{
                                            flex: index == 0 ? 0 : 1,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                            marginStart: index == 1 ? 15 : 0,
                                        }}>
                                        <View
                                            style={[
                                                method.selection == 0
                                                    ? [styles.unslectedDotColor]
                                                    : [styles.selectedDotColor],
                                                {
                                                    justifyContent: 'flex-start'
                                                }
                                            ]}
                                        />
                                        <Text
                                            allowFontScaling={FONT_SCALLING}
                                            style={[
                                                styles.itemQuanityTextStyle,
                                                {
                                                    justifyContent: 'flex-start',
                                                    color: APP_COLOR_WHITE,
                                                    marginStart: 0,
                                                    paddingHorizontal: 10
                                                }
                                            ]}>
                                            {method.Label}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                </View>
                {
                    voucherIndex > -1 && object.methods[voucherIndex]?.selection == 1 && this.getVouchersView()
                }
                {
                    redeemIndex > -1 && object.methods[redeemIndex]?.selection == 1 &&
                    this.getRedeemableView(object.methods[redeemIndex])
                }
            </View>
        ) : null
    }

    editAddress(index, rowObj) {
        const selectedObj = this.state.provincesCitiesArray.filter(
            obj => obj.Id == rowObj.CityId
        )

        var array = this.state.addressTypesArray

        for (var i = 0; i < array.length; i++) {
            if (array[i].ID == rowObj.TypeID) {
                array[i].selection = 1
            } else {
                array[i].selection = 0
            }
        }

        this.setState({
            showNewAddress: false,
            name: rowObj.Name,
            building: rowObj.Line1,
            street: rowObj.Line2,
            showEditOrderView: true,
            selectedCityObject: selectedObj[0],
            selectedCity: selectedObj[0] ? selectedObj[0].label : 'Select City',
            addressTypesArray: array,
            editedAddressID: rowObj.ID,
            floor: rowObj.AptNumber,
            company: rowObj.CompanyName
        })
    }

    getAddressRow(rowObj, i, selectionName) {
        const { BranchStatus } = rowObj
        const BranchActive = BranchStatus !== 'inactive'
        return (
            <View>
                <View style={[styles.itemQuanityRowStyle]}>
                    <TouchableOpacity
                        onPress={() => this.selectItem(i, selectionName)}
                        style={[
                            styles.getRowtouchStyle,
                            BranchActive ? {} : styles.AddressInactive
                        ]}>
                        <View style={styles.itemselectionOuterStyle}>
                            <View
                                style={[
                                    styles.selectionDot,
                                    rowObj.selection == 1 ? styles.selectedDot : {}
                                ]}
                            />
                            <Text
                                allowFontScaling={FONT_SCALLING}
                                style={styles.itemQuanityTextStyle}>
                                {rowObj.Name}
                                {BranchActive ? null : ` (${BranchStatus})`}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => this.editAddress(i, rowObj)}
                        style={styles.editTouchStyle}>
                        <Text
                            allowFontScaling={FONT_SCALLING}
                            style={styles.editAddressTextStyle}>
                            Edit
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    getInstructionsInnerRow(obj) {
        return (
            <View style={[styles.itemQuanityRowStyle]}>
                <TouchableOpacity style={styles.getRowtouchStyle}>
                    <View style={styles.itemselectionOuterStyle}>
                        <Text
                            allowFontScaling={FONT_SCALLING}
                            style={styles.itemQuanityTextStyle}>
                            {selectionName == strings.INSTRUCTIONS && rowObj.Title}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    setInstructionArrayDetailsSelection(i, j) {
        var array = this.state.specialInstructionsArray
        for (var x = 0; x < array[i].Details.length; x++) {
            array[i].Details[x].selection = 0
        }

        array[i].Details[j].selection = 1

        this.setState({ specialInstructionsArray: array })
    }

    getRow(rowObj, i, selectionName) {
        const ranKey = Math.random()
        const {
            Icons,
            Interactive,
            Style: {
                color, // : "#1a8c1b"
                background, // : "#ffffff"
                bold, // : true
                italic, // : true
                underlined, // : true
                size // : "18.0"
            }
        } = rowObj
        const isInteractive = Boolean(Interactive)
        const { Url, width, height } = Icons || { width: 40, height: 20 }
        const imageStyle = {
            width: Number(width),
            height: Number(height)
        }
        const imageSource = {
            uri: Url
        }
        // console.log('IMAGE SOURCE', Icons)
        const isDummy = String(Url).match('contacless-delivery.png')
        const hasImage = Url && width && height && !isDummy
        const customBaseStyle = {}
        const customTextStyle = {}
        if (background && background !== 'transparent') {
            customBaseStyle.backgroundColor = background
            customBaseStyle.paddingLeft = 10
        }
        if (bold) customTextStyle.fontWeight = 'bold'
        if (italic) customTextStyle.fontStyle = 'italic'
        if (underlined) customTextStyle.textDecorationLine = 'underline'
        if (size) customTextStyle.fontSize = parseInt(size - 4)

        const labelDisplay = hasImage ? (
            <CachedImage
                source={imageSource}
                style={[styles.instructionIcon, imageStyle]}
                resizeMode='contain'
            />
        ) : (
                <View style={[styles.instructionBase, customBaseStyle]}>
                    <Text
                        allowFontScaling={FONT_SCALLING}
                        style={[styles.instructionLabel, customTextStyle]}>
                        {selectionName == strings.INSTRUCTIONS && rowObj.Title}
                        {selectionName == strings.PAYMENT_METHOD &&
                            rowObj.Label}
                    </Text>
                </View>
            )

        // console.log('instruction row customTextStyle', customTextStyle)
        return (
            <View key={`${i}${ranKey}${selectionName}`}>
                <View style={[styles.itemQuanityRowStyle]}>
                    {!isInteractive ? (
                        labelDisplay
                    ) : (
                            <TouchableOpacity
                                onPress={() => this.selectItem(i, selectionName)}
                                style={styles.getRowtouchStyle}>
                                <View style={styles.itemselectionOuterStyle}>
                                    {rowObj.selection == 1 && (
                                        <View style={[styles.dotStyale, styles.selectedDotColor]} />
                                    )}
                                    {rowObj.selection == 0 && (
                                        <View style={[styles.dotStyale, styles.unslectedDotColor]} />
                                    )}
                                    {labelDisplay}
                                </View>
                            </TouchableOpacity>
                        )}
                </View>

                {(!isInteractive || rowObj.selection == 1) &&
                    rowObj.Details &&
                    rowObj.Details.map((obj, j) => (
                        <View key={j} style={styles.instructionRow}>
                            <TouchableOpacity
                                onPress={() => this.setInstructionArrayDetailsSelection(i, j)}
                                style={{ flexDirection: 'row' }}>
                                {obj.selection == 1 && (
                                    <View style={[styles.dotStyale, styles.selectedDotColor]} />
                                )}
                                {obj.selection == 0 && (
                                    <View style={[styles.dotStyale, styles.unslectedDotColor]} />
                                )}

                                <Text
                                    allowFontScaling={FONT_SCALLING}
                                    style={[styles.itemQuanityTextStyle, { marginTop: -1 }]}>
                                    {obj.data.Name}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
            </View>
        )
    }

    setCardsHolderRef = ref => {
        this.cardsHolder = ref
    };

    getCardSelection() {
        return (this.cardsHolder && this.cardsHolder.getCardSelection()) || {}
    }

    renderCardHolder() {
        const { checkoutTokens: creditCards } = this.props
        const {
            componentTheme: { thirdColor },
            selectedCurrency: { Currency: CurrencyType }
        } = this.state
        return (
            <CardsHolder
                ref={this.setCardsHolderRef}
                color={APP_COLOR_WHITE}
                cards={creditCards}
                selectedCurrency={CurrencyType}
                deleteCard={this.handleDeleteCard}
            />
        )
    }

    handleDeleteCard = (id) => {
        this.props.deleteCreditCard(id);
    }
    handleSetCurrency = CurrencyObject => {
        this.setState({
            selectedCurrency: CurrencyObject
        })
    };

    renderCurrencyOptions(currencies) {
        return currencies.map((CurrencyObject, i) => {
            const { Currency } = CurrencyObject
            const {
                selectedCurrency: { Currency: CurrencyType },
                componentTheme: { thirdColor }
            } = this.state
            const isCurrencySelected = Currency === CurrencyType
            return (
                <CurrencySelection
                    key={i}
                    CurrencyObject={CurrencyObject}
                    Currency={Currency}
                    setCurrency={this.handleSetCurrency}
                    isSelected={isCurrencySelected}
                // color={thirdColor}
                />
            )
        })
    }

    getPaymentRow(rowObj, i, selectionName) {
        const {
            Amount,
            selection,
            Currencies = [],
            POSCode,
            POSSName,
            Label
        } = rowObj
        const isSelected = selection == 1
        const isCashPayment = POSSName.toLowerCase() == CASH_PAYMENT_POSSNAME
        const isOnlinePayment = POSSName.toLowerCase() == ONLINE_PAYMENT_POSSNAME
        const isWalletPayment = POSSName.toLowerCase() == WALLET_PAYMENT_CODE
        const shouldRenderCashInput =
            isCashPayment && isSelected && this.ifOtherMethodeIsOnline()
        const shouldRenderCards = isSelected && isOnlinePayment
        const hasCurrencies = Currencies && Currencies.length
        return (
            <View
                style={[
                    styles.itemQuanityRowStyle,
                    { justifyContent: 'flex-start' },
                    isOnlinePayment ? styles.onlineStyle : {}
                ]}>
                <TouchableOpacity
                    onPress={() => this.selectPaymentOptions(i, selectionName, rowObj)}
                    style={[styles.getRowtouchStyle, { marginRight: 7 }]}>
                    <View style={styles.itemselectionOuterStyle}>
                        <View
                            style={[
                                styles.dotStyale,
                                styles[isSelected ? 'selectedDotColor' : 'unslectedDotColor']
                            ]}
                        />
                        <Text
                            allowFontScaling={FONT_SCALLING}
                            style={styles.itemQuanityTextStyle}>
                            {Label}
                        </Text>
                        {isWalletPayment ? (
                            <Image
                                style={[
                                    styles.paymentArrowStyle,
                                    isSelected ? styles.paymentArrowDownStyle : {}
                                ]}
                                source={RIGHT_ARROW_LARGE_WHITE}
                            />
                        ) : null}
                        {isSelected && hasCurrencies
                            ? this.renderCurrencyOptions(Currencies)
                            : null}
                    </View>
                </TouchableOpacity>
                {shouldRenderCashInput && (
                    <CommonInputSmall
                        placeholder={`Enter amount in ${this.props.currency}`}
                        value={Amount ? Amount.toString() : '0'}
                        onFocus={this.clearError}
                        keyboardType='phone-pad'
                        returnKeyType='done'
                        onChangeText={value => this.setCashAmountInPaymentArray(value)}
                        textStyle={{ width: 150, alignSelf: 'flex-start' }}
                    />
                )}
                {/* FOR ONLINE */}
                {shouldRenderCards && this.renderCardHolder()}
            </View>
        )
    }

    ifOtherMethodeIsOnline() {
        const filterArray = this.state.paymentMethodsArray.filter(
            obj => obj.POSSName && obj.POSSName.toLowerCase() !== CASH_PAYMENT_POSSNAME && obj.selection == 1
        )
        if (filterArray[0]?.POSSName.toLowerCase() == ONLINE_PAYMENT_POSSNAME) return true
        else return false
    }

    setCashAmountInPaymentArray(amount) {
        const { totalAmount } = this.props
        const array = this.state.paymentMethodsArray
        const remainingAmount = totalAmount - amount
        const hasOnlineSelected = this.ifOtherMethodeIsOnline()
        const isRemainingLessThanMin = remainingAmount < this.props.minimumOnlinePayment
        const remainingMinusMin = totalAmount - this.props.minimumOnlinePayment
        const isOnlineLessThanMin = hasOnlineSelected && isRemainingLessThanMin
        const cashAmount = isOnlineLessThanMin
            ? remainingMinusMin < 0
                ? 0
                : remainingMinusMin
            : amount
        const otherAmount = totalAmount - cashAmount
        
        // if online is also selected
        if (hasOnlineSelected) {
            // warn
            if (isOnlineLessThanMin) {
                this.setState({
                    extraPopupVisible: true,
                    extraPopupMessage: MINIMUM_ONLINE_PAYMENT_WARNING(this.props.minimumOnlinePayment, this.props.currency)
                });
            }

            if (otherAmount < this.props.minimumOnlinePayment && hasOnlineSelected) {
                // deselect online amount | this logic should never run if so, something is broken
                this.setPaymentMethodSelectionBy(ONLINE_PAYMENT_POSSNAME, 0)
                this.setState({
                    extraPopupVisible: true,
                    extraPopupMessage: MINIMUM_ONLINE_PAYMENT_WARNING(this.props.minimumOnlinePayment, this.props.currency)
                });
            }
        }

        for (var i = 0; i < array.length; i++) {
            if (array[i].selection == 1) {
                if (array[i].POSSName.toLowerCase() == CASH_PAYMENT_POSSNAME) {
                    array[i].Amount = parseInt(cashAmount)
                }
                if (array[i].POSSName.toLowerCase() == ONLINE_PAYMENT_POSSNAME) {
                    array[i].Amount = otherAmount
                }
            }
        }

        this.setState({ paymentMethodsArray: array })
    }

    onPress = (event, caption) => {
        switch (caption) {
            case strings.ADDD_NEW_ADDRESS:
                this.setState({
                    name: '',
                    building: '',
                    street: '',
                    showEditOrderView: false,
                    selectedCityObject: '',
                    selectedCity: 'Select City',
                    showNewAddress: !this.state.showNewAddress,
                    floor: ''
                })

                break

            case CROSS_PRESSED: {
                if (this.state.showEditOrderView == true) {
                    this.setState({ showEditOrderView: false })
                }

                if (this.state.showNewAddress == true) {
                    this.setState({ showNewAddress: false })
                }
            }
                break

            case strings.SAVE_ADDRESS:
                if (!this.validateUserInputs()) {
                    this.saveNewAddresstoServer()
                }
                break

            case strings.THATS_IT:
                if (this.goodToGo(true)) {
                    const { deliveryAddressArray, cartItemsArray } = this.state
                    const deliveryAddress = deliveryAddressArray
                        .filter(obj => obj.selection == 1)
                        .pop()
                    if (deliveryAddress.DepartmentStatus !== 'inactive') {
                        const {
                            // cartItemsArray,
                            totalAmount,
                            currency,
                            FullName,
                            subTotal,
                            cartDiscounts
                        } = this.props
                        const { paymentCache } = this
                        const confirmationData = {
                            FullName,
                            currency,
                            cartItemsArray,
                            subTotal,
                            totalAmount,
                            deliveryAddress,
                            paymentCache,
                            cartDiscounts
                        }

                        // only show popup if order is validated
                        this.setState({
                            confirmationData,
                            visibilty: true
                        })
                    } else {
                        this.setState({
                            alertVisibilty: true,
                            alertMessage: 'Please select another address',
                            alertTitle: ''
                        })
                        // alert('Please select another address')
                    }
                }
                break
            case strings.DELIVERY_DETAILS:
                Actions.yourcart()
                break

            default:
        }
    };

    goToPaymentWebView(amount, paymentFormDataParams, paymentID) {
        const expressPayment = this.getCardSelection()

        Actions.paymentview({
            submitTransaction: this.props.putOrder,
            returnView: 'yourcart',
            origin: 'deliverydetails',
            onlineAmount: amount,
            paymentFormDataParams: paymentFormDataParams,
            orderID: paymentID,
            paymentKey: 'OnlineId',
            expressPayment
        })
    }

    goToPostPaymentWebView(OrderId, PaymentURL) {
        const { onlineOrderId, onlineTotal, expressPayment } = this.state
        // console.log('RUNNING ', onlineOrderId, onlineTotal, expressPayment)
        Actions.paymentview({
            returnView: 'ourmenu',
            successView: 'myorders',
            url: PaymentURL,
            OrderId
        })
    }

    validatePaymentsParams() {
        const filterArray = this.state.paymentMethodsArray.filter(
            obj => obj.selection == 1
        )
        const arrayOfPaymentsCashAndOnline = filterArray.filter(
            obj =>
                obj.POSSName.toLowerCase() == ONLINE_PAYMENT_POSSNAME || obj.POSSName.toLowerCase() == CASH_PAYMENT_POSSNAME
        )

        const walletArray = filterArray.filter(
            obj => obj.POSSName == WALLET_PAYMENT_CODE
        )

        if (filterArray.length == 0) {
            this.setState({
                extraPopupVisible: true,
                extraPopupMessage: 'Select at least one payment method'
            });
            return false
        } else if (filterArray.length == 1) {
            for (var i = 0; i < this.state.paymentMethodsArray.length; i++) {
                if (this.state.paymentMethodsArray[i].POSSName == WALLET_PAYMENT_CODE) {

                    if (this.state.paymentMethodsArray[i].selection == 1) {
                        const redeemIndex = _.findIndex(this.state.paymentMethodsArray[i].methods, (value) =>
                            value.POSSName.toLowerCase() === REDEEMABLE_PAYMENT_POSSName
                        );
                        const voucherIndex = _.findIndex(this.state.paymentMethodsArray[i].methods, (value) =>
                            value.POSSName.toLowerCase() === VOUCHER_PAYMENT_POSSName
                        );
                        if (
                            redeemIndex > -1 && this.state.paymentMethodsArray[i].methods[redeemIndex].selection == 1 &&
                            voucherIndex > -1 && this.state.paymentMethodsArray[i].methods[voucherIndex].selection == 1
                        ) {
                            if (
                                isNaN(this.state.paymentMethodsArray[i].methods[redeemIndex].Amount) ||
                                this.state.paymentMethodsArray[i].methods[redeemIndex].Amount == 0
                            ) {
                                this.setState({
                                    alertVisibilty: true,
                                    alertMessage: 'Invalid redeemable amount',
                                    alertTitle: 'WHOOPS!'
                                })
                                return false
                            }
                            if (this.state.selectedVoucherArray.length == 0) {
                                this.setState({
                                    alertVisibilty: true,
                                    alertMessage: 'Select vouchers',
                                    alertTitle: 'Oh!'
                                })
                                return false
                            } else if (
                                parseInt(this.state.paymentMethodsArray[i].methods[redeemIndex].Amount) +
                                this.getTotalAmountOfVouchers(
                                    this.state.selectedVoucherArray
                                ) <
                                this.props.totalAmount
                            ) {
                                this.setState({
                                    alertVisibilty: true,
                                    alertMessage: 'Wallet total amount is less then total bill',
                                    alertTitle: 'WHOOPS!'
                                })
                                return false
                            } else {
                                return true
                            }
                        } else if (
                            this.state.paymentMethodsArray[i].methods[redeemIndex].selection == 1
                        ) {
                            if (
                                isNaN(this.state.paymentMethodsArray[i].methods[redeemIndex].Amount) ||
                                this.state.paymentMethodsArray[i].methods[redeemIndex].Amount == 0
                            ) {
                                this.setState({
                                    alertVisibilty: true,
                                    alertMessage: 'Invalid redeemable amount',
                                    alertTitle: 'WHOOPS!'
                                })
                                return false
                            } else if (
                                this.state.paymentMethodsArray[i].methods[redeemIndex].Amount <
                                this.props.totalAmount
                            ) {
                                this.setState({
                                    alertVisibilty: true,
                                    alertMessage: 'Redeemable amount is less then total bill',
                                    alertTitle: 'WHOOPS!'
                                })
                                return false
                            } else if (
                                this.state.paymentMethodsArray[i].methods[redeemIndex].Amount >
                                this.props.totalAmount
                            ) {
                                this.setState({
                                    alertVisibilty: true,
                                    alertMessage: 'Your entered amount is more then total bill',
                                    alertTitle: 'WHOOPS!'
                                })
                                return false
                            } else {
                                return true
                            }
                        } else if (
                            this.state.paymentMethodsArray[i].methods[voucherIndex].selection == 1
                        ) {
                            if (this.state.selectedVoucherArray.length == 0) {
                                this.setState({
                                    alertVisibilty: true,
                                    alertMessage: 'Select vouchers',
                                    alertTitle: 'Oh!'
                                })
                                return false
                            } else if (
                                this.getTotalAmountOfVouchers(this.state.selectedVoucherArray) <
                                this.props.totalAmount
                            ) {
                                this.setState({
                                    alertVisibilty: true,
                                    alertMessage: 'Vouchers amount is less the total bill',
                                    alertTitle: 'WHOOPS!'
                                })
                                return false
                            } else {
                                return true
                            }
                        }
                    }
                }
            }
            return true
        } else {
            if (filterArray.length == 2) {
                for (var i = 0; i < this.state.paymentMethodsArray.length; i++) {
                    if (this.state.paymentMethodsArray[i].selection == 1) {
                        if (
                            this.state.paymentMethodsArray[i].POSSName.toLowerCase() == CASH_PAYMENT_POSSNAME
                        ) {
                            if (
                                this.state.paymentMethodsArray[i].Amount >
                                this.props.totalAmount
                            ) {
                                this.setState({
                                    alertVisibilty: true,
                                    alertMessage: 'Your entered amount is more then total bill',
                                    alertTitle: 'WHOOPS!'
                                })
                                return false
                            }
                            if (walletArray.length == 0) {
                                if (
                                    isNaN(this.state.paymentMethodsArray[i].Amount) ||
                                    this.state.paymentMethodsArray[i].Amount == 0
                                ) {
                                    this.setState({
                                        alertVisibilty: true,
                                        alertMessage: 'Invalid cash amount',
                                        alertTitle: 'WHOOPS!'
                                    })
                                    return false
                                }
                            }
                        } else if (
                            this.state.paymentMethodsArray[i].POSSName == WALLET_PAYMENT_CODE
                        ) {
                            const redeemIndex = _.findIndex(this.state.paymentMethodsArray[i].methods, (value) =>
                                value.POSSName.toLowerCase() === REDEEMABLE_PAYMENT_POSSName
                            );
                            if (redeemIndex > -1 && this.state.paymentMethodsArray[i].methods[redeemIndex].selection == 1) {
                                if (
                                    isNaN(this.state.paymentMethodsArray[i].methods[redeemIndex].Amount) ||
                                    this.state.paymentMethodsArray[i].methods[redeemIndex].Amount == 0
                                ) {
                                    this.setState({
                                        alertVisibilty: true,
                                        alertMessage: 'Invalid redeemable amount',
                                        alertTitle: 'WHOOPS!'
                                    })
                                    return false
                                }
                                if (
                                    this.state.paymentMethodsArray[i].methods[redeemIndex].Amount >
                                    this.props.totalAmount
                                ) {
                                    this.setState({
                                        alertVisibilty: true,
                                        alertMessage: 'Your entered amount is more then total bill',
                                        alertTitle: 'WHOOPS!'
                                    })
                                    return false
                                }
                            }

                            const voucherIndex = _.findIndex(this.state.paymentMethodsArray[i].methods, (value) =>
                                value.POSSName.toLowerCase() === VOUCHER_PAYMENT_POSSName
                            );
                            if (voucherIndex > -1 && this.state.paymentMethodsArray[i].methods[voucherIndex].selection == 1) {
                                if (this.state.selectedVoucherArray.length == 0) {
                                    this.setState({
                                        alertVisibilty: true,
                                        alertMessage: 'Select vouchers',
                                        alertTitle: 'Oh!'
                                    })
                                    return false
                                }
                            }
                        }
                    }
                }
                return true
            }
        }
    }

    checkforAddress() {
        if (this.state.deliveryAddressArray.length == 0) {
            this.setState({
                extraPopupVisible: true,
                extraPopupMessage: 'Add new Address'
            });
            return false
        } else {
            const addressarray = this.state.deliveryAddressArray.filter(
                obj => obj.selection == 1
            )
            if (addressarray.length == 0) {
                this.setState({
                    extraPopupVisible: true,
                    extraPopupMessage: 'Select Address'
                });
                return false
            }

            // if address selection is active / inactive
            const { BranchStatus, BranchStatusMsg } = addressarray[0]
            if (BranchStatus === 'inactive') {
                this.setState({
                    showAddressInactivePopUp: true,
                    addressInactiveMessage: BranchStatusMsg
                })
                return false
            }
        }
        return true
    }

    processOrder(formData) {
        this.setState({
            submittingOrder: true
        })
        this.submitEnabler()
        this.props.putOrder(formData)
    }

    formatAMPM(date) {
        let array = date.split(':')
        let hours = array[0];
        let minutes = array[1];
        let ampm = hours >= 12 ? hours >= 24 ? 'am' : 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        let strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    formatEtaTime(time, eta) {
        let hoursArray = time.split(':')
        let hours = parseInt(hoursArray[0])
        let mins = parseInt(hoursArray[1])

        let minInt = parseInt(hoursArray[1], 10) + parseInt(eta, 10)
        if (minInt >= 60) {
            hours = hours + 1
            mins = ((minInt - 60) < 10) ? ('0' + (minInt - 60)) : (minInt - 60)
        } else {
            mins = minInt == 0 ? '00' : minInt
        }
        let hoursString = hours >= 10 ? String(hours) : `0${String(hours)}`;

        return hoursString + ':' + String(mins)
    }

    handleDateFormat = (scheduledOrderTime) => {
        const dateTime = Moment(scheduledOrderTime)
        let day = dateTime.format("Do");
        let month = dateTime.format("MMMM")
        let hours = dateTime.format("LT")

        return `Your order will arrive on the ${day} of ${month} at ${hours}`
    }

    validateAddress() {
        const _selectedAddress = this.getAddressSelectionInArray(
            this.state.deliveryAddressArray
        )
        const isBusiness = _selectedAddress.TypeName == 'Business'

        let InputError = null
        // validate input fields
        if (_selectedAddress) {
          
            const validName = validate('string', _selectedAddress.Name?.trim(), 'Name')
            const inValidCity = validate('string', _selectedAddress.CityCode?.trim(), 'City')
            const validCompany = validate('string', _selectedAddress.CompanyName?.trim(), 'Company')
            const validBuilding = validate('string', _selectedAddress.Line1?.trim(), 'Building')
            const validStreet = validate('string', _selectedAddress.Line2?.trim(), 'Street')
            const validFloor = validate('string', _selectedAddress.AptNumber?.trim(), 'Floor')
            const validProvince = validate('string', _selectedAddress.ProvinceCode?.trim(), 'Province Code')

            if (validName) InputError = validName
            else if (inValidCity) InputError = inValidCity
            else if (isBusiness && validCompany) InputError = validCompany
            else if (validBuilding) InputError = validBuilding
            else if (validStreet) InputError = validStreet
            else if (validFloor) InputError = validFloor
            else if (validProvince) InputError = validProvince
        }

        // validate field lengths
        const noInputErrorSoFar = InputError == null
        if (noInputErrorSoFar) {
            const { validateFieldLength } = this
            const validCompanyLength = validateFieldLength(_selectedAddress.CompanyName || '', 'Company', 29)
            const validNameLength = validateFieldLength(_selectedAddress.Name || '', 'Name', 20)
            const validBuildingLength = validateFieldLength(_selectedAddress.Line1 || '', 'Building', 29)
            const validStreetLength = validateFieldLength(_selectedAddress.Line2 || '', 'Street', 29)
            const validFloorLength = validateFieldLength(_selectedAddress.AptNumber || '', 'Floor', 20)
            const validProvinceLength = validateFieldLength(_selectedAddress.ProvinceCode || '', 'Province Code', 29)

            if (isBusiness && validCompanyLength) InputError = validCompanyLength
            else if (validNameLength) InputError = validNameLength
            else if (validBuildingLength) InputError = validBuildingLength
            else if (validStreetLength) InputError = validStreetLength
            else if (validFloorLength) InputError = validFloorLength
            else if (validProvinceLength) InputError = validProvinceLength
        }

        // set error if any
        this.setState({ error: InputError })

        return InputError
    }

    goodToGo(shouldOnlyValidate) {
        if (!this.checkforAddress()) {
            return
        }
        const validateAddress = this.validateAddress()
        if(validateAddress !== null){
            this.setState({
                alertVisibilty: true,
                alertMessage: validateAddress,
                alertTitle: 'whoops'
            })
            return false
        }
        const { appliedPromos, promoObject } = this.props
        const Promotions = [].concat(appliedPromos)
        // console.log('Promotions', Promotions)
        const arrayOfOrderTime = this.state.orderSchadualDateTimeArray.filter(
            obj => obj.selection == 1
        )
        let orderTime = arrayOfOrderTime.length > 0 && arrayOfOrderTime[0].dateTime
        if (!orderTime) {
            this.setState({
                alertVisibilty: true,
                alertMessage: 'Please select time',
                alertTitle: ''
            })
            return true
        }
        if (this.state.orderSchadualDateTimeArray[0].selection == 1) {
            this.setState({ isScheduled: false })
            // "Wed May 16 2018 07:18:00 GMT+0500 (PKT)"
            if (!this.checkForValidRestaurantTime(new Date(), true, true)) {
                const filterArray = this.state.deliveryAddressArray.filter(
                    obj => obj.selection == 1
                )
                let newText = new String('Sorry we are closed now!\nWe open at OPENING_TIME_DELIVERY_TIME, and we can deliver your first scheduled order at CLOSING_TIME_DELIVERY_TIME. Please re-schedule your order.')
                let etaTime = this.formatEtaTime(filterArray[0].OpenHours || "08:00:00", filterArray[0].DeliveryEta || 35)
                let filteredString1 = newText.replace('OPENING_TIME_DELIVERY_TIME', this.formatAMPM(filterArray[0].OpenHours || "08:00:00"))
                let filteredString2 = filteredString1.replace('CLOSING_TIME_DELIVERY_TIME', this.formatAMPM(etaTime))
                this.setState({ scheduleSubHeadText: filteredString2, scheduleOrderPopUpVisibilty: true })
                return
            }
        } else {
            const selectedAddress = this.getAddressSelectionInArray(
                this.state.deliveryAddressArray
            )
            // add extra minutes if present
            const minimumDate = Moment().add(selectedAddress.DeliveryEta || 0, 'm')
            // Ensure schedule time is never before minimum time
            if (Moment(orderTime) < minimumDate) {
                orderTime = minimumDate.format("YYYY-MM-DD HH:mm:ss")
            }
            if (!this.checkForValidRestaurantTime(orderTime)) {
                // check valid time
                const filterArray = this.state.deliveryAddressArray.filter(
                    obj => obj.selection == 1
                )

                let newText = new String('The branch is closed at your scheduled order time.\nThe first scheduled order is at OPENING_TIME_DELIVERY_TIME, and the last scheduled order is at CLOSING_TIME_DELIVERY_TIME')
                let openEtaTime = this.formatEtaTime(filterArray[0].OpenHours || "08:00:00", filterArray[0].DeliveryEta || 35)
                let closeEtaTime = this.formatEtaTime(filterArray[0].CloseHours || '00:35:00', filterArray[0].DeliveryEta || 35)
                let filteredString1 = newText.replace('OPENING_TIME_DELIVERY_TIME', this.formatAMPM(openEtaTime))
                let filteredString2 = filteredString1.replace('CLOSING_TIME_DELIVERY_TIME', this.formatAMPM(closeEtaTime))

                this.setState({
                    scheduleSubHeadText: filteredString2,
                    scheduleOrderPopUpVisibilty: true,
                    isScheduled: false
                })
                return
            } else {
                this.setState({ scheduledOrderTime: this.handleDateFormat(orderTime), isScheduled: true })
            }
        }

        if (!this.validatePaymentsParams()) {
            return
        }

        var myArray = this.props.mobileNumber.split('')
        var mNumber = []
        for (var i = 0; i < myArray.length; i++) {
            if (i > 2) mNumber.push(myArray[i])
        }
        var date = new Date()
        mNumber = mNumber.join('')
        let formdata = new FormData()
        const addressarray = this.state.deliveryAddressArray.filter(
            obj => obj.selection == 1
        )

        const _selectedAddress = this.getAddressSelectionInArray(
            this.state.deliveryAddressArray
        )

        formdata.append('OrderDate', Moment(date).format('YYYY-MM-DD HH:mm:ss'))
        formdata.append('ScheduleOrder', orderTime.toString())
        formdata.append('AddressId', addressarray[0].ID)
        formdata.append('TotalPrice', this.props.totalAmount)
        formdata.append('Currency', this.props.currency)
        formdata.append('OnlineCurrency', this.props.currency)
        formdata.append('AddressType', _selectedAddress.TypeID)
        formdata.append('City', _selectedAddress.CityCode)
        formdata.append('Apartment', _selectedAddress.AptNumber)
        formdata.append('Line1', _selectedAddress.Line1)
        formdata.append('Line2', _selectedAddress.Line2)
        formdata.append('Mobile', 961 + String(mNumber).replace(/[^0-9]/g, ''))
        formdata.append('Province', _selectedAddress.ProvinceCode)
        formdata.append('FirstName', this.props.FirstName)
        formdata.append('LastName', this.props.LastName)
        formdata.append('DeliveryCharge', this.props.extraCharage && this.props.extraCharage.DeliveryCharge || 0)

        let modIndex = 0
        const {Items=[]}=promoObject
        for (var i = 0; i < this.props.cartItemsArray.length; i++) {
            const currentItem = this.props.cartItemsArray[i]
            const {
                PLU,
                ID,
                quantity,
                Price,
                DiscountedPrice,
                Free,
                Modifiers,
                ItemName
            } = currentItem
            console.log(Items);

            const promoItem=Items.filter((item)=>item.PLU===PLU)
            if(promoItem && promoItem.length>0)
             {

                formdata.append('Items[' + (modIndex) + '][ItemPlu]', PLU)
                formdata.append('Items[' + (modIndex) + '][OrderItemId]', ID)
                formdata.append('Items[' + (modIndex) + '][Quantity]', quantity)
                formdata.append('Items[' + (modIndex) + '][UnitPrice]', Price)
                formdata.append('Items[' + (modIndex) + '][GrossPrice]', promoItem[0].DiscountedItemPrice * quantity)
                formdata.append('Items[' + (modIndex) + '][ItemName]', ItemName)
                formdata.append('Items[' + (modIndex) + '][ItemType]', 1)
                formdata.append('Items[' + (modIndex) + '][NetAmount]', promoItem[0].DiscountedItemPrice)
                formdata.append('Items[' + (modIndex) + '][OpenName]', '0')
                formdata.append('Items[' + (modIndex) + '][Discount]',Number (promoItem[0].ItemPrice - promoItem[0].DiscountedItemPrice))

            }

            else{
                formdata.append('Items[' + (modIndex) + '][ItemPlu]', PLU)
                formdata.append('Items[' + (modIndex) + '][OrderItemId]', ID)
                formdata.append('Items[' + (modIndex) + '][Quantity]', quantity)
                formdata.append('Items[' + (modIndex) + '][UnitPrice]', Price)
                formdata.append('Items[' + (modIndex) + '][GrossPrice]', Price * quantity)
                formdata.append('Items[' + (modIndex) + '][ItemName]', ItemName)
                formdata.append('Items[' + (modIndex) + '][ItemType]', 1)
                formdata.append('Items[' + (modIndex) + '][NetAmount]', Price)
                formdata.append('Items[' + (modIndex) + '][OpenName]', '0')

            }

            if (Free) {
                formdata.append(
                    'Items[' + (modIndex) + '][FreeStarterId]',
                    this.props.freeStarterId
                )
            } else {
                formdata.append('Items[' + (modIndex) + '][FreeStarterId]', 0)
            }
            modIndex++;

            if (Modifiers) {
                for (var j = 0; j < Modifiers.length; j++) {
                    if (Modifiers[j].details.items) {
                        for (var k = 0; k < Modifiers[j].details.items.length; k++) {
                            var object = Modifiers[j].details.items[k]
                            if (object.Quantity > 0) {
                                formdata.append(
                                    'Items[' + (modIndex) + '][ItemPlu]',
                                    object.PLU
                                )
                                formdata.append(
                                    'Items[' + (modIndex) + '][ItemName]',
                                    object.ModifierName
                                )
                                formdata.append(
                                    'Items[' + (modIndex) + '][Quantity]',
                                    object.Quantity
                                )
                                formdata.append(
                                    'Items[' + (modIndex) + '][NetAmount]',
                                    object.Price
                                )
                                formdata.append(
                                    'Items[' + (modIndex) + '][OrderItemId]',
                                    object.ID
                                )
                                formdata.append('Items[' + (modIndex) + '][ItemType]', 3)
                                formdata.append('Items[' + (modIndex) + '][OpenName]', '0')
                                formdata.append('Items[' + (modIndex) + '][UnitPrice]', object.Price)
                                formdata.append('Items[' + (modIndex) + '][GrossPrice]', object.Price)
                                formdata.append('Items[' + (modIndex) + '][FreeStarterId]', 0)
                                modIndex++
                            }
                        }
                    }
                }
            }

            // apply item based promotions if existing
            const { Promo = [] } = currentItem
            if (Promo) {
                Promo.map(promo => {
                    const { Id, PromoSquirrelId, PromoId } = promo
                    if (validatePromo(promo)) {
                        Promotions.push({
                            Id,
                            PromoId,
                            PromoPLU: PLU,
                            PromoSquirrelId
                        })
                    }
                })
            }
        }

        const selectedSpecialInstructions = this.state.specialInstructionsArray.filter(
            obj => obj.selection == 1
        )
        const subSelectedXtras = {}

        for (var i = 0; i < selectedSpecialInstructions.length; i++) {
            if (selectedSpecialInstructions[i].Details) {
                const selectedSpecialInstructionsDetails = selectedSpecialInstructions[
                    i
                ].Details.filter(obj => obj.selection == 1)
                if (selectedSpecialInstructionsDetails.length > 0) {
                    subSelectedXtras[selectedSpecialInstructions[i].ID] = 1
                    formdata.append(
                        'Items[' + (modIndex) + '][OrderItemId]',
                        selectedSpecialInstructions[i].ID
                    )

                    formdata.append(
                        'Items[' + (modIndex) + '][ItemName]',
                        selectedSpecialInstructions[i].Title + ' : ' + selectedSpecialInstructionsDetails[0].data.Name
                    )
                    formdata.append('Items[' + (modIndex) + '][ItemPlu]', 6969)
                    formdata.append('Items[' + (modIndex) + '][NetAmount]', '0.00')
                    formdata.append('Items[' + (modIndex) + '][OpenName]', '1')
                    formdata.append('Items[' + (modIndex) + '][FreeStarterId]', '0')
                    formdata.append('Items[' + (modIndex) + '][Quantity]', 1)
                    formdata.append('Items[' + (modIndex) + '][UnitPrice]', '0.00')
                    formdata.append('Items[' + (modIndex) + '][GrossPrice]', '0.00')
                    formdata.append('Items[' + (modIndex) + '][ItemType]', '1')
                    modIndex++
                }
            } else {
                formdata.append(
                    'Items[' + (modIndex) + '][OrderItemId]',
                    selectedSpecialInstructions[i].ID
                )

                formdata.append(
                    'Items[' + (modIndex) + '][ItemName]',
                    selectedSpecialInstructions[i].Title
                )
                formdata.append('Items[' + (modIndex) + '][ItemPlu]', 6969)
                formdata.append('Items[' + (modIndex) + '][NetAmount]', '0.00')
                formdata.append('Items[' + (modIndex) + '][OpenName]', '1')
                formdata.append('Items[' + (modIndex) + '][FreeStarterId]', '0')
                formdata.append('Items[' + (modIndex) + '][Quantity]', 1)
                formdata.append('Items[' + (modIndex) + '][UnitPrice]', '0.00')
                formdata.append('Items[' + (modIndex) + '][GrossPrice]', '0.00')
                formdata.append('Items[' + (modIndex) + '][ItemType]', '1')
                modIndex++
            }
        }

        var instructions = []
        for (var i = 0; i < selectedSpecialInstructions.length; i++) {
            const instruct = selectedSpecialInstructions[i]
            const isSelected = instruct.selection == 1 ||
                (subSelectedXtras[instruct.ID] &&
                    instruct.Interactive === false)
            if (isSelected) instructions.push(selectedSpecialInstructions[i].ID.toString())
        }
        formdata.append('Items[' + (modIndex) + '][ItemPlu]', 6969)
        formdata.append('Items[' + (modIndex) + '][OrderItemId]', '0')
        formdata.append('Items[' + (modIndex) + '][Quantity]', '1')
        formdata.append('Items[' + (modIndex) + '][UnitPrice]', '0.00')
        formdata.append('Items[' + (modIndex) + '][GrossPrice]', '0.00')
        formdata.append('Items[' + (modIndex) + '][NetAmount]', '0.00')
        formdata.append('Items[' + (modIndex) + '][OpenName]', '1')
        formdata.append('Items[' + (modIndex) + '][FreeStarterId]', '0')
        formdata.append('Items[' + (modIndex) + '][ItemType]', '1')
        formdata.append('Items[' + (modIndex) + '][ItemName]', this.state.orderNotes.length > 0 ? this.state.orderNotes : ' ')

        var x = 0
        const paymentID = new Date().valueOf()
        let onlineSubTotal = Number(this.props.totalAmount)
        // for displaying at confirmation
        this.paymentCache = {}

        for (let i = 0; i < this.state.paymentMethodsArray.length; i++) {
            if (this.state.paymentMethodsArray[i].selection == 1) {
                if (this.state.paymentMethodsArray[i].POSSName == WALLET_PAYMENT_CODE) {
                    const redeemIndex = _.findIndex(this.state.paymentMethodsArray[i]?.methods, method =>
                        method.POSSName.toLowerCase() === REDEEMABLE_PAYMENT_POSSName
                    );
                    if (redeemIndex > -1 && this.state.paymentMethodsArray[i].methods[redeemIndex].selection == 1 && this.state.paymentMethodsArray[i].methods[redeemIndex].POSSName.toLowerCase() == REDEEMABLE_PAYMENT_POSSName) {
                        const value = this.state.paymentMethodsArray[i].methods[redeemIndex];
                        const payment2Amount = value.Amount;
                        // for displaying at confirmation
                        this.paymentCache.WALLET = payment2Amount
                        if (payment2Amount > 0) {
                            formdata.append(
                                'paymentParts[' + x + '][Settlement]',
                                payment2Amount
                            )
                            formdata.append(
                                'paymentParts[' + x + '][Currency]',
                                this.props.currency
                            )
                            formdata.append('paymentParts[' + x + '][Status]', 'done')
                            formdata.append(
                                'paymentParts[' + x + '][Category]',
                                value.Name
                            )
                            formdata.append(
                                'paymentParts[' + x + '][PaymentTypeId]',
                                value.POSCode
                            )
                            onlineSubTotal -= payment2Amount
                            console.log('=========+> SUBTOTAL deduction 2/' + i, onlineSubTotal, payment2Amount);
                            x++
                        }
                    }

                    const voucherIndex = _.findIndex(this.state.paymentMethodsArray[i]?.methods, method =>
                        method.POSSName.toLowerCase() === VOUCHER_PAYMENT_POSSName
                    );
                    if (voucherIndex > -1 && this.state.paymentMethodsArray[i].POSSName == WALLET_PAYMENT_CODE && this.state.paymentMethodsArray[i].methods[voucherIndex].selection == 1 && this.state.paymentMethodsArray[i].methods[voucherIndex].POSSName.toLowerCase() == VOUCHER_PAYMENT_POSSName) {
                        for (let a = 0; a < this.state.selectedVoucherArray.length; a++) {
                            const value = this.state.paymentMethodsArray[i].methods[voucherIndex];
                            const voucherAmount = this.state.selectedVoucherArray[a]
                                .Value
                            // for displaying at confirmation
                            const { VOUCHERS } = this.paymentCache
                            this.paymentCache.VOUCHERS = (VOUCHERS || 0) + voucherAmount
                            if (voucherAmount > 0) {
                                formdata.append(
                                    'paymentParts[' + x + '][Settlement]',
                                    voucherAmount
                                )
                                formdata.append(
                                    'paymentParts[' + x + '][Category]',
                                    'voucher'
                                )
                                formdata.append('paymentParts[' + x + '][Status]', 'done')
                                formdata.append(
                                    'paymentParts[' + x + '][PaymentTypeId]',
                                    value.POSCode
                                )
                                formdata.append(
                                    'paymentParts[' + x + '][VoucherId]',
                                    this.state.selectedVoucherArray[a].Id
                                )
                                formdata.append(
                                    'paymentParts[' + x + '][VoucherCode]',
                                    this.state.selectedVoucherArray[a].Coupon
                                )
                                formdata.append(
                                    'paymentParts[' + x + '][Currency]',
                                    this.props.currency
                                )
                                // minus amount from subtotal if not online amount
                                onlineSubTotal -= voucherAmount
                                console.log('=========+> SUBTOTAL deduction voucher/' + i, onlineSubTotal, voucherAmount);
                                x++
                            }
                        }
                    }
                } else {
                    const paymentPart3Amount = this.state.paymentMethodsArray[i].Amount;
                    console.log('paymentPart3Amount', paymentPart3Amount + ' ---> ', i, this.state.paymentMethodsArray[i]);
                    // only log settlements for payments other than online payments since that will be added automatically
                    if (paymentPart3Amount > 0) {
                        if (i !== 0) {
                            formdata.append(
                                'paymentParts[' + x + '][Settlement]',
                                paymentPart3Amount
                            )
                        }
                        formdata.append(
                            'paymentParts[' + x + '][Category]',
                            this.state.paymentMethodsArray[i].Name
                        )
                        formdata.append(
                            'paymentParts[' + x + '][PaymentTypeId]',
                            this.state.paymentMethodsArray[i].POSCode
                        )

                        formdata.append(
                            'paymentParts[' + x + '][Currency]',
                            this.props.currency
                        )

                        if (
                            this.state.paymentMethodsArray[i].POSSName.toLowerCase() !==
                            ONLINE_PAYMENT_POSSNAME
                        ) {
                            formdata.append('paymentParts[' + x + '][Status]', 'done')
                        }
                        // minus amount from subtotal
                        if (i !== 0) {
                            onlineSubTotal -= paymentPart3Amount
                            console.log('=========+> SUBTOTAL deduction 3/' + i, onlineSubTotal, paymentPart3Amount);
                        }
                        x++
                    }
                }
            }
        }

        // console.log(formdata);
        // ensure there is a selection [ NEW CARD or EXISTING CARD ]
        const { cvv, token, saveCard } = this.getCardSelection()
        const {
            selectedCurrency: { Currency: currencyType, Rate: currencyRate }
        } = this.state

        if (this.checkForAvailableItemOFRestaurant(addressarray)) {
            const filterArrayforOnline = this.state.paymentMethodsArray.filter(
                obj => obj.selection == 1 && obj.POSSName.toLowerCase() == ONLINE_PAYMENT_POSSNAME
            )
            const hasOnlineSelected = filterArrayforOnline.length == 1

            if (hasOnlineSelected) {
                // if online payment is less than the required amount, please warn user
                if (onlineSubTotal < this.props.minimumOnlinePayment) {
                    this.setState({
                        extraPopupVisible: true,
                        extraPopupMessage: MINIMUM_ONLINE_PAYMENT_WARNING(this.props.minimumOnlinePayment, this.props.currency)
                    });
                    // return alert()
                }
                this.paymentCache.ONLINE_PAYMENT = onlineSubTotal

                // if CVV is blank
                /* if (!cvv && token && token != 'new')
          return alert("Please Input your Credit Card's CVV / CVC number."); */
                if (/*! cvv && */ !token) {
                    this.setState({
                        alertVisibilty: true,
                        alertMessage: 'Please make an Online selection.',
                        alertTitle: ''
                    })
                    // return alert('Please make an Online selection.')
                    return;
                }
            }

            // add promo information if present
            const {PromoId, Reason, PromoCode,Items = [], PLU, DiscountValue, DiscountType, CouponId} = promoObject
            let Id = PromoId && _.find(this.props.cartItemsArray, function (o) {
                return o.PLU === PLU
            })
            let PromoIndex = 0
            console.log(Items);
            if(PromoCode && Items.length) {
                for(let k=0;k<Items.length;k++) {
                    // items = this.hasItemsForPromo(Items[k]['PLU']);
                    let ItemId = Items[k].PromoId && _.find(this.props.cartItemsArray, function (o) {
                        return o.PLU === Items[k].PLU
                    })

                    formdata.append(`Promotions[${k}][PromotionId]`, Items[k].PromoId)
                    formdata.append(`Promotions[${k}][ItemPlu]`, Items[k].PLU || 0)
                    // formdata.append(`Promotions[${PromoIndex}][Code]`, PromoCode)
                    formdata.append(
                        `Promotions[${k}][PromotionAccessType]`,
                        'manager'
                    )
                    formdata.append(`Promotions[${k}][reason]`,Items[k]. Reason)
                    formdata.append(`Promotions[${k}][DiscountValue]`,Items[k]. DiscountValue),
                        formdata.append(`Promotions[${k}][DiscountType]`,Items[k]. DiscountType),
                        formdata.append(`Promotions[${k}][CouponId]`, Items[k].CouponId)
                    formdata.append(`Promotions[${k}][OrderItemId]`, ItemId.ID)
                }
            }
            else if (PromoCode && PromoId) {
                formdata.append(`Promotions[${PromoIndex}][PromotionId]`, PromoId)
                formdata.append(`Promotions[${PromoIndex}][ItemPlu]`, PLU || 0)
                // formdata.append(`Promotions[${PromoIndex}][Code]`, PromoCode)
                formdata.append(
                    `Promotions[${PromoIndex}][PromotionAccessType]`,
                    'manager'
                )
                formdata.append(`Promotions[${PromoIndex}][reason]`, Reason)
                formdata.append(`Promotions[${PromoIndex}][DiscountValue]`, DiscountValue),
                    formdata.append(`Promotions[${PromoIndex}][DiscountType]`, DiscountType),
                    formdata.append(`Promotions[${PromoIndex}][CouponId]`, CouponId)
                // PromoIndex++
            }

            if (Id && !Id === undefined) {
                formdata.append(`Promotions[${PromoIndex}][OrderItemId]`, Id.ID)
            }

            if (shouldOnlyValidate) return true
            else {
                AppEventsLogger.logPurchase(
                    this.props.totalAmount,
                    this.props.currency || CURRENCY
                )
                if (hasOnlineSelected) {
                    // set online info
                    // this.goToPaymentWebView(onlineSubTotal, formdata, paymentID);
                    const expressPayment = this.getCardSelection()
                    this.setState({
                        onlineOrderId: paymentID,
                        onlineTotal: onlineSubTotal,
                        expressPayment
                    })
                    if (onlineSubTotal > 0) {
                        formdata.append('paymentParts[0][OnlineId]', paymentID)
                        formdata.append(
                            'paymentParts[0][Settlement]',
                            onlineSubTotal // / currencyRate
                        )
                        formdata.append('paymentParts[0][SaveCard]', saveCard ? 1 : 0)
                        formdata.append('paymentParts[0][OnlineType]', 'mastercard')
                        formdata.append(
                            'paymentParts[0][CardToken]',
                            token === 'new' ? null : token
                        )
                        // formdata.append('paymentParts[0][CardCVV]', cvv || null);
                        // set payment status to pending
                        formdata.append('paymentParts[0][Status]', 'pending')
                        formdata.append('paymentParts[0][PaymentServer]', '1')
                        formdata.append('OnlineCurrency', currencyType)
                    }
                    // send order to server pending payment
                    // console.log('WOULD SEND FORMDATA online', formdata)
                    this.props.preOrder(formdata)
                }
            else {
                    // send order
                    console.log('WOULD SEND FORMDATA', formdata)


                    this.processOrder(formdata)
                }
            }
        }
    }

    submitEnabler() {
        this.submitEnablerTimeout = setTimeout(() => {
            this.setState({ submittingOrder: false })
        }, 2e3)
    }

    checkForAvailableItemOFRestaurant(addressarray) {
        let noDisabledItems = true
        const disableItem = this.state.disabledItems;
        if (disableItem.length > 0) {
            const index = disableItem.findIndex((item) => item.AddressId == addressarray[0].ID);
            if (index !== -1) {
                let disabledItemsArray = disableItem[index]['ItemIDs'];
                disabledItemsArray = disabledItemsArray.split(',');
                const unavailableItems = []
                const itemLength = this.props.cartItemsArray.length
                const hasDisables = disabledItemsArray && disabledItemsArray.length
                if (hasDisables) {
                    for (var i = 0; i < itemLength; i++) {
                        const itemObject = this.props.cartItemsArray[i]
                        const itemsAarry = disabledItemsArray.filter(
                            obj => obj == itemObject.ID
                        )
                        if (itemsAarry.length > 0) {
                            noDisabledItems = false
                            if (
                                unavailableItems.filter(item => item === itemObject.ItemName)
                                    .length === 0
                            ) {
                                unavailableItems.push(itemObject.ItemName)
                            }
                        }
                    }
                }
                if (unavailableItems.length) {
                    let andString = unavailableItems.length > 1 ? ' and ' : '';
                    const lastItem =
                        unavailableItems.length > 1 ? unavailableItems.pop() : ''
                    const unavailableItemsText = unavailableItems.join(', ')
                    const unavailableVerb =
                        unavailableItems.length > 1 || lastItem.length > 1 ? ' are' : ' is'
                    // show popup
                    this.setState({
                        showUnavailableOrder: true,
                        unavailableOrderText: `${unavailableItemsText}${andString}${lastItem}${unavailableVerb} not available right now.`
                    })
                }
            }
        }
        return noDisabledItems
    }

    validateFieldLength(text, field, limit) {
        if (text.length > limit) {
            return field + ' must not exceed ' + limit + ' characters'
        } else {
            return null
        }
    }

    validateUserInputs() {
        const {
            addressTypesArray = [],
            name = '',
            selectedCity = 'Select City',
            company = '',
            building = '',
            street = '',
            floor = ''
        } = this.state
        const selectedAddress = addressTypesArray.filter(obj => obj.selection == 1)
        const noAddressSelected = selectedAddress.length == 0
        const isBusiness =
            !noAddressSelected && selectedAddress[0].Title == 'Business'

        let InputError = null

        // validate input fields
        if (noAddressSelected) {
            InputError = 'Select Address Type'
        } else {
            const validName = validate('string', name?.trim(), 'Name')
            const inValidCity = selectedCity == 'Select City'
            const validCompany = validate('string', company?.trim(), 'Company')
            const validBuilding = validate('string', building?.trim(), 'Building')
            const validStreet = validate('string', street?.trim(), 'Street')
            const validFloor = validate('string', floor?.trim(), 'Floor')

            if (validName) InputError = validName
            else if (inValidCity) InputError = 'Select a City'
            else if (isBusiness && validCompany) InputError = validCompany
            else if (validBuilding) InputError = validBuilding
            else if (validStreet) InputError = validStreet
            else if (validFloor) InputError = validFloor
        }

        // validate field lengths
        const noInputErrorSoFar = InputError == null
        if (noInputErrorSoFar) {
            const { validateFieldLength } = this
            const validCompanyLength = validateFieldLength(company || '', 'Company', 29)
            const validNameLength = validateFieldLength(name || '', 'Name', 20)
            const validBuildingLength = validateFieldLength(building || '', 'Building', 29)
            const validStreetLength = validateFieldLength(street || '', 'Street', 29)
            const validFloorLength = validateFieldLength(floor || '', 'Floor', 20)

            if (isBusiness && validCompanyLength) InputError = validCompanyLength
            else if (validNameLength) InputError = validNameLength
            else if (validBuildingLength) InputError = validBuildingLength
            else if (validStreetLength) InputError = validStreetLength
            else if (validFloorLength) InputError = validFloorLength
        }

        // set error if any
        this.setState({ error: InputError })

        return InputError
    }

    saveNewAddresstoServer() {
        const {
            addressTypesArray,
            deliveryAddressArray,
            editedAddressID
        } = this.state
        const selectedAddress = addressTypesArray.filter(obj => obj.selection == 1)
        const duplicateAddress = deliveryAddressArray.filter(
            obj => obj.TypeID == selectedAddress[0].ID
        )

        // check for a duplicated address
        if (duplicateAddress.length > 0 && !this.state.showEditOrderView) {
            const alertMessage =
                'You have already registered an address with address type ' +
                selectedAddress[0].Title
            // alert(alertMessage)
            this.setState({
                extraPopupVisible: true,
                extraPopupMessage: alertMessage
            });
            return
        }

        // select the edited address to be selected
        for (let a = 0; a < deliveryAddressArray.length; a++) {
            const { ID } = deliveryAddressArray[a]
            deliveryAddressArray[a].selection = editedAddressID === ID ? 1 : 0
        }

        var myArray = this.props.mobileNumber.split('')
        var mNumber = []
        for (var i = 0; i < myArray.length; i++) {
            if (i > 2) mNumber.push(myArray[i])
        }
        mNumber = mNumber.join('')
        let formdata = new FormData()
        formdata.append('token', this.props.ACCESS_TOKEN)
        formdata.append('CustomerId', this.props.customerId)
        formdata.append('AddressType', selectedAddress[0].ID)
        formdata.append('Name', this.state.name)
        formdata.append('CityId', this.state.selectedCityObject.Id)
        // formdata.append("ProvinceId",15)
        if (selectedAddress[0].Title == 'Business') {
            formdata.append('Company', this.state.company)
        }
        formdata.append('PhoneCode', 961)
        formdata.append('Phone', String(mNumber).replace(/[^0-9]/g, ''))
        formdata.append('organization_id', ORGANIZATION_ID)
        formdata.append('Line1', this.state.building)
        formdata.append('Line2', this.state.street)
        formdata.append('AptNumber', this.state.floor)
        formdata.append('IsDefault', 1)
        formdata.append('XLocation', this.state.latitude)
        formdata.append('YLocation', this.state.longitude)

        if (this.state.showNewAddress) {
            this.props.addDeliveryAddress(formdata)
            this.setState(
                {
                    showNewAddress: !this.state.showNewAddress
                });
        } else {
            formdata.append('AddressId', editedAddressID)
            this.props.editDeliveryAddress(formdata)
            this.setState({
                deliveryAddressArray: deliveryAddressArray,
                showEditOrderView: !this.state.showEditOrderView
            });
        }
    }

    getAddressTypeview(rowObj, i) {
        return (
            <View style={[styles.itemQuanityRowStyle]}>
                <TouchableOpacity
                    disabled={!!this.state.showEditOrderView}
                    onPress={() => this.selectItem(i, strings.ADDRESS_TYPE)}
                    style={styles.getRowtouchStyle}>
                    <View style={styles.itemselectionOuterStyle}>
                        {rowObj.selection == 1 && (
                            <View
                                style={[
                                    styles.addressTypeselectedDotColor,
                                    { backgroundColor: this.state.componentTheme.thirdColor }
                                ]}
                            />
                        )}
                        {rowObj.selection == 0 && (
                            <View
                                style={[
                                    styles.addressTypeunslectedDotColor,
                                    { borderColor: this.state.componentTheme.thirdColor }
                                ]}
                            />
                        )}
                        <View>
                            <Text
                                allowFontScaling={FONT_SCALLING}
                                style={[
                                    styles.itemQuanityTextStyle,
                                    { color: APP_COLOR_BLACK }
                                ]}>
                                {rowObj.Title}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    updateCity = city => {
        this.setState({ city: city })
    };

    onSelectCity(option) {
        this.setState({ selectedCity: option.label })
        this.setState({ selectedCityObject: option })
    }

    setNotesValue(notes) {
        this.setState({ orderNotes: notes.toString() })
    }

    renderAddNewAddressView(editing) {
        const selectedAddress = this.state.addressTypesArray.filter(
            obj => obj.selection == 1
        )
        return (
            <View style={styles.newAddressFormStyle}>
                <View style={styles.newAddressInnerviewStyle}>
                    {!editing && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image
                                style={styles.addNewAddressPinImageStyle}
                                source={ADDD_NEW_ADDRESS_PIN}
                            />
                            <Text
                                allowFontScaling={FONT_SCALLING}
                                style={[
                                    styles.itemQuanityTextStyle,
                                    { color: this.state.componentTheme.thirdColor }
                                ]}>
                                {strings.ADDD_NEW_ADDRESS.toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        onPress={event => this.onPress(event, CROSS_PRESSED)}
                        style={styles.crossviewStyle}>
                        <Image
                            style={styles.addNewAddressPinImageStyle}
                            source={CROSS_BLACK_IMAGE}
                        />
                    </TouchableOpacity>
                </View>

                <View style={{ flexWrap: 'wrap', flexDirection: 'row', marginEnd: 40 }}>
                    {this.state.addressTypesArray.map((obj, i) => (
                        <View key={i}>{this.getAddressTypeview(obj, i)}</View>
                    ))}
                </View>

                <View style={styles.inputRowStyle}>
                    <View style={styles.inputTitleViewStyle}>
                        <Text
                            allowFontScaling={FONT_SCALLING}
                            style={[
                                styles.itemQuanityTextStyle,
                                { color: this.state.componentTheme.thirdColor }
                            ]}>
                            {strings.NAME.toUpperCase() + '*'}
                        </Text>
                    </View>
                    <View style={styles.inputViewStyle}>
                        <CommonInputSmall
                            placeholder={strings.NAME.toUpperCase()}
                            placeholderTextColor={TEXT_INPUT_PLACEHOLDER_COLOR}
                            value={this.state.name}
                            onFocus={this.clearError}
                            onChangeText={name => this.setState({ name })}
                            maxLength={20}
                            viewStyle={styles.addressViewStyle}
                            textStyle={styles.addressTextStyle}
                        />
                    </View>
                </View>

                <View style={styles.inputRowStyle}>
                    <View style={styles.inputTitleViewStyle}>
                        <Text
                            allowFontScaling={FONT_SCALLING}
                            style={[
                                styles.itemQuanityTextStyle,
                                { color: this.state.componentTheme.thirdColor }
                            ]}>
                            {strings.CITY.toUpperCase() + '*'}
                        </Text>
                    </View>
                    <View style={styles.inputViewStyle}>
                        <TouchableOpacity onPress={() => this.openCitiesList()}>
                            <View style={[styles.inputTitleViewStyle]}>
                                <Text
                                    allowFontScaling={FONT_SCALLING}
                                    style={[
                                        styles.itemQuanityTextStyle,
                                        styles.addressCityStyle
                                    ]}>
                                    {this.state.selectedCity}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                {selectedAddress.length > 0 &&
                    selectedAddress[0].Title == 'Business' && (
                        <View style={styles.inputRowStyle}>
                            <View style={styles.inputTitleViewStyle}>
                                <Text
                                    allowFontScaling={FONT_SCALLING}
                                    style={[
                                        styles.itemQuanityTextStyle,
                                        { color: this.state.componentTheme.thirdColor }
                                    ]}>
                                    {strings.COMPANY.toUpperCase() + '*'}
                                </Text>
                            </View>
                            <View style={styles.inputViewStyle}>
                                <CommonInputSmall
                                    placeholder={strings.COMPANY.toUpperCase()}
                                    value={this.state.company}
                                    onFocus={this.clearError}
                                    onChangeText={company => this.setState({ company })}
                                    maxLength={29}
                                    multiline
                                    viewStyle={styles.addressViewStyle}
                                    textStyle={styles.addressTextStyle}
                                />
                            </View>
                        </View>
                    )}
                <View style={styles.inputRowStyle}>
                    <View style={styles.inputTitleViewStyle}>
                        <Text
                            allowFontScaling={FONT_SCALLING}
                            style={[
                                styles.itemQuanityTextStyle,
                                { color: this.state.componentTheme.thirdColor }
                            ]}>
                            {strings.BUILDING.toUpperCase() + '*'}
                        </Text>
                    </View>
                    <View style={styles.inputViewStyle}>
                        <CommonInputSmall
                            placeholder={strings.BUILDING.toUpperCase()}
                            value={this.state.building}
                            onFocus={this.clearError}
                            onChangeText={building => this.setState({ building })}
                            maxLength={29}
                            multiline
                            viewStyle={styles.addressViewStyle}
                            textStyle={styles.addressTextStyle}
                        />
                    </View>
                </View>
                <View style={styles.inputRowStyle}>
                    <View style={styles.inputTitleViewStyle}>
                        <Text
                            allowFontScaling={FONT_SCALLING}
                            style={[
                                styles.itemQuanityTextStyle,
                                { color: this.state.componentTheme.thirdColor }
                            ]}>
                            {strings.STREET.toUpperCase() + '*'}
                        </Text>
                    </View>
                    <View style={styles.inputViewStyle}>
                        <CommonInputSmall
                            placeholder={strings.STREET.toUpperCase()}
                            value={this.state.street}
                            onFocus={this.clearError}
                            onChangeText={street => this.setState({ street })}
                            maxLength={29}
                            multiline
                            viewStyle={styles.addressViewStyle}
                            textStyle={styles.addressTextStyle}
                        />
                    </View>
                </View>

                <View style={styles.inputRowStyle}>
                    <View style={styles.inputTitleViewStyle}>
                        <Text
                            allowFontScaling={FONT_SCALLING}
                            style={[
                                styles.itemQuanityTextStyle,
                                { color: this.state.componentTheme.thirdColor }
                            ]}>
                            {strings.FLOOR.toUpperCase() + '*'}
                        </Text>
                    </View>
                    <View style={styles.inputViewStyle}>
                        <CommonInputSmall
                            placeholder={strings.FLOOR.toUpperCase()}
                            value={this.state.floor}
                            onFocus={this.clearError}
                            onChangeText={floor => this.setState({ floor })}
                            maxLength={20}
                            multiline
                            viewStyle={styles.addressViewStyle}
                            textStyle={styles.addressTextStyle}
                        />
                    </View>
                </View>
                <Text
                    allowFontScaling={FONT_SCALLING}
                    style={[USER_INPUTS_ERROR_TEXT_STYLE, { alignSelf: 'center' }]}>
                    {this.state.error}
                </Text>
                <View style={[styles.inputRowStyle, { marginBottom: 10 }]}>
                    <Button
                        onPress={event => this.onPress(event, strings.SAVE_ADDRESS)}
                        style={[
                            COMMON_BUTTON_STYLE,
                            { backgroundColor: this.state.componentTheme.thirdColor }
                        ]}>
                        <Text
                            allowFontScaling={FONT_SCALLING}
                            style={[
                                COMMON_BUTTON_TEXT_STYLE,
                                { fontFamily: ROADSTER_REGULAR, fontSize: scale(15) }
                            ]}>
                            {strings.SAVE_ADDRESS.toUpperCase()}
                        </Text>
                    </Button>
                </View>
            </View>
        )
    }

    checkForRedeemableMethod() {
        return true
    }

    _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

    _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

    _handleDatePicked = async date => {
        const filterArray = this.state.deliveryAddressArray.filter(
            obj => obj.selection == 1
        )
        if (filterArray.length === 0) {
            this.setState({ isDateTimePickerVisible: false }, () => {
                setTimeout(() => {
                    this.setState({
                        alertVisibilty: true,
                        alertMessage: 'Select address',
                        alertTitle: 'UH-OH',
                    })
                }, 1e3)
            })

        } else {
            await date.setSeconds(0)
            let selectedTime = Moment(date)
            // console.log('_handleDatePicked data selected', date);
            const selectedAddress = this.getAddressSelectionInArray(
                this.state.deliveryAddressArray
            )
            // add extra minutes if present
            const minimumDate = Moment().add(selectedAddress.DeliveryEta || 0, 'm')
            // Ensure schedule time is never before minimum time
            if (selectedTime < minimumDate) {
                selectedTime = minimumDate.toDate()
            }
            this._hideDateTimePicker()
            this.selectOrderTimeout = setTimeout(
                () => this.selectOrderTime(1, selectedTime),
                1000
            )
        }
    };
    onCrossPress = () => {
        this.setState({
            timePopupVisibilty: false,
            scheduleOrderPopUpVisibilty: false
        })
    };
    onNowCrossPress = () => {
        this.setState({ scheduleOrderPopUpVisibilty: false })
        this.scrollView.scrollTo({ x: 0, y: 0, animated: true })
    };

    onExtraCross = () => {
        this.setState({ extraPopupVisible: false })
    }

    closeAddressInactivePopup = () => {
        this.setState({ showAddressInactivePopUp: false })
    };

    handleUnavailableOrderClose = () => {
        this.setState({
            showUnavailableOrder: false
        })
    };

    onAccept = () => {
        var dateTime = new Date()
        Moment.locale('en')
        this.setState({ scheduleOrderPopUpVisibilty: false })
    };

    onExtraAccept = () => {
        // var dateTime = new Date()
        // Moment.locale('en')
        // this.selectOrderTime(1, dateTime, true)
        this.setState({ extraPopupVisible: false })
    };

    calculateTotalNowDue() {
        const { totalAmount } = this.props
        const {
            totalOfVouchers,
            totalOfRedeemable,
            paymentMethodsArray
        } = this.state

        const anySelectedMethods = paymentMethodsArray.filter(
            obj => obj.selection == 1
        )
        const selectedWalletMethod = anySelectedMethods.filter(
            obj =>
                obj.selection == 1 && obj.POSSName == WALLET_PAYMENT_CODE
        )
        const cashSelected = anySelectedMethods.filter(
            obj => obj.selection == 1 && obj.POSSName.toLowerCase() == CASH_PAYMENT_POSSNAME
        )

        const selectedLength = selectedWalletMethod.length

        const redeemIndex = _.findIndex(selectedWalletMethod[0]?.methods, method =>
            method.POSSName.toLowerCase() === REDEEMABLE_PAYMENT_POSSName
        );
        const shouldRedeem =
            selectedLength && redeemIndex > -1 && selectedWalletMethod[0]?.methods[redeemIndex]?.selection

        const voucherIndex = _.findIndex(selectedWalletMethod[0]?.methods, method =>
            method.POSSName.toLowerCase() === VOUCHER_PAYMENT_POSSName
        );
        const shouldVoucher =
            selectedLength && voucherIndex > -1 && selectedWalletMethod[0]?.methods[voucherIndex]?.selection

        const cashAmount =
            (cashSelected[0] &&
                anySelectedMethods[1] &&
                this.ifOtherMethodeIsOnline() &&
                cashSelected[0].Amount) ||
            0

        const voucherAmount = (shouldVoucher && totalOfVouchers) || 0
        const redeemableAmount = (shouldRedeem && totalOfRedeemable) || 0

        const totalNowDue =
            totalAmount - cashAmount - voucherAmount - redeemableAmount;

        return totalNowDue < 0 ? 0 : totalNowDue
    }


    renderAlertWithButton() {
        const { addToFavButton, addToFavButtonText, addToFavContainer } = styles;
        const {
            componentTheme: { thirdColor }
        } = this.state;
        const themedBackground = { backgroundColor: thirdColor };
        return (
            <View style={addToFavContainer}>
                <Common.Button
                    style={[addToFavButton, themedBackground]}
                    onPress={() => { this.setState({ isDateTimePickerVisible: false }) }}
                    color={thirdColor}>
                    <Text style={addToFavButtonText} allowFontScaling={FONT_SCALLING}>
                        {strings.OK.toUpperCase()}
                    </Text>
                </Common.Button>
            </View>
        );
    }
    renderPopup = () => {
        const {
            componentTheme: { thirdColor }, alertVisibilty,
            alertMessage,
            alertTitle,
        } = this.state
        return (
            <Common.Popup
                onClose={() => {
                    this.setState({
                        alertVisibilty: false,
                        alertMessage: ''
                    })
                }}
                color={thirdColor}
                visibilty={alertVisibilty}
                heading={alertTitle}
                subbody={alertMessage}
            />
        )
    }

    render() {
        const {subTotal,totalAmount}=this.props
        const {
            scrollViewStyle,
            container,
            headingViewImagestyle,
            addNewAddressPinImageStyle,
            addressContainerViewStyle,
            timeTextStyle,
            canMixTextStyle,
            inputTextStyle,
            inputTextViewStyle,
            instructionViewStyle,
            instructionImagestyle,
            paymentImagestyle,
            notesDescriptionStyle,
            notesTextStyle,
        } = styles

        const {
            showUnavailableOrder,
            unavailableOrderText,
            scheduleSubHeadText,
            submittingOrder,
            showEditOrderView,
            showNewAddress,
            deliveryAddressArray,
            confirmationData,
            showAddressInactivePopUp,
            addressInactiveMessage,
            scheduledOrderTime,
            isScheduled,
            componentTheme: { thirdColor, ARROW_LEFT_RED },
        } = this.state
        const {promoObject}=this.props;
        let selectedAddress = this.getAddressSelectionInArray(deliveryAddressArray)
        if (!selectedAddress) selectedAddress = deliveryAddressArray[0] || {}
        // add extra minutes if present, defaults to 35 minutes
        const minimumDate = Moment()
            .add(selectedAddress.DeliveryEta || 35, 'm')
            .toDate()
        const TotalDueNow = this.calculateTotalNowDue()
        const isDarkMode = NativeModules.RNDarkMode.initialMode === 'dark'

        return (
            <KeyboardAvoidingView
                style={[
                    container,
                    { backgroundColor: this.state.componentTheme.thirdColor }
                ]}

                behavior={IF_OS_IS_IOS ? "padding" : null}
                keyboardVerticalOffset={50}
                enabled
            >
                {this.renderPopup()}
                <GoodToGoConfirmation
                   cartItemsArray={this.props.cartItemsArray}
                    promoObject={promoObject}
                    totalDueNow={TotalDueNow}
                    confirmationData={confirmationData}
                    onCrossPress={this.onCrossPressGoodToGo}
                    modalVisibilty={this.state.visibilty}
                    selectedHeading={'good to go'}
                    appTheme={this.state.componentTheme}
                    onPressGrabIt={this.onPressGrabIt}
                    onPressCancel={this.onPressCancel}
                    scheduledOrderTime={scheduledOrderTime}
                    isScheduled={isScheduled}
                   totalAmount={totalAmount}
                   subTotal={subTotal}
                    deliveryCharges={this.props.extraCharage && this.props.extraCharage.DeliveryCharge}
                />
                <ContactViewPopUp
                    modalVisibilty={this.state.showContactPopUp}
                    contacts={this.state.provincesCitiesArray}
                    appTheme={this.state.componentTheme}
                    setSelectedObject={this.setSelectedObject}
                    onCrossPress={this.onCrossPressOnContatcPopup}
                />

                <BoostYourStartPopUp
                    onCrossPress={this.onCrossPress}
                    modalVisibilty={this.state.timePopupVisibilty}
                    selectedHeading={'UH-OH!'}
                    selectedSubHeading={
                        'YOUR ORDER HAS BEEN SCHEDULED \n TO THE OPENING HOUR OF THE BRANCH'
                    }
                    // selectedDetails={this.state.selectedDetails}
                    appTheme={this.state.componentTheme}
                />

                <ScheduleOrderPopUp
                    onCrossPress={this.onNowCrossPress}
                    modalVisibilty={this.state.scheduleOrderPopUpVisibilty}
                    selectedHeading={'UH-OH!'}
                    selectedSubHeading={scheduleSubHeadText}
                    // selectedDetails={this.state.selectedDetails}
                    appTheme={this.state.componentTheme}
                    onAccept={this.onAccept}
                />

                <BoostYourStartPopUp
                    onCrossPress={this.handleUnavailableOrderClose}
                    modalVisibilty={showUnavailableOrder}
                    selectedHeading={'UH-OH!'}
                    selectedSubHeading={unavailableOrderText}
                    appTheme={this.state.componentTheme}
                />

                <BoostYourStartPopUp
                    onCrossPress={this.closeAddressInactivePopup}
                    modalVisibilty={showAddressInactivePopUp}
                    selectedHeading={'UH-OH!'}
                    selectedSubHeading={addressInactiveMessage}
                    appTheme={this.state.componentTheme}
                />

                <ExtraPopUp
                    onCrossPress={this.onExtraCross}
                    modalVisibilty={this.state.extraPopupVisible}
                    selectedHeading={'UH-OH!'}
                    selectedSubHeading={this.state.extraPopupMessage}
                    // selectedDetails={this.state.selectedDetails}
                    appTheme={this.state.componentTheme}
                    onAccept={this.onExtraAccept}
                />

                <CommonLoader />

                <DateTimePicker
                    isVisible={this.state.isDateTimePickerVisible}
                    onConfirm={this._handleDatePicked}
                    onCancel={this._hideDateTimePicker}
                    mode='datetime'
                    date={minimumDate}
                    minimumDate={minimumDate}
                    minimumTime={minimumDate}
                    isDarkModeEnabled={isDarkMode}
                    display={IF_OS_IS_IOS ? "inline":"default"}
                />

                <ScrollView ref={e => (this.scrollView = e)} style={scrollViewStyle} bounces={false}>
                    <TitleBar
                        onPress={this.onBackPress}
                        color={thirdColor}
                        backIcon={ARROW_LEFT_RED}
                        titleText={strings.DELIVERY_DETAILS}
                    />
                    <View>
                        <View style={addressContainerViewStyle}>
                            <View style={styles.addressBarViewStyle}>
                                <Image style={headingViewImagestyle} source={ADDRESS_PIN} />
                                <Text
                                    allowFontScaling={FONT_SCALLING}
                                    style={styles.subsectionHeadingViewStyle}>
                                    {strings.ADDRESS.toUpperCase()}
                                </Text>
                            </View>

                            {deliveryAddressArray.map((rowObj, i) => (
                                <View key={i}>
                                    {this.getAddressRow(rowObj, i, strings.ADDRESS)}
                                </View>
                            ))}
                            {this.state.showEditOrderView &&

                                this.renderAddNewAddressView(true)}

                            {!this.state.showNewAddress &&
                                deliveryAddressArray.length < 3 && (
                                    <View style={[styles.itemQuanityRowStyle]}>
                                        <TouchableOpacity
                                            onPress={event =>
                                                this.onPress(event, strings.ADDD_NEW_ADDRESS)
                                            }
                                            style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Image
                                                style={addNewAddressPinImageStyle}
                                                source={ADDD_NEW_ADDRESS_PIN}
                                            />
                                            <Text
                                                allowFontScaling={FONT_SCALLING}
                                                style={[
                                                    styles.itemQuanityTextStyle,
                                                    { color: this.state.componentTheme.thirdColor }
                                                ]}>
                                                {strings.ADDD_NEW_ADDRESS.toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                        </View>
                        {this.state.showNewAddress && this.renderAddNewAddressView(false)}
                        {showEditOrderView || showNewAddress ? null : (
                            <View>
                                {/* HIDING WHILE EDITING ADDRESS */}
                                <View>
                                    <Text allowFontScaling={FONT_SCALLING} style={timeTextStyle}>
                                        {strings.TIME.toUpperCase()}
                                    </Text>
                                    <View
                                        style={[
                                            styles.timeInnerViewStyle,
                                            {
                                                backgroundColor: this.state.componentTheme.thirdColor,
                                                height: IF_OS_IS_IOS ? 30 : 48
                                            }
                                        ]}>
                                        <View style={styles.timeColumn}>
                                            <TouchableOpacity
                                                onPress={() => this.selectItem(0, strings.ORDER_TIME)}
                                                style={styles.timeContainer}>
                                                {this.state.orderSchadualDateTimeArray[0].selection ==
                                                    1 ? (
                                                        <View
                                                            style={[styles.dotStyale, styles.selectedDotColor]}
                                                        />
                                                    ) : (
                                                        <View
                                                            style={[styles.dotStyale, styles.unslectedDotColor]}
                                                        />
                                                    )}
                                                <Text
                                                    allowFontScaling={FONT_SCALLING}
                                                    style={styles.orderTimeTextStyle}>
                                                    {this.state.orderSchadualDateTimeArray[0].title}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.timeColumn}>
                                            <TouchableOpacity
                                                onPress={() => this.selectItem(1, strings.ORDER_TIME)}
                                                style={styles.timeContainer}>
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center'
                                                    }}>
                                                    {this.state.orderSchadualDateTimeArray[1].selection ==
                                                        1 ? (
                                                            <View
                                                                style={[
                                                                    styles.dotStyale,
                                                                    styles.selectedDotColor
                                                                ]}
                                                            />
                                                        ) : (
                                                            <View
                                                                style={[
                                                                    styles.dotStyale,
                                                                    styles.unslectedDotColor
                                                                ]}
                                                            />
                                                        )}
                                                    <Text
                                                        allowFontScaling={FONT_SCALLING}
                                                        style={styles.orderTimeTextStyle}>
                                                        {this.state.orderSchadualDateTimeArray[1].title}
                                                    </Text>
                                                </View>
                                                {this.state.orderSchadualDateTimeArray[1].dateTime !=
                                                    TIME_FOR_NOW_ORDER && (
                                                        <Text
                                                            allowFontScaling={FONT_SCALLING}
                                                            style={styles.scheduledTimeStyle}>
                                                            {this.state.orderSchadualDateTimeArray[1].dateTime}
                                                        </Text>
                                                    )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                <View
                                    style={[addressContainerViewStyle, { borderBottomWidth: 1 }]}>
                                    <View style={styles.paymentViewStyle}>
                                        <Image
                                            style={paymentImagestyle}
                                            source={PAYMENT_METHOD_IC}
                                        />
                                        <Text
                                            allowFontScaling={FONT_SCALLING}
                                            style={styles.subsectionHeadingViewStyle}>
                                            {strings.PAYMENT_METHOD.toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.billTotalStyle}>
                                        <Text
                                            allowFontScaling={FONT_SCALLING}
                                            style={[
                                                styles.billTotalTextStyle,
                                                { color: thirdColor }
                                            ]}>
                                            {'TOTAL DUE IS '}
                                            {numberWithCommas(TotalDueNow, this.props.currency)}
                                        </Text>
                                    </View>
                                    {this.state.paymentMethodsArray.map((rowObj, i) => (
                                        <View style={{ flex: 1 }} key={i}>
                                            {rowObj.POSSName && this.getPaymentRow(rowObj, i, strings.PAYMENT_METHOD)}
                                            {rowObj.POSSName === WALLET_PAYMENT_CODE && rowObj.methods.length &&
                                                this.getWalletView(rowObj)}
                                        </View>
                                    ))}
                                </View>
                                <Text allowFontScaling={FONT_SCALLING} style={canMixTextStyle}>
                                    {strings.YOU_CAN_MIX_2_OFTHE_ABOVE.toUpperCase()}
                                </Text>
                                <View style={addressContainerViewStyle}>
                                    <View style={styles.instructionViewStyle}>
                                        <Image
                                            style={instructionImagestyle}
                                            source={INSTRUCTION_IC}
                                        />
                                        <Text
                                            allowFontScaling={FONT_SCALLING}
                                            style={styles.subsectionHeadingViewStyle}>
                                            {strings.INSTRUCTIONS.toUpperCase()}
                                        </Text>
                                    </View>

                                    {this.state.specialInstructionsArray.map((rowObj, i) => (
                                        <View key={Math.random() + i}>
                                            {this.getRow(rowObj, i, strings.INSTRUCTIONS)}
                                        </View>
                                    ))}
                                </View>
                                <View>
                                    <Text allowFontScaling={FONT_SCALLING} style={notesTextStyle}>
                                        {strings.NOTES.toUpperCase()}
                                    </Text>
                                    <Text
                                        allowFontScaling={FONT_SCALLING}
                                        style={notesDescriptionStyle}>
                                        {this.parseNotesDescription()}
                                    </Text>
                                    <View style={inputTextViewStyle}>
                                        <Common.SlimInput
                                            style={inputTextStyle}
                                            value={this.state.orderNotes}
                                            onFocus={this.clearError}
                                            autoCorrect={false}
                                            onChangeText={orderNotes => this.setState({ orderNotes })}
                                            placeholder={strings.ANY_THING_ELSE_WE_SHOULD_NOW}
                                            multiline
                                            maxLength={90}
                                            returnKeyType='done'
                                        />
                                    </View>
                                </View>
                                <View
                                    style={{
                                        height: 79.5,
                                        backgroundColor: APP_COLOR_WHITE,
                                        width: '100%',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                    <Button
                                        disabled={submittingOrder}
                                        onPress={event => this.onPress(event, strings.THATS_IT)}
                                        style={[
                                            COMMON_BUTTON_STYLE,
                                            {
                                                alignSelf: 'center',
                                                backgroundColor: this.state.componentTheme.thirdColor
                                            },
                                            { opacity: submittingOrder ? 0.5 : 1 }
                                        ]}>
                                        <Text
                                            allowFontScaling={FONT_SCALLING}
                                            style={[
                                                COMMON_BUTTON_TEXT_STYLE,
                                                { fontFamily: ROADSTER_REGULAR }
                                            ]}>
                                            {strings[
                                                submittingOrder ? 'ORDERING' : 'THATS_IT'
                                            ].toUpperCase()}
                                        </Text>
                                    </Button>
                                </View>
                                {/* /HIDING WHILE EDITING ADDRESS */}
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
}

const styles = {
    editTouchStyle: {
        marginEnd: 40
    },
    editAddressTextStyle: {
        color: APP_COLOR_WHITE,
        fontFamily: DINENGSCHRIFT_REGULAR,
        fontSize: 15,
        paddingTop: IF_OS_IS_IOS ? 7 : 0
    },
    companyTextstyle: {
        position: 'absolute',
        marginTop: 28,
        marginLeft: 10,
        fontSize: 12,
        color: APP_COLOR_BLACK,
        fontFamily: HELVETICANEUE_LT_STD_CN
    },
    streetNameAndDetalisTextBoxStyle: {
        fontFamily: DINENGSCHRIFT_REGULAR,
        paddingVertical: 0,
        borderWidth: 0,
        borderColor: 'red',
        height: 100,
        fontSize: 20,
        marginStart: 5
    },
    modalSelectorInnerViewStyle: {
        height: 30,
        alignSelf: 'center'
    },
    perntageImageStyle: {
        width: 30,
        height: 15,
        resizeMode: 'contain',
        marginLeft: 2
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -5,
        height: 43
    },
    crossviewStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        right: 20,
        position: 'absolute',
        alignSelf: 'center',
        width: 50,
        justifyContent: 'center',
        height: 40
    },
    newAddressInnerviewStyle: {
        height: 40,
        marginStart: 30,
        flexDirection: 'row'
    },
    getRowtouchStyle: {
        alignItems: 'center',
        height: 30
    },
    redeemableVoucherStyle: {
        width: 120,
        justifyContent: 'flex-start'
    },
    freeItemViewstyle: {
        height: 50,
        backgroundColor: APP_COLOR_WHITE,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center'
    },
    vouchersCountViewStyle: {
        flexDirection: 'row',
        alignSelf: 'center',
        marginTop: -30,
        marginBottom: 10
    },
    remainigVoucherTextStyle: {
        marginTop: -3,
        marginStart: 24,
        fontSize: 15,
        fontFamily: HELVETICANEUE_LT_STD_CN
    },

    voucherSelectionStyle: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    voucherInnerviewStyle: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: -30
    },
    vouchertViewstyle: {
        height: 100,
        backgroundColor: APP_COLOR_BLACK,
        marginStart: 15
    },
    amountInnerViewstyle: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    priceViewStyle: {
        flexDirection: 'column',
        alignItems: 'center',
        marginStart: 80,
        // marginTop: IF_OS_IS_IOS ? -10 : -10
        marginTop: -10
    },

    amountViewstyle: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: -30
    },
    walletinnerviewStyle: {
        height: 40,
        backgroundColor: APP_COLOR_BLACK,
        marginStart: 20,
        marginTop: 10
    },
    quantityTextStyle: {
        fontSize: 20.25,
        fontFamily: DINENGSCHRIFT_REGULAR,
        color: APP_COLOR_BLACK,
        paddingTop: IF_OS_IS_IOS ? 5 : 0
    },
    unslectedDotColor: {
        borderRadius: 8,
        width: 16,
        height: 16,
        backgroundColor: TRANSPARENT_COLOR,
        borderWidth: 2,
        borderColor: APP_COLOR_WHITE,
        marginTop: 1
    },
    addressTypeunslectedDotColor: {
        borderRadius: 8,
        width: 16,
        height: 16,
        backgroundColor: TRANSPARENT_COLOR,
        borderWidth: 2,
        borderColor: APP_COLOR_RED,
        marginTop: 1
    },
    notesTextStyle: {
        fontSize: 18,
        fontFamily: DINENGSCHRIFT_BOLD,
        color: APP_COLOR_BLACK,
        marginTop: 10,
        paddingLeft: 15
    },
    notesDescriptionStyle: {
        fontSize: 16,
        fontFamily: DINENGSCHRIFT_REGULAR,
        color: APP_COLOR_WHITE,
        paddingLeft: 23,
        paddingRight: 23,
        marginBottom: 5
    },
    inputTextViewStyle: {
        height: 120,
        marginStart: 23,
        marginEnd: 23,
        backgroundColor: APP_COLOR_WHITE,
        marginBottom: 20,
        borderRadius: 10,
        marginTop: 5
    },
    billTotalStyle: {
        width: '100%',
        backgroundColor: APP_COLOR_WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 5,
        paddingBottom: 5,
        marginBottom: 10
    },
    billTotalTextStyle: {
        fontSize: 18,
        color: APP_COLOR_BLACK,
        fontFamily: DINENGSCHRIFT_BOLD,
        marginTop: 5
    },
    inputTextStyle: {
        fontFamily: HELVETICANEUE_LT_STD_CN,
        fontSize: 16,
        flex: 1,
        width: '100%',
        paddingTop: 10,
        paddingBottom: 5,
        height: 60,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        textAlignVertical: 'top'
    },
    canMixTextStyle: {
        alignSelf: 'center',
        marginTop: 13,
        fontFamily: DINENGSCHRIFT_BOLD,
        fontSize: 18,
        color: APP_COLOR_BLACK
    },
    timeTextStyle: {
        fontSize: 18,
        color: APP_COLOR_BLACK,
        marginStart: 20,
        marginTop: 10,
        fontFamily: DINENGSCHRIFT_BOLD
    },
    addressContainerViewStyle: {
        marginTop: 0,
        borderBottomWidth: 1,
        borderColor: APP_COLOR_WHITE,
        paddingBottom: 12
    },
    itemselectionOuterStyle: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        height: 30,
        borderWidth: 0
    },
    itemQuanityTextStyle: {
        fontSize: 16,
        fontFamily: DINENGSCHRIFT_BOLD,
        color: APP_COLOR_WHITE,
        marginStart: 10,
        marginTop: IF_OS_IS_IOS ? 7 : 0,
        textTransform: 'uppercase'
    },
    addNewAddressPinImageStyle: {
        width: 16,
        height: 16,
        resizeMode: 'contain'
    },
    subsectionHeadingViewStyle: {
        fontSize: 18,
        color: APP_COLOR_WHITE,
        fontFamily: DINENGSCHRIFT_BOLD,
        marginStart: 10,
        marginTop: IF_OS_IS_IOS ? 5 : 0
    },
    scrollViewStyle: {
        flex: 1,
        width: SCREEN_WIDTH
    },
    container: {
        flex: 1,
        width: SCREEN_WIDTH,
        height: null,
        alignItems: 'center',
        // backgroundColor: APP_COLOR_RED
    },
    subContainer: {
        height: TITLE_CONTAINER_HEIGHT,
        backgroundColor: APP_COLOR_WHITE,
        flexDirection: 'row',
        paddingTop: IF_OS_IS_IOS ? 7 : 0
    },
    yourCartTextStyle: {
        color: APP_COLOR_RED,
        fontSize: TITLE_TEXT_SIZE,
        fontFamily: DINENGSCHRIFT_REGULAR,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        marginStart: 7
    },
    listContainer: {
        flex: 1,
        backgroundColor: APP_COLOR_BLACK,
        width: '100%'
    },
    listItemContainer: {
        flexDirection: 'column',
        marginLeft: 0,
        paddingLeft: 0,
        paddingRight: 0,
        marginRight: 0,
        marginTop: 0,
        paddingTop: ITEMS_MARGIN,
        paddingBottom: 0,
        marginBottom: -1
    },

    addItemsContainerStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginStart: 10
    },
    addItemsTextStyle: {
        textAlign: 'right',
        color: APP_COLOR_RED,
        fontSize: ADD_ITEMS_TEXT_SIZE,
        fontFamily: DINENGSCHRIFT_REGULAR
    },
    starsTextStyle: {
        textAlign: 'right',
        color: APP_COLOR_WHITE,
        fontSize: 19.8,
        fontFamily: HELVETICANEUE_LT_STD_CN
    },
    arrowImageStyle: {
        marginLeft: ADD_ITEMS_ARROW_MARGIN_LEFT,
        width: ADD_ITEMS_ARROW_WIDTH,
        height: ADD_ITEMS_ARROW_HEIGHT,
        marginBottom: IF_OS_IS_IOS ? 8 : 0,
        transform: [{ rotate: '180deg' }]
    },
    headingViewImagestyle: {
        width: 18,
        height: 25,
        resizeMode: 'contain',
        marginStart: 14
    },
    instructionImagestyle: {
        width: 22,
        height: 23,
        resizeMode: 'contain',
        marginStart: 14
    },
    paymentImagestyle: {
        width: 25,
        height: 19,
        resizeMode: 'contain',
        marginStart: 14
    },
    detailRowContainerStyle: {
        flexDirection: 'row',
        marginBottom: 6,
        marginTop: 0
    },
    instructionsContainerStyle: {
        width: '75%'
    },

    deliveryFeeTextStyle: {
        fontSize: 25,
        fontFamily: DINENGSCHRIFT_REGULAR,
        color: APP_COLOR_WHITE
    },
    totalAmountTextStyle: {
        fontSize: 30,
        fontFamily: DINENGSCHRIFT_REGULAR,
        color: APP_COLOR_WHITE
    },
    priceContainerStyle: {
        backgroundColor: APP_COLOR_BLACK,
        alignItems: 'flex-end',
        justifyContent: 'center',
        width: '25%'
    },
    starImageStyle: {
        alignSelf: 'center',
        marginStart: 3,
        width: 20,
        height: 20,
        marginBottom: IF_OS_IS_IOS ? 8 : 0
    },
    itemQuanityRowStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 0,
        alignItems: 'center',
        height: 'auto',
        flex: 1,
        marginStart: 30,
        marginTop: 0,
    },
    onlineStyle: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flexDirection: 'column'
    },
    timeInnerViewStyle: {
        flexDirection: 'row',
        borderWidth: 0,
        // alignItems: 'center',
        backgroundColor: APP_COLOR_RED,
        flex: 1,
        marginStart: 30,
        marginTop: 0,
        height: 30
    },
    selectionDot: {
        borderRadius: 8,
        width: 16,
        height: 16,
        borderWidth: 2,
        borderColor: APP_COLOR_WHITE
    },
    selectedDot: {
        backgroundColor: APP_COLOR_WHITE
    },
    selectedDotColor: {
        backgroundColor: APP_COLOR_WHITE,
        borderRadius: 8,
        width: 16,
        height: 16,
        marginTop: 1
    },
    addressTypeselectedDotColor: {
        backgroundColor: APP_COLOR_RED,
        borderRadius: 8,
        width: 16,
        height: 16,
        marginTop: 1
    },
    addressBarViewStyle: {
        height: SUBSELECTION_HEADING_VIEW_HEIGHT,
        width: '100%',
        backgroundColor: APP_COLOR_BLACK,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 10
    },
    addressViewStyle: { height: 'auto', width: '100%' },
    addressTextStyle: {
        paddingLeft: 10,
        paddingRight: 10,
        flex: 1,
        width: '100%',
        height: 'auto',
        paddingTop: IF_OS_IS_IOS ? 3 : 0
    },
    addressCityStyle: {
        color: APP_COLOR_BLACK,
        flexWrap: 'nowrap',
        flexDirection: 'row',
        width: 200,
        marginTop: IF_OS_IS_IOS ? 5 : 0,
        fontFamily: DINENGSCHRIFT_REGULAR
    },
    paymentViewStyle: {
        height: SUBSELECTION_HEADING_VIEW_HEIGHT,
        width: '100%',
        backgroundColor: APP_COLOR_BLACK,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 15
    },
    instructionViewStyle: {
        height: SUBSELECTION_HEADING_VIEW_HEIGHT,
        width: '100%',
        backgroundColor: APP_COLOR_BLACK,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 8
    },
    newAddressFormStyle: {
        // height: 485,
        backgroundColor: APP_COLOR_WHITE
    },
    inputRowStyle: {
        width: 316,
        marginStart: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20
    },
    inputTitleViewStyle: {
        width: 107
    },
    inputViewStyle: {
        width: 209,
        backgroundColor: APP_COLOR_WHITE,
        borderWidth: 1,
        borderColor: APP_COLOR_BLACK,
        borderRadius: 10,
        marginLeft: 10
    },
    quantityViewStyle: {
        width: 40,
        height: 28,
        backgroundColor: APP_COLOR_WHITE,
        borderRadius: 7,
        marginLeft: 5,
        marginRight: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 3
    },
    paymentArrowStyle: {
        width: 13,
        height: 13,
        marginTop: IF_OS_IS_IOS ? 3 : 1,
        marginLeft: 4
    },
    paymentArrowDownStyle: {
        transform: [{ rotate: '90deg' }]
    },
    orderTimeTextStyle: {
        fontSize: 16,
        fontFamily: DINENGSCHRIFT_REGULAR,
        color: APP_COLOR_WHITE,
        marginStart: 10,
        marginTop: IF_OS_IS_IOS ? 4 : 0
    },
    scheduledTimeStyle: {
        fontSize: 10,
        color: APP_COLOR_WHITE,
        position: 'absolute',
        bottom: 0,
        paddingLeft: 25
    },
    timeColumn: {
        flex: 1
    },
    redeemableAmountInput: {
        fontFamily: DIN_CONDENSED,
        width: '100%',
        marginTop: -4
    },
    vouchersContainer: {
        paddingLeft: 10,
        width: '100%'
    },
    instructionRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 60, paddingTop: 5 },
    instructionLabel: {
        fontSize: 16,
        fontFamily: DINENGSCHRIFT_REGULAR,
        color: APP_COLOR_WHITE,
        marginTop: IF_OS_IS_IOS ? 7 : 0
    },
    instructionBase: {
        marginLeft: 10,
        borderRadius: 7
    },
    instructionIcon: {
        marginTop: 5,
        marginBottom: 5
    },
    AddressInactive: {
        opacity: 0.5
    },
    addToFavButtonText: {
        ...COMMON_BUTTON_TEXT_STYLE,
        fontFamily: ROADSTER_REGULAR,
        fontSize: 18
    },
    addToFavContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 30
    },
    addToFavButton: {
        ...COMMON_BUTTON_STYLE,
        paddingTop: 5,
        marginTop: 20
    },
}

function mapStateToProps(state) {
    const {
        LevelName,
        FirstName,
        LastName,
        FullMobile,
        CustomerId,
        Currency
    } = getUserObject(state)

    const paymentMethods = getUserPaymentMethods(state)
    const { checkoutTokens } = state.deliverydetails
    const ACCESS_TOKEN = state.app.accessToken
    const { extraCharage } = state.home;
    const {
        app: {
            freeStarterId,
            currency,
            walletAmountBalance: userWalletAmount,
            loading: loadingState
        },
        cart: { promoObject, totalAmount, cartItemsArray },
        deliverydetails: {
            orderStatus,
            orderTimestamp,
            addresstypes: addressTypes,
            minimumAmount:minimumAmount,
            disabledItems,
            error_messages: error_messages,
            provincesCities,
            specialInstructions,
            addedDeliveryAddresse: addedDeliveryAddresseID,
            addresses: userAddresses,
            notesDescription,
            walletData: { Vouchers, RedeemableAmountBalance },
            minimumOnlinePayment
        }
    } = state
    if (state.app.userType == 'register') {
        return {
            ACCESS_TOKEN,
            checkoutTokens,
            LevelName,
            FirstName,
            LastName,
            FullName: `${FirstName} ${LastName}`,
            loadingState,
            mobileNumber: FullMobile,
            customerId: CustomerId,
            cartItemsArray,
            addressTypes,
            error_messages,
            provincesCities,
            paymentMethods: paymentMethods,
            specialInstructions,
            addedDeliveryAddresseID,
            orderTimestamp,
            orderStatus,
            promoObject,
            totalAmount,
            userWalletAmount,
            RedeemableAmountBalance,
            Vouchers,
            userAddresses,
            currency: currency || Currency,
            freeStarterId,
            notesDescription,
            extraCharage,
            disabledItems,
            minimumOnlinePayment
        }
    } else {
        return {
            ACCESS_TOKEN,
            checkoutTokens,
            LevelName,
            FirstName,
            LastName,
            FullName: `${FirstName} ${LastName}`,
            loadingState,
            customerId: CustomerId,
            userWalletAmount,
            RedeemableAmountBalance,
            Vouchers,
            mobileNumber: FullMobile,
            cartItemsArray,
            addressTypes,
            minimumAmount,
            error_messages,
            provincesCities,
            paymentMethods: paymentMethods,
            specialInstructions,
            addedDeliveryAddresseID,
            orderTimestamp,
            orderStatus,
            promoObject,
            totalAmount,
            userAddresses,
            currency: currency || Currency,
            freeStarterId,
            notesDescription,
            extraCharage,
            disabledItems,
            minimumOnlinePayment
        }
    }
}

const mapDispatchToProps = dispatch => ({
    ...bindActionCreators(
        {
            ...vouchersActions,
            ...deliveryDetailsAction
        },
        dispatch
    )
})
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DeliveryDetails)
