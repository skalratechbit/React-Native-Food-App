import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import _ from 'lodash'
import { actions as vouchersActions } from '../../ducks/vouchers';
import {
  COMMON_BUTTON_TEXT_STYLE,
  COMMON_BUTTON_STYLE,
  IF_OS_IS_IOS,
  FONT_SCALLING,
  SCREEN_WIDTH,
  SCREEN_HEIGHT
} from '../../config/common_styles';
import Moment from 'moment';
import { Actions } from 'react-native-router-flux';
import CommonPopup from '../../components/Common/CommonPopup';
import VouchersHelper from './VouchersHelper';
import {
  RIGHT_ARROW_LARGE_WHITE,
} from '../../assets/images';
import { BoostYourStartPopUp } from '../../components';
import { bindActionCreators } from 'redux';
import { ORGANIZATION_ID, CHANNEL_ID } from '../../config/constants/network_constants';
import strings from '../../config/strings/strings';
import {
  APP_COLOR_WHITE,
  APP_COLOR_RED,
  APP_COLOR_BLACK,
  TRANSPARENT_COLOR,
  TEXT_INPUT_PLACEHOLDER_COLOR
} from '../../config/colors';
import {
  DINENGSCHRIFT_REGULAR,
  ROADSTER_REGULAR,
  DIN_CONDENSED,
  DINENGSCHRIFT_BOLD
} from '../../assets/fonts';
import { CommonInputSmall } from '../../components';
import CommonLoader from '../../components/CommonLoader';
import { connect } from 'react-redux';
import {
  numberWithCommas,
} from '../../config/common_functions';
import { actions as deliveryDetailsAction } from '../../ducks/deliverydetails';
import { actions as squadAction } from '../../ducks/squardcorner';
import { getUserObject, getUserPaymentMethods } from '../../helpers/UserHelper';
import { getThemeByLevel } from '../../config/common_styles/appthemes';
import CardsHolder from '../deliverydetails/CardsHolder/Index';
import Common from '../../components/Common';
import CurrencySelection from '../deliverydetails/CardsHolder/CurrencySelection'
import TitleBar from '../../components/TitleBar';

const { Button } = Common
const DefaultSelectedCurrency = {
  Currency: 'USD',
  Sorting: 2,
  Rate: 1500
}
const TITLE_CONTAINER_HEIGHT = 52;
const TITLE_TEXT_SIZE = 30;
const ITEM_CELL_HEIGHT = 453.5;
const ITEMS_MARGIN = 5;
const ADD_ITEMS_TEXT_SIZE = 20.5;
const ADD_ITEMS_ARROW_WIDTH = 12;
const ADD_ITEMS_ARROW_HEIGHT = 18;
const ADD_ITEMS_ARROW_MARGIN_LEFT = 5;
const SUBSELECTION_HEADING_VIEW_HEIGHT = 45;
const CROSS_PRESSED = 'cross pressed';
const TIME_FOR_NOW_ORDER = '0000-00-00 00:00:00';
import {
  MINIMUM_ONLINE_PAYMENT,
  MINIMUM_ONLINE_PAYMENT_WARNING,
  VOUCHER_PAYMENT_CODE,
  REDEEMABLE_PAYMENT_CODE,
  REDEEMABLE_PAYMENT_POSSName,
  CASH_PAYMENT_CODE,
  ONLINE_PAYMENT_CODE,
  VOUCHERS_WILL_SUFFICE_WARNING,
  NO_VOUCHERS_WARNING,
  CASH_PAYMENT_POSSNAME,
  ONLINE_PAYMENT_POSSNAME,
  WALLET_PAYMENT_CODE,
  VOUCHER_PAYMENT_POSSName,
  FILTER_VOUCHER_STATUS
} from '../../config/constants/app_logic';

class QRCodeScannedBill extends Component {
  constructor(props) {
    super(props);
    this.state = {
      setSelectedVoucherArray: [],
      totalAmount: 0,
      deliveryAddressArray: [],
      paymentMethodsArray: [],
      timesArray: [strings.NOW.toUpperCase(), strings.IN30_MINUTES.toUpperCase()],
      showNewAddress: false,
      name: '',
      city: '',
      building: '',
      floor: '',
      direction: '',
      street: '',
      walletOptionsArray: [
        { title: 'VOUCHERS', selection: 1 },
        { title: 'REDEEMABLE AMOUNT', selection: 0 }
      ],
      addressTypesArray: [],
      provincesCitiesArray: [],
      selectedCity: 'Select City',
      specialInstructionsArray: [],
      selectedCityObject: '',
      isDateTimePickerVisible: false,
      orderSchadualDateTimeArray: [
        { title: 'NOW', selection: 1, dateTime: TIME_FOR_NOW_ORDER },
        { title: 'Scheduled  Order', selection: 0, dateTime: TIME_FOR_NOW_ORDER }
      ],
      orderNotes: '',
      componentTheme: getThemeByLevel(this.props.LevelName),
      scannedBillData: {},
      userGameData: null,
      gameDataPopupVisibilty: false,
      alreadyScannedPopupVisibilty: false,
      donePopupVisibilty: false,
      insertPaymentPartsResponse: null,
      paymentSuccessPopUp: false,
      selectedVoucherArray: [],
      dineVoucher: [],
      statusTitle: '',
      statusMessage: '',
      statusPopupVisibility: false,
      goHome: false,
      vouchersWillSuffice: false,
      loading: true,
      processing: true,
      selectedCurrency: DefaultSelectedCurrency,
      alertVisibilty: false,
      alertMessage: ''
    };
  }

  componentWillUnmount(){
    this.props.updateScannerDetail()
  }

  componentWillReceiveProps(nextProps) {

    console.log('nextProps', nextProps);
    console.log('next',nextProps.scannerDetail);
    console.log("scannerDetail",this.props.scannerDetail)

    if (nextProps.scannerDetail !== this.props.scannerDetail) {
      const {
        scannerDetail: { status, message },
        gameData = { WinTitle: '', WinBody: '' }
      } = nextProps;
      if (status == true) {
        this.setState({ processing: false, loading: false, scannedBillData: nextProps.scannerDetail }, () => {
          this.setState({ alreadyScannedPopupVisibilty: true, donePopupVisibilty: true });
        });
      } else {
       
        const { WinTitle, WinBody, status: statusMessage } = gameData;
        const title = 'UH-OH';
        this.setState({
          statusTitle: WinTitle ? WinTitle : title,
          statusMessage:  WinBody ? WinBody : statusMessage || message,
          statusPopupVisibility: true,
          goHome: true,
          loading: false,
          processing: false
        });
      }
    }

    if (nextProps.gameData !== this.props.gameData) {
      this.setState({ userGameData: nextProps.gameData, loading: false }, () => {
        if (this.state.userGameData) {
          this.setState({ gameDataPopupVisibilty: true });
        }
      });
    }

    if (nextProps.insertPaymentPartsResponse !== this.props.insertPaymentPartsResponse 
      && nextProps.insertPaymentPartsResponse?.status) {
        this.setState({ paymentSuccessPopUp: true, loading: false, processing: false });
    }else if(nextProps.insertPaymentPartsResponse !== this.props.insertPaymentPartsResponse
      && nextProps.insertPaymentPartsResponse?.status == false) {
     const title = 'UH-OH';
     this.setState({
       statusTitle: title,
       statusMessage:  nextProps?.insertPaymentPartsResponse?.message,
       statusPopupVisibility: true,
       goHome: true,
       loading: false,
       processing: false
     });
   }

    if (nextProps.vouchers !== this.props.vouchers) {
      this.setState({ dineVoucher: nextProps.vouchers });
    }

    if (this.props.totalAmount > 0 && nextProps.paymentMethods.length > this.state.paymentMethodsArray.length) {
      this.setState({
        paymentMethodsArray: this.setNewAttributesINpaymentMethodsArray(nextProps)
      });
    }

    // for the new online payment process
    const { insertTimestamp } = nextProps
    if(insertTimestamp > this.props.insertTimestamp) {
      const { preInsertPaymentResponse: { message, data = {} } } = nextProps
      const paymentURL = data?.URL
      const requestId = this.state?.scannedBillData?.OrderId
      console.log('nextProps.preInsertPaymentResponse', nextProps.preInsertPaymentResponse)
      if(paymentURL && requestId) {
        // there was a processed order
        console.log('RUNNING goToPostPaymentWebView', requestId, paymentURL)
        this.goToPostPaymentWebView(requestId, paymentURL)
      } else if(message === 'Successfully') {
        this.setState({ paymentSuccessPopUp: true, loading: false, processing: false });
      } else {
        this.setState({
          statusTitle: 'UH-OH',
          statusMessage: 'There was a problem with your transaction!',
          statusPopupVisibility: true,
          goHome: true,
          loading: false,
          processing: false
        });
      }
    }
  }
  
  componentDidMount() {
    
    console.log("token",this.props.ACCESS_TOKEN)
    let formdata = new FormData();
    formdata.append('OrgId', ORGANIZATION_ID);
    formdata.append('ChannelId', CHANNEL_ID);
    formdata.append('QRCode', this.props.QRCodeScannedString);
    formdata.append('LoyaltyId', this.props.LoyaltyId);
    formdata.append('date', Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
    this.props.getDineScan(formdata);
    this.props.getDineVouchers()
    //  this.props.sendScanqrDetail(formdata);
   
  }

  componentWillMount() {
    //get checkout tokens for online option
    this.props.getPaymentTokens();
    //get payment methods (unify this data with delivery data)
    this.props.getPaymentMethods();
  }
  getTotalAmountOfVouchers(array) {
    var amount = 0;
    for (var i = 0; i < array.length; i++) {
      amount = amount + parseInt(array[i].Amount);
    }
    //console.log('amount=>', amount);
    return amount;
  }
  setPaymentMethodSelectionBy(Code, Value) {
    const { paymentMethodsArray } = this.state;
    //deselect other payment methods
    paymentMethodsArray.map((method, i) => {
      const { selection, POSSName } = method;
      if(selection == 1 && POSSName.toLowerCase() != Code) {
        paymentMethodsArray[i].selection = Value;
        if(Value === 0)
          paymentMethodsArray[i].Amount = 0;
      }
    })
  }
  setSelectedVoucherArray = (event, array) => {
    const { paymentMethodsArray, totalOfRedeemable } = this.state;
    const { totalAmount } = this.props;
    const anySelectedMethods = paymentMethodsArray.filter(obj => obj.selection == 1);
    const selectedWalletMethod = anySelectedMethods.filter(obj => obj.POSSName.toLowerCase() == WALLET_PAYMENT_CODE);
    const hasOtherSelections = anySelectedMethods > selectedWalletMethod;
    const selectedVoucherArray = array.filter(obj => obj.selection == 1);
    const totalAmountOfVouchers = this.getTotalAmountOfVouchers(selectedVoucherArray);
    const totalWalletPrice = parseInt(totalAmountOfVouchers);

    const walletPaymentIndex = _.findIndex(paymentMethodsArray, paymentMethod =>
      paymentMethod.POSSName.toLowerCase() === WALLET_PAYMENT_CODE
    );
  
    const redeemablePaymentIndex = _.findIndex(paymentMethodsArray[walletPaymentIndex]?.methods, method =>
        method.POSSName.toLowerCase() === REDEEMABLE_PAYMENT_POSSName
    );
  
    const voucherPaymentIndex = _.findIndex(paymentMethodsArray[walletPaymentIndex]?.methods, method =>
        method.POSSName.toLowerCase() === VOUCHER_PAYMENT_POSSName
    );

    const isOtherMethodsSelected = anySelectedMethods.length > 1;
    const isWalletMethodSelected = selectedWalletMethod.length == 1;

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
        const isMethodSelected = paymentMethodsArray[i].selection == 1;
        const isMethodFromWallet = paymentMethodsArray[i].POSSName == WALLET_PAYMENT_CODE;
        if (isMethodSelected) {
          if (isMethodFromWallet) {
            //set method to the total value of selected wallet
            paymentMethodsArray[i].Amount = totalWalletPrice;
            paymentMethodsArray[i].methods[voucherPaymentIndex].Amount = totalAmountOfVouchers;
          } else {
            //set method to the total value of selected wallet if difference is greater than 0
            paymentMethodsArray[i].Amount =
              totalAmount - totalWalletPrice > 0
                ? totalAmount - totalWalletPrice
                : 0;
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
         // warn about total and deselect
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

  getIndex(value, array) {
    for (var x = 0; x < array.length; x++) {
      if (array[x].selection == value.i) {
        return x;
      }
    }
    return -1;
  }
  selectItem(i, selectionName) {
    var array = [];
    if (selectionName == strings.ADDRESS) {
      array = this.state.deliveryAddressArray;
      if (array[i].selection == 0) {
        for (var j = 0; j < array.length; j++) {
          array[j].selection = 0;
        }
        array[i].selection = 1;
      } else {
        //array[i].selection=0;
      }
      this.setState({ deliveryAddressArray: array });
    }
    if (selectionName == strings.PAYMENT_METHOD) {
      array = this.state.paymentMethodsArray;
      const filterArray = array.filter(obj => obj.selection == 1);

      const wlatteArray = filterArray.filter(obj => obj.selection == 1 && obj.length == 2);

      if (filterArray.length >= 2) {
        array[i].selection = 0;
      } else {
        array[i].selection = 1;
      }
      this.setState({ paymentMethodsArray: array });
    }
    if (selectionName == strings.INSTRUCTIONS) {
      array = this.state.specialInstructionsArray;
      if (array[i].selection == 0) {
        array[i].selection = 1;
      } else {
        array[i].selection = 0;
      }
      this.setState({ specialInstructionsArray: array });
    }

    if (selectionName == strings.ADDRESS_TYPE) {
      array = this.state.addressTypesArray;
      if (array[i].selection == 0) {
        for (var j = 0; j < array.length; j++) {
          array[j].selection = 0;
        }
        array[i].selection = 1;
      } else {
        //array[i].selection=0;
      }
      this.setState({ addressTypesArray: array });
    }
    if (selectionName == strings.ORDER_TIME) {
      if (i == 0) this.selectOrderTime(i, TIME_FOR_NOW_ORDER);
    }
  }
  
  selectOrderTime(i, dateTime) {
    Moment.locale('en');

    array = this.state.orderSchadualDateTimeArray;

    if (i == 0 && array[i].selection == 0) {
      array[1].selection = 0;
      array[0].selection = 1;
      array[1].dateTime = TIME_FOR_NOW_ORDER;
      array[0].dateTime = TIME_FOR_NOW_ORDER;
    } else {
      array[1].selection = 1;
      array[0].selection = 0;
      array[1].dateTime = Moment(dateTime).format('YYYY-MM-DD HH:mm:ss');
      array[0].dateTime = TIME_FOR_NOW_ORDER;
    }
    this.setState({ orderSchadualDateTimeArray: array });
  }
  selectPaymentOptions(i, selectionName, rowObj) {
    const { totalAmount } = this.props;
    const { vouchersWillSuffice } = this.state;
    const isOnlinePayment = rowObj.POSSName.toLowerCase() === ONLINE_PAYMENT_POSSNAME
    // const isOnlinePayment = i === 0; //TODO revise things like this to be dynamic
    const isOnlineLessThanMinumum = isOnlinePayment && totalAmount < MINIMUM_ONLINE_PAYMENT;
    const array = this.state.paymentMethodsArray;
    const isMethodNotSelected = array[i].selection == 0;
    const filterArray = array.filter(obj => obj.selection == 1);

    //first tier checks
    //do nothing if vouchers will cover the bill
    if(vouchersWillSuffice) return;
    if(isOnlineLessThanMinumum && isMethodNotSelected) return alert(MINIMUM_ONLINE_PAYMENT_WARNING(MINIMUM_ONLINE_PAYMENT));

    if (selectionName == strings.PAYMENT_METHOD) {

      if (filterArray.length >= 2) {
        if (isMethodNotSelected) return;

        array[i].selection = 0;
        array[i].Amount = 0;
        if (array[i].POSSName == WALLET_PAYMENT_CODE) {
          //array[i].methods[1].selection=0;
          //array[i].methods[1].Amount=0;
        }
        this.setState({ paymentMethodsArray: array }, () =>
          this.setCartAmountInPaymentArray(array, i, false)
        );
        return;
      } else {
        array[i].selection = 1;

        this.setState({ paymentMethodsArray: array }, () =>
          this.setCartAmountInPaymentArray(array, i, true)
        );
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
    const { paymentMethodsArray, vouchersWillSuffice, selectedVoucherArray, totalOfVouchers } = this.state;
    const array = paymentMethodsArray;
    let willSuffice = vouchersWillSuffice;

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
                  array[i].methods[x].selection = typeof isSelected === 'number' ? isSelected : 0
                  isRedeemable = array[i].methods[x].selection
              }
          } else {
              array[i].methods[x].selection =
                  typeof isSelected === 'number' ? isSelected : 1
              if (POSSName.toLowerCase() == VOUCHER_PAYMENT_POSSName) {
                  const voucherArray = [];
                  this.state.dineVoucher?.vouchers?.earned.filter(item => {
                          if (item.isActive) {
                              voucherArray.push({
                                  ...item,
                                  Icon: item.URL,
                              });
                          }
                      })

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
  handleOnClosePopup = () => {
    const { goHome } = this.state;
    if (goHome) {
      Actions.drawer({ type: 'reset' });
      Actions.home({ drawerMenu: true });
      return;
    }
    this.setState({
      statusTitle: '',
      statusMessage: '',
      statusPopupVisibility: false,
      goHome: false
    });
  };
  onCrossPress() {
    this.setState({ gameDataPopupVisibilty: false });
    Actions.drawer({ type: 'reset' });
    Actions.home({ drawerMenu: true });
  }
  onRQCrossPress = () => {
    this.setState({
      alreadyScannedPopupVisibilty: false,
      donePopupVisibilty: false,
      paymentSuccessPopUp: false
    });
    Actions.drawer({ type: 'reset' });
    Actions.home({ drawerMenu: true });
  };
  setNewAttributesInaddressTypesArray(provincesCitiesArray) {
    var array = [];
    for (var i = 0; i < provincesCitiesArray.length; i++) {
      for (var j = 0; j < provincesCitiesArray[i].Cities.length; j++) {
        provincesCitiesArray[i].Cities[j]['selection'] = 0;
        provincesCitiesArray[i].Cities[j]['key'] = j;
        provincesCitiesArray[i].Cities[j]['label'] = provincesCitiesArray[i].Cities[j].CityName;
        array.push(provincesCitiesArray[i].Cities[j]);
      }
    }
    return array;
  }
  setSelectionParamINArrayOBJECTForRadioButtons(array) {
    for (var i = 0; i < array.length; i++) {
      array[i]['selection'] = 0;
    }
    return array;
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

    return formattedPaymentMethods;
  }
  clearError = () => {
    this.setState({ error: '' });
  };
  
  getRedeemableView(RedeemAableObject) {
    return (
      <View style={{ marginTop: IF_OS_IS_IOS ? 0 : 0 }}>
        <View style={[styles.timeInnerViewStyle, styles.walletinnerviewStyle]}>
          <View style={[styles.amountViewstyle, { marginTop: IF_OS_IS_IOS ? -10 : -5 }]}>
            <View style={styles.amountinnerViewStyle}>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[styles.itemQuanityTextStyle, { color: APP_COLOR_WHITE }]}>
                {strings.AMOUNT_COLON}
              </Text>
            </View>
          </View>
          <View style={[styles.priceViewStyle, { marginStart: 120 }]}>
            <View style={styles.amountInnerViewstyle}>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[styles.itemQuanityTextStyle, { color: APP_COLOR_WHITE }]}>
                {numberWithCommas(this.props.userWalletAmount, this.props.currency)}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.timeInnerViewStyle, styles.walletinnerviewStyle]}>
          <View style={[styles.amountViewstyle, { marginTop: IF_OS_IS_IOS ? -30 : -10 }]}>
            <View style={styles.amountinnerViewStyle}>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[styles.itemQuanityTextStyle, { color: APP_COLOR_WHITE }]}>
                {RedeemAableObject.Label}:
              </Text>
            </View>
          </View>
          <View style={[styles.priceViewStyle, { marginStart: 20 }]}>
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
                        placeholder={'ENTER AMOUNT IN LBP'}
                        placeholderTextColor={TEXT_INPUT_PLACEHOLDER_COLOR}
                        value={
                            RedeemAableObject.Amount
                                ? RedeemAableObject.Amount.toString()
                                : ''
                        }
                        onFocus={this.clearError}
                        style={styles.redeemableAmountInput}
                        onChangeText={value =>
                          this.setRedeemAableAmountInPaymentArray(parseInt(value))
                        }
                    />
                 </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
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
             // alert('Redeemable Amount cannot be more than the remaining balance.')
             redeemableAmount = voucherLessOtherAmount
         }

         // warn
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
    let { totalOfVouchers } = this.state;
    let totalWalletPrice = parseInt(totalOfVouchers);
    const { totalAmount } = this.props;
    return (
      <View>
        <VouchersHelper
          vouchers={this.state.dineVoucher}
          fromDelivery={false}
          fromdine={true}
          totalAmount={totalAmount}
          totalWalletPrice={totalWalletPrice}
          setSelectedVoucherArray={this.setSelectedVoucherArray}
        />
        <Text
          allowFontScaling={FONT_SCALLING}
          style={[styles.itemQuanityTextStyle, { color: APP_COLOR_WHITE, alignSelf: 'center' }]}>
          {strings.MIX_AND_MATCH_VOUCHERS_AS_YOU_PLEASE}
        </Text>
      </View>
    );
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
                                              paddingHorizontal: 10,
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
  getCardSelection () {
    return (this.cardsHolder && this.cardsHolder.getCardSelection()) || {}
  }
  setCardsHolderRef = (ref) => {
    this.cardsHolder = ref;
  }
  renderCardHolder() {
    const { checkoutTokens: creditCards } = this.props;
    const { componentTheme: { thirdColor }, selectedCurrency: { Currency: CurrencyType } } = this.state;
    return (<CardsHolder ref={this.setCardsHolderRef} color={thirdColor} cards={creditCards} selectedCurrency={CurrencyType} 
      deleteCard={this.handleDeleteCard}
      />);
  }
  handleDeleteCard = (id) => {
    this.props.deleteCreditCard(id);
  }
  
  handleSetCurrency = CurrencyObject => {
    this.setState({
      selectedCurrency: CurrencyObject
    })
  };
  renderCurrencyOptions (currencies) {
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
          color={thirdColor}
        />
      )
    })
  }
  getPaymentRow(rowObj, i, selectionName) {
    const { Amount, selection, POSSName, Label, Currencies = [] } = rowObj;
    const { componentTheme: { thirdColor } } = this.state;
    const isSelected = selection == 1;
    const isCashPayment = POSSName.toLowerCase() == CASH_PAYMENT_POSSNAME
    const isOnlinePayment = POSSName.toLowerCase() == ONLINE_PAYMENT_POSSNAME
    const isWalletPayment = POSSName == WALLET_PAYMENT_CODE
    const shouldRenderCashInput = isCashPayment && isSelected;
    const shouldRenderCards = isSelected && isOnlinePayment;
    const hasCurrencies = Currencies && Currencies.length

    return (
      <View style={[styles.itemQuanityRowStyle, { justifyContent: 'flex-start' }, isOnlinePayment ? styles.onlineStyle : {}]}>
        <TouchableOpacity
          onPress={() => this.selectPaymentOptions(i, selectionName, rowObj)}
          style={[styles.getRowtouchStyle, { marginRight: 7 }]}>
          <View style={styles.itemselectionOuterStyle}>
            {isSelected && (
              <View
                style={[
                  styles.dotStyale,
                  styles.selectedDotColor,
                  { backgroundColor: thirdColor }
                ]}
              />
            )}
            {!isSelected && (
              <View
                style={[
                  styles.dotStyale,
                  styles.unslectedTopColor,
                  { borderColor: thirdColor }
                ]}
              />
            )}
            <Text
              allowFontScaling={FONT_SCALLING}
              style={[
                styles.itemQuanityTextStyle,
                { color: thirdColor }
              ]}>
              {Label}
            </Text>
            {isWalletPayment ? <Image style={[styles.paymentArrowStyle, isSelected ? styles.paymentArrowDownStyle : {}]} source={RIGHT_ARROW_LARGE_WHITE} /> : null}
            {isSelected && hasCurrencies
              ? this.renderCurrencyOptions(Currencies)
              : null}
          </View>
        </TouchableOpacity>
        {shouldRenderCashInput && (
          <View style={[styles.cashAmountViewStyle, { borderColor: thirdColor }]}>
            <CommonInputSmall
              placeholder={'Enter amount in LBP'}
              value={Amount ? Amount.toString() : ''}
              onFocus={this.clearError}
              keyboardType="phone-pad"
              returnKeyType="done"
              onChangeText={value => this.setCashAmountInPaymentArray(value)}
            />
          </View>
        )}
        {/* FOR ONLINE */}
        { shouldRenderCards && this.renderCardHolder() }
      </View>
    );
  }
  ifOtherMethodeIsOnline() {
    const filterArray = this.state.paymentMethodsArray.filter(
      obj => obj.POSSName && obj.POSSName.toLowerCase() !== CASH_PAYMENT_POSSNAME && obj.selection == 1
    )
    if (filterArray[0]?.POSSName.toLowerCase() == ONLINE_PAYMENT_POSSNAME) return true
    else return false
  }
  setCashAmountInPaymentArray(amount) {
    const { totalAmount } = this.props;
    const array = this.state.paymentMethodsArray;
    const remainingAmount = totalAmount - amount;
    const hasOnlineSelected = this.ifOtherMethodeIsOnline();
    const isRemainingLessThanMin = remainingAmount < MINIMUM_ONLINE_PAYMENT;
    const remainingMinusMin = totalAmount - MINIMUM_ONLINE_PAYMENT;
    const isOnlineLessThanMin = hasOnlineSelected && isRemainingLessThanMin;
    const cashAmount = isOnlineLessThanMin
                            ? (remainingMinusMin < 0 ? 0 : remainingMinusMin)
                            : amount > totalAmount ? totalAmount : amount;
    const otherAmount = totalAmount - cashAmount;

    //if online is also selected
    if(hasOnlineSelected) {
      //warn
      if(isOnlineLessThanMin) {
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

    this.setState({ paymentMethodsArray: array });
  }
  onPress = (event, caption) => {
    switch (caption) {
      case strings.ADDD_NEW_ADDRESS:
        this.setState({ showNewAddress: !this.state.showNewAddress });
        break;

      case strings.BACK:
        Actions.pop();
        break;

      case CROSS_PRESSED:
        {
          this.setState({ showNewAddress: false });
        }
        break;

      case strings.SAVE_ADDRESS:
        if (!this.validateUserInputs()) {
          this.setState({ showNewAddress: !this.state.showNewAddress });
          this.saveNewAddresstoServer();
        }
        break;

      case strings.CONTINUE:
        this.continue();
        break;

      default:
    }
  };
  validatePaymentsParams() {
    const filterArray = this.state.paymentMethodsArray.filter(obj => obj.selection == 1);
    const arrayOfPaymentsCashAndOnline = filterArray.filter(
      obj => obj.POSSName.toLowerCase() == ONLINE_PAYMENT_POSSNAME || obj.POSSName.toLowerCase() == CASH_PAYMENT_POSSNAME
    );

    const paymentsCashObject = filterArray.find(
      obj => obj.POSSName.toLowerCase() == CASH_PAYMENT_POSSNAME
    );
    const walletArray = filterArray.filter(obj => obj.POSSName.toLowerCase() == WALLET_PAYMENT_CODE);

    if (filterArray.length == 0) {
      this.setState({
          extraPopupVisible: true,
          extraPopupMessage: 'Select at least one payment method'
      });
      return false
    } else if (filterArray.length == 1 && paymentsCashObject !== undefined) {
      if(this.props.totalAmount > paymentsCashObject.Amount){
        this.setState({
          alertVisibilty: true,
          alertMessage: 'Cash total amount is less then total bill',
          alertTitle: 'WHOOPS!'
        })
        return false
      }else {
        return true
      }
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
                    redeemIndex > -1 && this.state.paymentMethodsArray[i].methods[redeemIndex].selection == 1
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
                    voucherIndex > -1 && this.state.paymentMethodsArray[i].methods[voucherIndex].selection == 1
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
          return true;
      }
    }
  }

  goToPaymentWebView(amount, paymentFormDataParams, paymentID) {

    const expressPayment = this.cardsHolder.getCardSelection();

    Actions.paymentviewlegacy({
      returnView: 'home',
      origin: 'qrcodescannedbill',
      submitTransaction: this.props.insertPaymentParts,
      onlineAmount: amount,
      paymentFormDataParams: paymentFormDataParams,
      orderID: paymentID,
      paymentKey: 'Code',
      expressPayment
    });
  }

  goToPostPaymentWebView (OrderId, PaymentURL) {
    Actions.paymentview({
      returnView: 'home',
      successView: 'home',
      url: PaymentURL,
      OrderId
    })
  }

  continue () {
    if (!this.validatePaymentsParams()) {
      return;
    }

    this.setState({
      processing: true
    })

    let formdata = new FormData();
    formdata.append('OrgId', ORGANIZATION_ID);
    formdata.append('OrderId', this.state.scannedBillData.OrderId);
    formdata.append('PaymentId', this.state.scannedBillData.PaymentId);
    formdata.append('LoyaltyId', this.props.LoyaltyId);
    formdata.append('ChannelId', CHANNEL_ID);

    const { totalAmount } = this.props;
    let subTotal = totalAmount;

    var x = 0;
    const paymentID = new Date().valueOf();
    for (var i = 0; i < this.state.paymentMethodsArray.length; i++) {
      if (this.state.paymentMethodsArray[i].selection == 1) {
          if (this.state.paymentMethodsArray[i].POSSName.toLowerCase() == WALLET_PAYMENT_CODE) {
            const redeemIndex = _.findIndex(this.state.paymentMethodsArray[i]?.methods, method =>
              method.POSSName.toLowerCase() === REDEEMABLE_PAYMENT_POSSName
            );
            if (redeemIndex > -1 &&
               this.state.paymentMethodsArray[i].methods[redeemIndex].selection == 1 &&
               this.state.paymentMethodsArray[i].methods[redeemIndex].POSSName.toLowerCase() == REDEEMABLE_PAYMENT_POSSName) {
              const value = this.state.paymentMethodsArray[i].methods[redeemIndex];  
              const payment1Amount = value.Amount;
                
                //only log settlements for payments other that online payments since that will be added automatically
                if (i !== 0)
                  formdata.append('paymentParts[' + x + '][Settlement]', String(payment1Amount));
                formdata.append('paymentParts[' + x + '][Currency]', this.props.currency);
                formdata.append(
                  'paymentParts[' + x + '][Category]',
                  value.Name
                );
                formdata.append(
                  'paymentParts[' + x + '][PaymentTypeId]',
                  value.POSCode
                );
                //minus amount from total if not online amount
                if (i !== 0) subTotal -= payment1Amount;
             // } 
             x++;
            }
            const voucherIndex = _.findIndex(this.state.paymentMethodsArray[i]?.methods, method =>
              method.POSSName.toLowerCase() === VOUCHER_PAYMENT_POSSName
            );
            if (voucherIndex > -1 &&
               this.state.paymentMethodsArray[i].POSSName == WALLET_PAYMENT_CODE &&
               this.state.paymentMethodsArray[i].methods[voucherIndex].selection == 1 &&
               this.state.paymentMethodsArray[i].methods[voucherIndex].POSSName.toLowerCase() == VOUCHER_PAYMENT_POSSName) {  
                for (var a = 0; a < this.state.selectedVoucherArray.length; a++) {
                  const value = this.state.paymentMethodsArray[i].methods[voucherIndex];
                  const paymentAmount = this.state.selectedVoucherArray[a].Amount;

                  if (i !== 0)
                    formdata.append('paymentParts[' + x + '][Settlement]', String(paymentAmount));
                  formdata.append('paymentParts[' + x + '][Category]', 'Voucher');
                  formdata.append(
                    'paymentParts[' + x + '][PaymentTypeId]',
                    this.state.paymentMethodsArray[i].methods[voucherIndex].POSCode
                  );
                  formdata.append(
                    'paymentParts[' + x + '][ConfirmationCode]',
                    this.state.selectedVoucherArray[a].voucherNo
                  );
                  formdata.append(
                    'paymentParts[' + x + '][Currency]',
                    this.props.currency
                  );
                  //minus amount from total
                  subTotal -= paymentAmount;
                  x++;
                }
              }
           // }
          } else {
            const paymentAmount = this.state.paymentMethodsArray[i].Amount;

            if (i !== 0)
              formdata.append('paymentParts[' + x + '][Settlement]', String(paymentAmount));
            formdata.append('paymentParts[' + x + '][Currency]', this.props.currency);
            formdata.append(
              'paymentParts[' + x + '][Category]',
              this.state.paymentMethodsArray[i].Name
            );
            formdata.append(
              'paymentParts[' + x + '][PaymentTypeId]',
              this.state.paymentMethodsArray[i].POSCode
            );
            //minus amount from total if not online amount
            if (i !== 0) subTotal -= paymentAmount;
          }
          x++;
        }
    //  }
    }

    const filterArrayforOnline = this.state.paymentMethodsArray.filter(
      obj => obj.selection == 1 && obj.POSSName.toLowerCase() == ONLINE_PAYMENT_POSSNAME
    );

    const hasOnlineSelected = filterArrayforOnline.length == 1;
    //ensure there is a selection [ NEW CARD or EXISTING CARD ]
    const { cvv, token, saveCard } = this.getCardSelection();
    const {
      selectedCurrency: { Currency: currencyType, Rate: currencyRate }
    } = this.state

    if (hasOnlineSelected) {
      //if online payment is less than the required amount, please warn user
      if(subTotal < MINIMUM_ONLINE_PAYMENT) return alert(MINIMUM_ONLINE_PAYMENT_WARNING(MINIMUM_ONLINE_PAYMENT));
      //ensure there is a selection [ NEW CARD or EXISTING CARD ]
      //if CVV is blank
      // if(!cvv && token && token != 'new') return alert("Please Input your Credit Card's CVV / CVC number.");
      if(!token) return alert("Please make an Online selection.");

      formdata.append('paymentParts[0][OnlineId]', paymentID);
      formdata.append('paymentParts[0][Settlement]', subTotal); // / currencyRate);
      formdata.append('paymentParts[0][SaveCard]', saveCard ? 1 : 0);
      formdata.append('paymentParts[0][OnlineType]', 'mastercard');
      formdata.append(
        'paymentParts[0][CardToken]',
        token === 'new' ? null : token
      );
      // set payment status to pending
      formdata.append('paymentParts[0][Status]', 'pending');
      // formdata.append('PaymentServer', '1');
      formdata.append('OnlineCurrency', currencyType)
      // send order to server pending payment
       this.props.preInsertDineInPayment(formdata);
      return;

    } else {
       this.processTransaction(formdata);
    }
  }

  processTransaction (formdata) {
    this.setState({ processing: true });
    this.props.insertDineInPayment(formdata);
  }

  checkForRedeemableMethod() {
    return true;
  }
  getStars(amount) {
    const stars = parseInt(amount / 1000);
    if (stars < 2) {
      return stars + ' STAR';
    } else {
      return stars + ' STARS';
    }
  }
  onGameDataCrossPress = () => {
    this.setState({ gameDataPopupVisibilty: false });
  };
  render() {
    const { processing } = this.state
    const {
      mainContainerStyle,
      container,
      subContainer,
      addressContainerViewStyle,
      totalPaymentTextPrice,
      totalPaymentBelowTextPrice,
      totalPaymentBelowStartTextPrice,
      continueButtonStyle
    } = styles;
    const {
      componentTheme: { thirdColor, ARROW_LEFT_RED },
      statusPopupVisibility,
      statusTitle,
      statusMessage,
      loading
    } = this.state;

    if (this.state.scannedBillData.message == 'QR Code already scanned') {
      return (
        <BoostYourStartPopUp
          onCrossPress={this.onRQCrossPress}
          modalVisibilty={this.state.alreadyScannedPopupVisibilty}
          selectedHeading={'UH-OH!'}
          selectedSubHeading={'QR Code already scanned'}
          // selectedDetails={this.state.selectedDetails}
          appTheme={this.state.componentTheme}
        />
      );
    }

    if (
      this.state.scannedBillData.PaymentStatus == 'done' &&
      this.state.userGameData.message == ''
    ) {
      return (
        <BoostYourStartPopUp
          onCrossPress={this.onRQCrossPress}
          modalVisibilty={this.state.donePopupVisibilty}
          selectedHeading={'UH-OH!'}
          selectedSubHeading={'Bill already settled'}
          // selectedDetails={this.state.selectedDetails}
          appTheme={this.state.componentTheme}
        />
      );
    }

    const { scannerDetail: { TotalAmount } } = this.props
    return (
      <KeyboardAvoidingView
        style={mainContainerStyle}
        contentContainerStyle={container}
        behavior={IF_OS_IS_IOS ? 'position' : null}>
        {this.state.userGameData &&
          this.state.userGameData.WinBody && (
            <BoostYourStartPopUp
              onCrossPress={this.onGameDataCrossPress}
              modalVisibilty={this.state.gameDataPopupVisibilty}
              selectedHeading={this.state.userGameData.WinTitle}
              selectedSubHeading={this.state.userGameData.WinBody}
              appTheme={this.state.componentTheme}
            />
          )}
        <BoostYourStartPopUp
          onCrossPress={this.onRQCrossPress}
          modalVisibilty={this.state.paymentSuccessPopUp}
          selectedHeading={'ALL DONE!'}
          selectedSubHeading={'THANKS FOR SETTLING'}
          // selectedDetails={this.state.selectedDetails}
          appTheme={this.state.componentTheme}
        />
        <CommonPopup
          onClose={this.handleOnClosePopup}
          visibilty={statusPopupVisibility}
          heading={statusTitle}
          subbody={statusMessage}
          color={thirdColor}
        />
        <CommonPopup
          onClose={() => {
            this.setState({
                alertVisibilty: false,
                alertMessage: ''
            })
          }}
          visibilty={this.state.alertVisibilty}
          heading={this.state.alertTitle}
          subbody={this.state.alertMessage}
          color={thirdColor}
        />
        <CommonLoader isLoading={loading} />

        <ScrollView ref="scrollView" style={{ flex: 1, width: '100%' }} bounces={false}>
          <View style={subContainer}>
            <TitleBar
               onPress={event => this.onPress(event, strings.BACK)}
               color={thirdColor}
               backIcon={ARROW_LEFT_RED}
               titleText={strings.BACK}
            />
          </View>
          <View>
            <View
              style={[
                styles.scannedPaymentViewStye,
                { backgroundColor: this.state.componentTheme.thirdColor }
              ]}>
              <Text allowFontScaling={FONT_SCALLING} style={totalPaymentTextPrice}>
                {numberWithCommas(this.state.scannedBillData.ReceiptAmount || 0, this.props.currency)}{' '}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <Text allowFontScaling={FONT_SCALLING} style={totalPaymentBelowStartTextPrice}>
                  {this.state.scannedBillData.StarsCollection}
                </Text>
                <Text allowFontScaling={FONT_SCALLING} style={totalPaymentBelowStartTextPrice}>
                  {' '}{strings.STARS.toUpperCase()}
                </Text>
                <Text allowFontScaling={FONT_SCALLING} style={totalPaymentBelowTextPrice}>
                  {' '}
                  {strings.WILL_BE_ADDED}
                </Text>
              </View>
              <Text allowFontScaling={FONT_SCALLING} style={totalPaymentBelowTextPrice}>
                {strings.TO_YOUR_ACCOUNT}
              </Text>
            </View>
            <View />
            <View style={[addressContainerViewStyle, { borderBottomWidth: 1 }]}>
              <View style={styles.paymentViewStyle}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[
                    styles.subsectionHeadingViewStyle,
                    { color: this.state.componentTheme.thirdColor }
                  ]}>
                  {strings.LETS_SETTTING.toUpperCase()}
                </Text>
              </View>

              {this.state.paymentMethodsArray.map((rowObj, i) => {
                return (
                  <View key={i} style={{ flex: 1, backgroundColor: APP_COLOR_WHITE }}>
                    {rowObj.POSSName && this.getPaymentRow(rowObj, i, strings.PAYMENT_METHOD)}
                    {rowObj.POSSName === WALLET_PAYMENT_CODE && rowObj.methods.length &&
                      this.getWalletView(rowObj)}
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={continueButtonStyle}>
          <Button
            disabled={processing}
            onPress={event => this.onPress(event, strings.CONTINUE)}
            style={[
              COMMON_BUTTON_STYLE,
              { alignSelf: 'center', backgroundColor: this.state.componentTheme.thirdColor }
            ]}>
            <Text
              allowFontScaling={FONT_SCALLING}
              style={[COMMON_BUTTON_TEXT_STYLE, { fontFamily: ROADSTER_REGULAR }]}>
              {strings.CONTINUE.toUpperCase()}
            </Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = {
  cashAmountViewStyle: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_COLOR_BLACK,
    alignSelf: 'center',
    marginEnd: 5
  },
  continueButtonStyle: {
    height: 79.5,
    backgroundColor: APP_COLOR_WHITE,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  totalPaymentBelowStartTextPrice: {
    fontSize: 23,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_WHITE
  },
  totalPaymentBelowTextPrice: {
    fontSize: 23,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_BLACK
  },
  totalPaymentTextPrice: {
    marginTop: 5,
    fontSize: 40,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_WHITE
  },
  scannedPaymentViewStye: {
    backgroundColor: APP_COLOR_RED,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center'
  },
  getRowtouchStyle: {
    alignItems: 'center',
    height: 30
  },
  redeemableVoucherStyle: {
    width: 120,
    justifyContent: 'flex-start'
  },
  redeemableAmountInput: {
    fontFamily: DIN_CONDENSED,
    width: '100%',
    marginTop: -4
  },
  amountInnerViewstyle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  priceViewStyle: {
    flexDirection: 'column',
    alignItems: 'center',
    marginStart: 80,
    marginTop: IF_OS_IS_IOS ? -30 : -10
  },

  amountViewstyle: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: -30
  },
  walletinnerviewStyle: {
    height: 40,
    backgroundColor: APP_COLOR_BLACK,
    marginStart: 10,
    marginTop: 10
  },
  unslectedTopColor: {
    borderRadius: 8,
    width: 16,
    height: 16,
    backgroundColor: TRANSPARENT_COLOR,
    borderWidth: 2,
    borderColor: APP_COLOR_RED,
    marginTop: 1
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
  addressContainerViewStyle: {
    borderBottomWidth: 1,
    borderColor: APP_COLOR_WHITE,
    paddingBottom: 12,
    backgroundColor: APP_COLOR_WHITE
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
    color: APP_COLOR_RED,
    marginStart: 10,
    marginTop: IF_OS_IS_IOS ? 7 : 0,
    textTransform: 'uppercase'
  },
  subsectionHeadingViewStyle: {
    fontSize: 30,
    color: APP_COLOR_RED,
    fontFamily: DINENGSCHRIFT_REGULAR,
    marginStart: 10,
    marginTop: 5
  },
  mainContainerStyle: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT
  },
  container: {
    flex: 1,
    width: null,
    height: null,
    alignItems: 'center',
    backgroundColor: APP_COLOR_WHITE
  },
  subContainer: {
    height: TITLE_CONTAINER_HEIGHT,
    backgroundColor: APP_COLOR_WHITE,
    flexDirection: 'row',
    paddingTop: IF_OS_IS_IOS ? 7 : 0
  },
  onlineStyle: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexDirection: 'column'
  },
  itemQuanityRowStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 0,
    alignItems: 'center',
    flex: 1,
    marginStart: 30,
    marginTop: 0,
    height: 'auto',
    backgroundColor: APP_COLOR_WHITE
  },
  timeInnerViewStyle: {
    flexDirection: 'row',
    borderWidth: 0,
    alignItems: 'center',
    backgroundColor: APP_COLOR_RED,
    flex: 1,
    marginStart: 30,
    marginTop: 0,
    height: 30
  },
  selectedDotColor: {
    backgroundColor: APP_COLOR_WHITE,
    borderRadius: 8,
    width: 16,
    height: 16,
    marginTop: 1
  },
  paymentViewStyle: {
    height: SUBSELECTION_HEADING_VIEW_HEIGHT,
    width: '100%',
    backgroundColor: APP_COLOR_WHITE,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 15
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
    transform: [{ rotate: '90deg' }],
  }
};

function mapStateToProps(state) {
  const {
    app: { userType, loading, currency, walletAmountBalance, accessToken },
    register: { loggedinUserInfo = {} },
    squardcorner: {
      scannerDetail = { data: { message: '', TotalAmount: 0 } },
      insertPaymentParts,
      gameData,
      insertPaymentPartsResponse,
      insertTimestamp,
      preInsertPaymentResponse
    },
    vouchers: { vouchersDine },
    
  } = state;
  const userData = getUserObject(state);
  const { data: { message: QRMessage } = { message: '' } } = scannerDetail;
  const isLoggedIn = userType == 'login';
  const { CustomerId, LoyaltyId, LevelName, FullMobile } = userData;
  const paymentMethods = getUserPaymentMethods(state);
  const { checkoutTokens, minimumOnlinePayment } = state.deliverydetails;
  return {
    checkoutTokens,
    ACCESS_TOKEN: accessToken,
    loadingState: loading,
    mobileNumber: FullMobile,
    customerId: CustomerId,
    LevelName,
    paymentMethods: paymentMethods !== undefined ? paymentMethods : [],
    totalAmount: scannerDetail.ReceiptAmount || 0,
    //insertPaymentPartsResponse: insertPaymentParts,
    currency,
    LoyaltyId,
    scannerDetail,
    vouchers: vouchersDine,
    userWalletAmount: walletAmountBalance,
    QRMessage,
    gameData,
    insertPaymentPartsResponse: insertPaymentPartsResponse || insertPaymentParts,
    insertTimestamp,
    preInsertPaymentResponse,
    minimumOnlinePayment
  };
}
const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...deliveryDetailsAction,
      ...squadAction,
      ...vouchersActions
    },
    dispatch
  )
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QRCodeScannedBill);
