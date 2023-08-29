import React, { Component } from 'react';
import {
    Text,
    View,
    Image,
    ScrollView,
    ImageBackground,
    TouchableOpacity,
    BackHandler,
    AppState,
    PermissionsAndroid,
    Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import { Actions } from 'react-native-router-flux';
import { createImageProgress } from 'react-native-image-progress';
import * as Animatable from 'react-native-animatable';
import { actions as homeActions } from '../../ducks/home';
import { actions as notificationActions } from '../../ducks/notifications';
import { actions as categoryActions } from '../../ducks/categories';
import { actions as deliveryActions } from '../../ducks/deliverydetails';
import { connect } from 'react-redux';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Beacons from '@nois/react-native-beacons-manager';
import { numberWithCommas } from '../../config/common_functions';
import { bindActionCreators } from 'redux';
import { getUserObject, getUserPaymentMethods } from '../../helpers/UserHelper';
import { findUUIDInBranches } from '../../helpers/BranchHelper';
import { getThemeByLevel } from '../../config/common_styles/appthemes';
import { findItemInMenuBy, selectModifiers } from '../../helpers/MenuHelper';
import Slider from './Slider';
import {
    convertMealeArrayToCartArray,
    convertUsualMealeArrayToCartArray,
} from '../../config/common_functions';
import { actions as appstateAction } from '../../ducks/setappstate';
import { BoostYourStartPopUp } from '../../components';
import { actions as branchesActions } from '../../ducks/branches';
import {
    ARROW_RIGHT_BLACK,
    HOME_BG_IMG,
    ARROW_RIGHT_WHITE,
    BACKGROUND_IMAGE_LOGO
} from '../../assets/images';
import strings from '../../config/strings/strings';
import {
    APP_COLOR_WHITE,
    APP_COLOR_RED,
    APP_COLOR_BLACK,
    DETAIL_TEXT_COLOR,
    ORDER_STATUS_STATUS_BAR_GRAY,
    TRANSPARENT_COLOR
} from '../../config/colors';
import {
    DINENGSCHRIFT_REGULAR,
    DINENGSCHRIFT_BOLD,
    ROADSTER_REGULAR,
    HELVETICANEUE_LT_STD_CN,
    DIN_CONDENSED
} from '../../assets/fonts';
import { Button } from 'native-base';
import { actions as cartActoins } from '../../ducks/cart';
import { actions as squadAction } from "../../ducks/squardcorner";
import {
    COMMON_BUTTON_RADIOUS,
    COMMON_BUTTON_TEXT_SCALED_STYLE,
    IF_OS_IS_IOS,
    COMMON_BUTTON_SCALED_STYLE,
    FONT_SCALLING,
    COMMON_BUTTON_TEXT_STYLE,
    COMMON_BUTTON_STYLE
} from '../../config/common_styles';
import { KEY_RECOMMENDED_SHOWING } from '../../config/constants/network_api_keys';
import { detectBeaconProximity, checkBluetoothStatus, sortBeaconsFromBranches } from '../../helpers/BeaconHelper';
import { isEmpty } from "ramda";
import Common from "../../components/Common";
import Loader from '../../components/Loader';

const AnimatedImage = createImageProgress(Animatable.Image);
const GOTO_MENU_TEXT_SIZE = moderateScale(19);
const GOTO_MENU_CONTAINER_PADDING = moderateScale(5);
const GOTO_MENU_ARROW_WIDTH = scale(9);
const GOTO_MENU_ARROW_HEIGHT = verticalScale(15);
const GOTO_MENU_ARROW_MARGIN_LEFT = scale(4);
// const HORIZONTAL_LIST_HEIGHT = verticalScale(259.5);
const HORIZONTAL_LIST_HEIGHT = verticalScale(224.5);
const HORIZONTAL_LIST_ITEM_WIDTH = scale(333);
const HORIZONTAL_LIST_ITEM_TITLE_TEXT_SIZE = moderateScale(25.5);
const HORIZONTAL_LIST_ITEM_IMAGE_CONTAINER_HEIGHT = verticalScale(136);
const HORIZONTAL_LIST_ITEM_LARGE_IMAGE_WIDTH = scale(166.5);
const HORIZONTAL_LIST_ITEM_LARGE_IMAGE_HEIGHT = verticalScale(136);
const HORIZONTAL_LIST_ITEM_LARGE_IMAGE_WIDTH_2 = scale(146.5);
const HORIZONTAL_LIST_ITEM_SMALL_IMAGE_WIDTH = scale(81.5);
const HORIZONTAL_LIST_ITEM_SMALL_IMAGE_WIDTH_2 = scale(72);
const HORIZONTAL_LIST_ITEM_SMALL_IMAGE_HEIGHT = verticalScale(67.5);
const HORIZONTAL_LIST_ITEM_IMAGES_MARGIN = moderateScale(1.5);
const DETAIL_TEXT_SIZE = moderateScale(18);
const GO_FOR_IT_BUTTON_WIDTH = scale(108);
const GO_FOR_IT_BUTTON_HEIGHT = verticalScale(32);
const GO_FOR_IT_BUTTON_TEXT_SIZE = moderateScale(17.5);
const GO_FOR_IT_BUTTON_TOP_MARGIN = moderateScale(10);
const EDIT_ORDER_TEXT_SIZE = moderateScale(15.56);
const SQUADS_CORNER_MARGIN_BOTTOM = moderateScale(10);
const SQUADS_CORNER_LEFT_RIGHT_MARGIN = moderateScale(20);
const SQUADS_CORNER_TOP_BOTTOM_MARGIN = moderateScale(5);
const SQUADS_CORNER_TEXT_SIZE = moderateScale(23);
const SQUADS_CORNER_SUBHEADING_TEXT_SIZE = moderateScale(15);
const CHECK_STATUS_TEXT_SIZE = moderateScale(14.5);
const SCAN_YOUR_BILL_BUTTON_WIDTH = scale(165.7);
const SCAN_YOUR_BILL_BUTTON_HEIGHT = 32;
const SCAN_YOUR_BILL_BUTTON_TEXT_SIZE = moderateScale(15.75);
const DINE_IN_ONLY_TEXT_SIZE = moderateScale(15.5);
const NAVBAR_HEIGHT = IF_OS_IS_IOS ? verticalScale(76) : verticalScale(76);
const totalStars = 5400;
const redeemableAmount = 300000;
const LEFT_RIGHT_MARGIN = 20;
const TITLE_CONTAINER_HEIGHT = 260;
const TRACK_ORDER_SUBHEADING_TEXT_SIZE = 16;
const TRACK_ORDER_TEXT_SIZE = 21;
const { width, height } = Dimensions.get('window');

// const BEACON_UUID_TO_FOUND = '9581d098-63a8-4433-ad9b-819781da93db';
const BEACON_UUID_TO_FOUND = '9581d098-63a8-4433-ad9b-819781da93db';

class Home extends Component {
    constructor(props) {
        super(props);
        const theme = getThemeByLevel(this.props.userData.LevelName);
        this.state = {
            cartCount: 0,
            loggedInUserInfo: '',
            dataArray: [],
            mealsdataArray: [],
            usualMealsdataArray: [],
            userInfo: null,
            themeColor: theme.thirdColor,
            componentTheme: theme,
            connectionState: '',
            popupvisibilty: true,
            bluetoothPopupVisibilty: false,
            beaconPopupVisibilty: false,
            historyPopupVisibilty: false,
            branchesForbranches: [],
            doubleBackToExitPressedOnce: false,
            showPendingOrder: false,
            orderHistoryOldestObject: null,
            CustomURLLoaded: false,
            CustomURLLoading: true,
            showAddedConfirmation: false,
            reorderData: [],
            alertVisibilty: false,
            alertTitle: '',
        };
    }

    componentWillUnmount() {
        // console.log('======> UNMOUNTING HOME');
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
        // RNBluetoothInfo.removeEventListener('change', this.handleConnection);
        if (this.stopBeaconTimeout) clearInterval(this.stopBeaconTimeout);
    }

    async componentDidMount() {

        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        // console.log('======> MOUNTED HOME', AppState.currentState);
        const {
            userData: { CustomerId },
            accessToken,
            shouldGetVersion
        } = this.props;
        // shouldGetVersion && Actions.update({type: 'reset'}); // uncomment while making live build
        let fetchResources = true;
        if (AppState.currentState == 'background' || !accessToken) {
            Actions.splash({ type: 'reset' });
            fetchResources = false;
        }

        //make API calls
        if (fetchResources) {
            //fetch version info
            // this.props.getVersionStatus(VersionNumber.appVersion);

            //fetch side menu
            // this.props.getSideMenu();
            this.props.toggleLoader(true);

            if (this.props.isLoginUser) this.props.fetchUserOrdersCount();
            // this.props.getCurrency();

            //fetch notifications
            // if (CustomerId) this.props.getAllNotifications();

            //get all menu items if there aren't any items already
            if (!this.props.hasMenuItems) this.props.getAllMenu();

            //get banners
            this.props.getBanners();
            // load initialy needed data (from all the above API calls combined into one)
            this.props.getAppInitialData();
            this.props.userDetails();
        }

        //fetch cart items
        AsyncStorage.getItem('cartItems').then(data => {
            if (data) {
                try {
                    const cartItemsArray = JSON.parse(data);
                    if (cartItemsArray.length)
                        //set to cart if items are present
                        this.props.additmeToCart(cartItemsArray);
                } catch (e) {
                }
            }
        });

        //check if there was cached order
        AsyncStorage.getItem('cachedOrder')
            .then(data => {
                if (CustomerId && data) {
                    try {
                        const orderData = JSON.parse(data);
                        const formData = new FormData();
                        Object.keys(orderData).map(key => formData.append(key, orderData[key]))
                        console.log('Found cached order: ', orderData, formData);
                        this.showCachedOrderReorderOption(formData)
                    } catch (e) {
                        console.log('Error parsing cached order');
                    }
                }
            });

        //check for correct permissions
        if (!IF_OS_IS_IOS) {
            this.checkForAndroidPermission();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userType === 'login') {
            this.setState({
                cartCount: nextProps.cartItemsCount,
            });
            if (nextProps.usualMealsData.length > 0) {
                this.setState({ usualMealsdataArray: nextProps.usualMealsData });
            } else {
                this.setState({ mealsdataArray: nextProps.mealsData });
            }
        } else {
            this.setState({ usualMealsdataArray: [] });
        }

        const { lastOrder: prevLastOrder } = this.props
        const {
            lastOrder,
            forceLogOut
        } = nextProps;

        if (forceLogOut) {
            this.props.setForceFalse(false);
            Actions.reset('splash', { logout: true });
        }

        if (nextProps.branches !== this.props.branches) {
            this.setState({ branchesForbranches: nextProps.branches });

            if (nextProps.branches.length > 0) {
                const beacons = sortBeaconsFromBranches(nextProps.branches)
                if (beacons.length > 0) {
                    detectBeaconProximity(beacons, this.handleDetectSuccess, this.handleDetectStopped);
                }
            }
        }

        if (nextProps.pendingOrder) {
            if (nextProps.pendingOrder > 0) {
                this.setState({ showPendingOrder: true });
            }
        }
        if (nextProps.orderHistoryArray) {
            if (nextProps.pendingOrder && nextProps.pendingOrder > 0) {
                this.setState({ orderHistoryOldestObject: nextProps.orderHistoryArray[0] });
            }
        }

        // last order logic
        const { timestamp: lastOrderTimestamp } = prevLastOrder
        if (lastOrder.timestamp > lastOrderTimestamp) {
            //process logic
            console.log('PROCESS LAST ORDER LOGIC', lastOrder.order)
            this.processLastOrder(lastOrder)
        }
    }

    handleDetectSuccess = beaconFilter => {
        this.props.setLoadingState(false);
        const { branches = [] } = this.props;
        const foundBranch = findUUIDInBranches(beaconFilter[0].UUID, branches);
        Actions.wheel_game({ branch: foundBranch });
    };

    handleDetectStopped = () => {
        this.props.setLoadingState(false);
        this.setState({ beaconPopupVisibilty: true });
    };

    async checkForAndroidPermission() {
        const StoragePermissionTitle = 'Bar Tartine needs Write Permissions to your Storage';
        const StoragePermissionMsg =
            "Bar Tartine needs to access your device's storage " +
            'so that it may store menu images and load faster.';
        const { GRANTED } = PermissionsAndroid.RESULTS;
        try {
            const WriteRights = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: StoragePermissionTitle,
                    message: StoragePermissionMsg
                }
            );

            if (!WriteRights === GRANTED) {
                this.setState({
                    alertVisibilty: true,
                    alertTitle: 'Bar Tartine does not have permission to write files to your device\'s storage. Grant Write Permissions for a better experience.',
                })
            }

            const ReadRights = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    title: StoragePermissionTitle.replace('Write', 'Read'),
                    message: StoragePermissionMsg
                }
            );

            if (!ReadRights === GRANTED) {
                this.setState({
                    alertVisibilty: true,
                    alertTitle: 'Bar Tartine does not have permission to read files from your device\'s storage. Grant Read Permissions for a better experience.',
                })
            }
        } catch (e) {
        }
    }

    showCachedOrderReorderOption = formData => {
        const { loadingState } = this.props;
        if (loadingState) setTimeout(() => this.showCachedOrderReorderOption(formData), 2e3);
        else {
            this.setState({
                showAddedConfirmation: true,
                reorderData: formData
            });
        }
    }

    renderAddedConfirmation() {
        const {
            componentTheme: { thirdColor },
        } = this.state;
        const { favPopupButton, favPopupButtonText, favPopupContainer } = styles;
        return (
            <View style={favPopupContainer}>
                <Button style={favPopupButton} onPress={() => {
                    AsyncStorage.removeItem('cachedOrder')
                    this.handleHideAddedConfirmation()
                    this.props.clearCart();
                }} color={thirdColor}>
                    <Text style={{ ...favPopupButtonText, fontSize: scale(15) }}>{strings.CANCEL.toUpperCase()}</Text>
                </Button>
                <Button style={favPopupButton} onPress={() => this.onCartPress()} color={thirdColor}>
                    <Text style={{ ...favPopupButtonText, fontSize: scale(15) }}>{strings.RE_ORDER}</Text>
                </Button>
            </View>
        );
    }
    handleHideAddedConfirmation = () => {
        this.setState({
            showAddedConfirmation: false
        });
    }
    handleConnection = resp => {
        let { connectionState } = resp.type;
        //console.log('type ', connectionState);
        this.setState({ connectionState });
    };

    handleBackPress() {
        BackHandler.exitApp();
    }

    checkBluetoothAndOnBeacon = () => {
        checkBluetoothStatus(
            () => this.props.getBranchesForBeacon(),
            () => this.setState({ bluetoothPopupVisibilty: true })
        );
    };

    updateAppthemeFromCurrencyAPI(points) {
        AsyncStorage.setItem('theme', JSON.stringify(THEME_LEVEL_1));
    }

    onCrossPress = () => {
        this.setState({
            bluetoothPopupVisibilty: false,
            beaconPopupVisibilty: false,
            historyPopupVisibilty: false
        });
    };

    renderCheckInButton() {
        const {
            SpinTheWheel
        } = this.props;

        // dont render
        if (!SpinTheWheel?.Status) return null;

        return SpinTheWheel?.Status && SpinTheWheel?.ButtonBg ? (
            <TouchableOpacity
                style={styles.checkInContainerStyle}
                onPress={event => this.onPress(event, strings.CHECK_IN)}>
                <AnimatedImage
                    animation={'fadeIn'}
                    duration={1e3}
                    easing="ease-out-expo"
                    style={styles.customCheckInImage}
                    source={{ uri: SpinTheWheel?.ButtonBg }}
                    resizeMode="contain" />
            </TouchableOpacity>
        ) : null
    }

    homeUpperNormalView() {
        const {
            historyData,
            isAuthUser,
            hasMenuItems,
            banners: { GoMenuBtnBg, GoMenuBtnFontColor, HomePageBg }
        } = this.props;

        const ImageSource = HomePageBg ? { uri: HomePageBg } : HOME_BG_IMG;

        return (
            <View style={[styles.horizontalListContainer, { backgroundColor: TRANSPARENT_COLOR }]}>
                <AnimatedImage
                    animation={'fadeIn'}
                    duration={1e3}
                    easing="ease-out-expo"
                    style={[styles.mealsContainer]}
                    source={ImageSource}>
                    <TouchableOpacity
                        style={[styles.gotoMenuContainerStyle, { backgroundColor: GoMenuBtnBg ? GoMenuBtnBg : APP_COLOR_RED }]}
                        onPress={event => this.onPress(event, strings.GO_TO_MENU)}>
                        <Text allowFontScaling={FONT_SCALLING} style={[styles.gotoMenuTextStyle, { color: GoMenuBtnFontColor ? GoMenuBtnFontColor : APP_COLOR_WHITE }]}>
                            {strings.GO_TO_MENU.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                    {this.renderCheckInButton()}
                </AnimatedImage>
            </View>
        );
    }

    calculateItems = items => {
        var total = 0;
        for (var i = 0; i < items.length; i++) {
            total = total + parseInt(items[i].Quantity, 10);
        }
        return total;
    };
    numberToEnglish = n => {
        var string = n.toString(),
            units,
            tens,
            scales,
            start,
            end,
            chunks,
            chunksLen,
            chunk,
            ints,
            i,
            word,
            words,
            and = 'and';

        /* Is number zero? */
        if (parseInt(string) === 0) {
            return 'zero';
        }

        /* Array of units as words */
        units = [
            '',
            'one',
            'two',
            'three',
            'four',
            'five',
            'six',
            'seven',
            'eight',
            'nine',
            'ten',
            'eleven',
            'twelve',
            'thirteen',
            'fourteen',
            'fifteen',
            'sixteen',
            'seventeen',
            'eighteen',
            'nineteen'
        ];

        /* Array of tens as words */
        tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

        /* Array of scales as words */
        scales = [
            '',
            'thousand',
            'million',
            'billion',
            'trillion',
            'quadrillion',
            'quintillion',
            'sextillion',
            'septillion',
            'octillion',
            'nonillion',
            'decillion',
            'undecillion',
            'duodecillion',
            'tredecillion',
            'quatttuor-decillion',
            'quindecillion',
            'sexdecillion',
            'septen-decillion',
            'octodecillion',
            'novemdecillion',
            'vigintillion',
            'centillion'
        ];

        /* Split user arguemnt into 3 digit chunks from right to left */
        start = string.length;
        chunks = [];
        while (start > 0) {
            end = start;
            chunks.push(string.slice((start = Math.max(0, start - 3)), end));
        }

        /* Check if function has enough scale words to be able to stringify the user argument */
        chunksLen = chunks.length;
        if (chunksLen > scales.length) {
            return '';
        }

        /* Stringify each integer in each chunk */
        words = [];
        for (i = 0; i < chunksLen; i++) {
            chunk = parseInt(chunks[i]);

            if (chunk) {
                /* Split chunk into array of individual integers */
                ints = chunks[i]
                    .split('')
                    .reverse()
                    .map(parseFloat);

                /* If tens integer is 1, i.e. 10, then add 10 to units integer */
                if (ints[1] === 1) {
                    ints[0] += 10;
                }

                /* Add scale word if chunk is not zero and array item exists */
                if ((word = scales[i])) {
                    words.push(word);
                }

                /* Add unit word if array item exists */
                if ((word = units[ints[0]])) {
                    words.push(word);
                }

                /* Add tens word if array item exists */
                if ((word = tens[ints[1]])) {
                    words.push(word);
                }

                /* Add 'and' string after units or tens integer if: */
                if (ints[0] || ints[1]) {
                    /* Chunk has a hundreds integer or chunk is the first of multiple chunks */
                    if (ints[2] || (!i && chunksLen)) {
                        /* words.push( and );*/
                    }
                }

                /* Add hundreds word if array item exists */
                if ((word = units[ints[2]])) {
                    words.push(word + ' hundred');
                }
            }
        }

        return words.reverse().join(' ');
    };
    formatDateTime = (datetime, scheduled) => {
        console.log(datetime);
        console.log(scheduled);
        if (datetime !== undefined) {
            // var date = new Date(datetime);
            var now = moment(datetime).format('DD/MM/YYYY');

            var now1 = moment(datetime).format('hh:mm A');

            if (scheduled) {
                return now + ' AT ' + now1;
            } else {
                return ' AT ' + now1;
            }
        }
        return ' ';
    };
    handleGoToMyOrder = () => {
        const {
            userData: { CustomerId }
        } = this.props;
        if (CustomerId) Actions.myorders({ title: 'My Orders'.toUpperCase() });
        else {
            this.setState({
                alertVisibilty: true,
                alertTitle: `Please Log In / Register\nto track your Orders`,
            })
        }
    };

    total = (array) => {
        let result = 0;
        for (let i = 0; i < array.length; i++) {
            result += parseInt(array[i].PaymentAmount);
        }
        return result;

    }

    homeUpperOrderView() {
        const { orderHistoryOldestObject } = this.state;
        const { AddressTypeLabel = '', StatusLabel = '', ScheduleTime, DeliveryTime, Payments, paymentParts } = orderHistoryOldestObject || {};
        return (
            <View
                style={[
                    styles.subContainerOrder,
                    {
                        height: 230,
                        backgroundColor: this.state.themeColor
                    }
                ]}>
                <ScrollView scrollEnabled={false}>
                    <View style={[styles.trackOrderRowContainer, { marginTop: 10 }]} />
                    <View style={styles.trackOrderRowContainer}>
                        <View style={styles.trackOrderRowContainerLeftStyle}>
                            <Text allowFontScaling={FONT_SCALLING}
                                style={[styles.trackOrderTextStyle, { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }]}
                            >
                                {strings.ORDER_DETAILS.toUpperCase()}
                            </Text>
                        </View>
                        <View style={[styles.trackOrderRowContainerRightStyle]}>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                                onPress={this.handleGoToMyOrder}>
                                <Text
                                    allowFontScaling={FONT_SCALLING}
                                    style={[
                                        styles.trackOrderTextStyle,
                                        { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }
                                    ]}>
                                    {strings.MY_ORDERS.toUpperCase()}
                                </Text>
                                <Image
                                    style={[{ marginTop: IF_OS_IS_IOS ? -7 : 0, height: 16, width: 10 }]}
                                    source={ARROW_RIGHT_WHITE}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.trackOrderRowContainer}>
                        <View style={styles.trackOrderRowContainerLeftStyle}>
                            <Text
                                allowFontScaling={FONT_SCALLING}
                                style={[
                                    styles.trackOrderTextStyle,
                                    { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }
                                ]}>
                                {strings.STATUS.toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.trackOrderRowContainerRightStyle}>
                            <Text
                                allowFontScaling={FONT_SCALLING}
                                style={[styles.trackOrderRightTextStyle, { flexDirection: 'row' }]}>
                                {StatusLabel.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.trackOrderRowContainer}>
                        <View style={styles.trackOrderRowContainerLeftStyle}>
                            <Text
                                allowFontScaling={FONT_SCALLING}
                                style={[
                                    styles.trackOrderTextStyle,
                                    { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }
                                ]}>
                                {strings.DELIVERY.toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.trackOrderRowContainerRightStyle}>
                            <Text allowFontScaling={FONT_SCALLING} style={[styles.trackOrderRightTextStyle, { paddingBottom: 5 }]}>
                                {AddressTypeLabel && AddressTypeLabel.toUpperCase()}
                                {/* MAY HOME */}
                            </Text>
                            <View
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                                onPress={event => this.onPress(event, strings.EARN_MORE)}>
                                <Text allowFontScaling={FONT_SCALLING} style={styles.checkOrderTextStyle}>
                                    {/* In 30 Minutes */}
                                    {
                                        ScheduleTime && ScheduleTime !== '0000-00-00 00:00:00' ?
                                            this.formatDateTime(ScheduleTime, true)
                                            : DeliveryTime && DeliveryTime !== '0000-00-00 00:00:00' ?
                                                this.formatDateTime(DeliveryTime, false)
                                                : null
                                    }
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.trackOrderRowContainer, { marginTop: 10 }]}>
                        <View style={styles.trackOrderRowContainerLeftStyle}>
                            <Text
                                allowFontScaling={FONT_SCALLING}
                                style={[
                                    styles.trackOrderTextStyle,
                                    { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }
                                ]}>
                                {strings.TOTAL_AMOUNT.toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.trackOrderRowContainerRightStyle}>
                            {Payments && Payments.length ? (
                                <Text allowFontScaling={FONT_SCALLING} style={styles.trackOrderRightTextStyle}>
                                    {!Payments[0].PaymentAmount
                                        ? ''
                                        :
                                        this.props.currency ? numberWithCommas(this.total(Payments), this.props.currency) : ''
                                    }
                                </Text>
                            ) : null}
                        </View>
                    </View>
                    <View style={[styles.trackOrderRowContainer, { flexDirection: 'column' }]}>
                        <View style={styles.trackOrderRowContainerLeftStyle}>
                            <Text
                                allowFontScaling={FONT_SCALLING}
                                style={[
                                    styles.trackOrderTextStyle,
                                    { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }
                                ]}>
                                {strings.PAYMENT_METHOD.toUpperCase()}
                            </Text>
                        </View>
                        <View style={[styles.trackOrderRowContainerRightStyle, { flexDirection: 'row', flexWrap: 'wrap' }]}>
                            {Payments && Payments !== undefined && Payments.length > 0
                                ? Payments.map((data, i) => {
                                    return (
                                        <Text
                                            key={i}
                                            allowFontScaling={FONT_SCALLING}
                                            style={styles.trackOrderRightTextStyle}>
                                            {data.PaymentLabel === null ? ' ' : `${data.PaymentLabel.toUpperCase()}`}
                                            {Payments.length !== i + 1 ? ', ' : ''}
                                        </Text>
                                    );
                                })
                                : null
                            }
                        </View>
                    </View>
                </ScrollView>
            </View>
        );

    }

    userInfoView(userInfo) {
        return (
            <View style={[styles.squadsCornerContainer, { backgroundColor: APP_COLOR_WHITE }]}>
                <View style={styles.squadCornerRowContainer}>
                    <View style={styles.squadCornerRowContainerLeftStyle}>
                        <Text
                            allowFontScaling={FONT_SCALLING}
                            style={[styles.squadsCornerTextStyle, { color: this.state.themeColor }]}>
                            {strings.LOYALTY_CORNER.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.sepratorLineStyle} />
                <View style={styles.squadCornerRowContainer}>
                    <View style={styles.squadCornerRowContainerLeftStyle}>
                        <Text
                            allowFontScaling={FONT_SCALLING}
                            style={[
                                styles.squadsCornerTextStyle,
                                {
                                    fontSize: SQUADS_CORNER_SUBHEADING_TEXT_SIZE,
                                    color: this.state.themeColor
                                }
                            ]}>
                            {strings.STATUS.toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.squadCornerRowContainerRightStyle}>
                        <Text allowFontScaling={FONT_SCALLING} style={styles.squadsCornerRightTextStyle}>
                            {this.props.LevelName ? this.props.LevelName.toUpperCase() : ''}
                        </Text>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                            onPress={event => this.onPress(event, strings.CHECK_STATUS)}>
                            <Text allowFontScaling={FONT_SCALLING} style={styles.checkStatusTextStyle}>
                                {strings.CHECK_STATUS}
                            </Text>
                            <Image style={styles.editOrderArrowImageStyle} source={ARROW_RIGHT_BLACK} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.sepratorLineStyle} />
                <View style={styles.squadCornerRowContainer}>
                    <View style={styles.squadCornerRowContainerLeftStyle}>
                        <Text
                            allowFontScaling={FONT_SCALLING}
                            style={[
                                styles.squadsCornerTextStyle,
                                {
                                    fontSize: SQUADS_CORNER_SUBHEADING_TEXT_SIZE,
                                    color: this.state.themeColor
                                }
                            ]}>
                            {strings.TOTAL_STARS.toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.squadCornerRowContainerRightStyle}>
                        <Text allowFontScaling={FONT_SCALLING} style={styles.squadsCornerRightTextStyle}>
                            {
                                this.props.updatedStars ?
                                    numberWithCommas(parseInt(this.props.updatedStars), this.props.currency, false) +
                                    ' ' + strings.STARS.toUpperCase() : ''
                            }
                        </Text>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                            onPress={event => this.onPress(event, strings.EARN_MORE)}>
                            <Text allowFontScaling={FONT_SCALLING} style={[styles.checkStatusTextStyle]}>
                                {strings.EARN_MORE}
                            </Text>
                            <Image style={styles.editOrderArrowImageStyle} source={ARROW_RIGHT_BLACK} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.sepratorLineStyle} />
                <View style={styles.squadCornerRowContainer}>
                    <View style={styles.squadCornerRowContainerLeftStyle}>
                        <Text
                            allowFontScaling={FONT_SCALLING}
                            style={[
                                styles.squadsCornerTextStyle,
                                {
                                    fontSize: SQUADS_CORNER_SUBHEADING_TEXT_SIZE,
                                    color: this.state.themeColor
                                }
                            ]}>
                            {strings.REDEEMABLE_AMOUNT.toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.squadCornerRowContainerRightStyle}>
                        <Text allowFontScaling={FONT_SCALLING} style={styles.squadsCornerRightTextStyle}>
                            {this.props.userWalletAmount ? numberWithCommas(this.props.userWalletAmount, this.props.currency) : ''}
                            {/* { redeemableAmount + ' ' + strings.LBP.toUpperCase() } */}
                        </Text>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                            onPress={this.handleGoToMyOrder}>
                            <Text allowFontScaling={FONT_SCALLING} style={styles.checkStatusTextStyle}>
                                {strings.MY_ORDERS}
                            </Text>
                            <Image style={styles.editOrderArrowImageStyle} source={ARROW_RIGHT_BLACK} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.sepratorLineStyle} />
                <View style={[styles.squadCornerRowContainer, { height: 70 }]}>
                    <View style={[styles.squadCornerRowContainerLeftStyle]}>
                        <Text
                            allowFontScaling={FONT_SCALLING}
                            style={[
                                styles.squadsCornerTextStyle,
                                {
                                    fontSize: SQUADS_CORNER_SUBHEADING_TEXT_SIZE,
                                    color: this.state.themeColor
                                }
                            ]}>
                            {strings.DONT_FORGET_TO.toUpperCase()}
                        </Text>
                        <Text
                            allowFontScaling={FONT_SCALLING}
                            style={[styles.dineInOnlyTextStyle, { color: this.state.themeColor }]}>
                            {'(' + strings.DINE_IN_ONLY.toUpperCase() + ')'}
                        </Text>
                    </View>
                    <View style={styles.squadCornerRowContainerRightStyle}>
                        <Button
                            onPress={event => this.onPress(event, strings.SCAN_YOUR_BILL)}
                            style={this.props?.banners?.DineInScan == '0' ? [styles.scanYourBillStyle, { opacity: 0.5 }] :
                                styles.scanYourBillStyle}
                            disabled={this.props?.banners?.DineInScan == '0' ? true : false}
                        >
                            <Text allowFontScaling={FONT_SCALLING} style={styles.scanBillText}>
                                {strings.SCAN_YOUR_BILL.toUpperCase()}
                            </Text>
                        </Button>
                    </View>
                </View>
            </View>
        );
    }

    userSkipView() {
        const { themeColor } = this.state;
        return (
            <View style={styles.squadCornerBottomRowContainer}>
                <Button
                    onPress={event => this.onPress(event, strings.JOIN_NOW)}
                    style={[
                        COMMON_BUTTON_SCALED_STYLE,
                        { alignSelf: 'center', backgroundColor: this.state.themeColor }
                    ]}>
                    <Text
                        allowFontScaling={FONT_SCALLING}
                        style={[COMMON_BUTTON_TEXT_SCALED_STYLE, { fontFamily: ROADSTER_REGULAR }]}>
                        {strings.JOIN_NOW.toUpperCase()}
                    </Text>
                </Button>
            </View>
        );
    }

    handleLastOrder = () => {
        this.props.fetchLastOrder();
    };

    processLastOrder({ order }) {
        const { cartItemsArray, allMenu = [] } = this.props;
        if (order) {
            order.Items.map(item => {
                let fullItem = findItemInMenuBy('ID', item.id, allMenu);
                if (fullItem) {
                    if (fullItem.Modifiers && item.Modifiers)
                        fullItem.Modifiers = selectModifiers(fullItem.Modifiers, item.Modifiers);
                    fullItem.quantity = parseInt(item.Quantity);
                } else fullItem = item;
                cartItemsArray.push(fullItem);
            });
            this.props.additmeToCart(cartItemsArray);
            Actions.yourcart({ hideRecommended: true });
        }
        else {
            this.setState({
                alertVisibilty: true,
                alertTitle: 'Something want wrong',
            })
        }
    }

    onPress = (event, caption, item, index) => {
        const {
            userData: { CustomerId }
        } = this.props;

        switch (caption) {
            case strings.THE_USUAL:
                this.addItemsToCart(index);
                break;

            case strings.SCAN_YOUR_BILL:
                if (CustomerId) {
                    Actions.drawer({ type: 'reset' });
                    Actions.qrcodescanner({
                        paymentMethodsOnSquadCorner: this.props.paymentMethodsOnSquadCorner
                    });
                } else {
                    this.setState({
                        alertVisibilty: true,
                        alertTitle: 'Please Login / Register to scan your bill.',
                    })
                }
                break;

            case strings.GO_TO_MENU:
                Actions.ourmenu({ title: 'Our menu'.toUpperCase() });
                break;

            case strings.CHECK_STATUS:
                if (CustomerId) {
                    const {
                        currency,
                        updatedStars,
                        StartDate,
                        EndDate,
                        LoyaltyId
                    } = this.props;
                    Actions.squadcorner_details({
                        startDate: StartDate,
                        endtDate: EndDate,
                        loyaltyId: LoyaltyId,
                        totalStars: numberWithCommas(updatedStars, currency, false)
                    });
                } else {
                    this.setState({
                        alertVisibilty: true,
                        alertTitle: 'No details yet',
                    })
                }
                break;

            case strings.EARN_MORE:
                if (CustomerId) {
                    Actions.drawer({ type: 'reset' });
                    Actions.boost_your_stars({ title: strings.BOOST_YOUR_STARS.toUpperCase() });
                } else {
                    this.setState({
                        alertVisibilty: true,
                        alertTitle: `Please Log In / Register\nto track your Orders`,
                    })
                }
                break;

            case strings.MY_ORDERS:
                if (CustomerId && this.props.historyData.length > 0) {
                    Actions.myorders();
                } else {
                    this.setState({ historyPopupVisibilty: true });
                }
                break;

            case strings.MOVE_UP_TO_CHAMPION:
                break;
            case strings.JOIN_NOW:
                Actions.reset('welcome');
                break;

            case strings.EDIT_ORDER:
                this.onPressEditOrder(index);
                break;

            case strings.CHECK_IN:
                if (CustomerId) {
                    Actions.wheel_game();
                } else {
                    this.setState({
                        alertVisibilty: true,
                        alertTitle: 'Login to check in',
                    })
                }
                break;

            default:
        }
    };

    addItemsToCart(index) {
        var array = [];
        array = this.props.cartItemsArray.slice();
        if (this.state.mealsdataArray.length > 0) {
            var obj = this.state.mealsdataArray[index];
            this.props.additmeToCart(convertMealeArrayToCartArray(obj, array));
        } else {
            this.props.additmeToCart(
                convertUsualMealeArrayToCartArray(this.state.usualMealsdataArray, array)
            );
        }
        Actions.drawer({ type: 'reset' });
        Actions.yourcart();
    }

    onPressEditOrder(index) {
        var array = [];
        array = this.props.cartItemsArray.slice();
        if (this.state.mealsdataArray.length > 0) {
            var obj = this.state.mealsdataArray[index];

            Actions.editorder({ itemsArray: convertMealeArrayToCartArray(obj, array) });
        } else {
            Actions.editorder({
                itemsArray: convertUsualMealeArrayToCartArray(this.state.usualMealsdataArray, array)
            });
        }
    }

    async stopRangingBeacon(alert) {
        try {
            await Beacons.stopRangingBeaconsInRegion('REGION1');
            const { currentState } = AppState;
            //only show dialog if app is active
            if (currentState === 'active') {
                this.setState({
                    alertVisibilty: true,
                    alertTitle: alert,
                })
            }
        } catch (err) {
            //console.log(`Beacons ranging not stopped, error: ${error}`);
        }
    }

    async startMonitoring(data) {
        try {
            const myRegion = {
                identifier: 'REGION1',
                uuid: data.uuid,
                minor: data.minor,
                major: data.major
            };
            await Beacons.startMonitoringForRegion(myRegion);
        } catch (err) {
            //console.log(`Beacons monitoring not started, error: ${error}`);
        }
    }
    renderPopup = () => {
        const {
            componentTheme: { thirdColor },
            alertVisibilty,
            alertMessage,
            alertTitle,
        } = this.state
        return (
            <Common.Popup
                onClose={() => {
                    this.setState({
                        alertVisibilty: false,
                        alertTitle: ''
                    })
                }}
                color={thirdColor}
                visibilty={alertVisibilty}
                heading={alertTitle}
            />
        )
    }
    async goToCart() {
        let hideRecommended;
        await AsyncStorage.getItem(KEY_RECOMMENDED_SHOWING).then(data => {
            hideRecommended = JSON.parse(data);
        });
        Actions.yourcart({
            hideRecommended
        });
    }

    onCartPress = () => {
        this.setState({
            showAddedConfirmation: false
        }, () => {
            AsyncStorage.removeItem('cachedOrder')
            if (this.state.cartCount > 0) {
                if (this.props.userType === 'login' || this.props.userType === 'register') {
                    this.goToCart();
                } else {
                    this.setState({
                        extraPopupVisible: true,
                        extraPopupMessage: 'Login to see cart'
                    });
                    Actions.register();
                }
            }
        });
    };

    render() {
        const {
            userData: userInfo = '', mealsData, banners, historyData,
            isAuthUser,
            hasMenuItems,
        } = this.props
        const { componentTheme: { thirdColor }, showAddedConfirmation } = this.state
        const renderLastOrder = isAuthUser && hasMenuItems && historyData.length;
        const isUserLoggedIn = userInfo && userInfo.CustomerId;
        const {
            scrollStyle,
            container,
            subContainer,
        } = styles;

        if (banners?.DeliveryLoyalty === '0' || isEmpty(banners) || banners === undefined) { // change this comment
            return (
                <View style={container}>
                    <Loader />
                    <Slider />
                    {this.renderPopup()}
                    <Common.Popup
                        onClose={() => this.handleHideAddedConfirmation()}
                        color={thirdColor}
                        visibilty={showAddedConfirmation}
                        subbody={'We found an incomplete order\n' +
                            'due to a failure in the last order.\n' +
                            'Resubmit your order?'}
                        heading={'Note'}
                        hideCross={true}
                        customBody={this.renderAddedConfirmation()}
                    />
                    <ImageBackground
                        style={{ flex: 1 }}
                        source={BACKGROUND_IMAGE_LOGO}>
                        <View style={{ marginTop: width * 0.4 }}>
                            <BoostYourStartPopUp
                                onCrossPress={this.onCrossPress}
                                modalVisibilty={this.state.bluetoothPopupVisibilty}
                                selectedHeading={'UH-OH!'}
                                selectedSubHeading={'Turn on your Bluetooth \n to check in'}
                                // selectedDetails={this.state.selectedDetails}
                                appTheme={this.state.componentTheme}
                            />
                            <BoostYourStartPopUp
                                onCrossPress={this.onCrossPress}
                                modalVisibilty={this.state.beaconPopupVisibilty}
                                selectedHeading={'UH-OH!'}
                                selectedSubHeading={"We were unable to check you in.\n It seems you're out of range."}
                                // selectedDetails={this.state.selectedDetails}
                                appTheme={this.state.componentTheme}
                            />
                            <BoostYourStartPopUp
                                onCrossPress={this.onCrossPress}
                                modalVisibilty={this.state.historyPopupVisibilty}
                                selectedHeading={'UH-OH!'}
                                selectedSubHeading={'NO ORDERS YET'}
                                appTheme={this.state.componentTheme}
                            />
                            <TouchableOpacity
                                style={[styles.gotoMenuContainerStyle, {
                                    // backgroundColor: APP_COLOR_BLACK,
                                    backgroundColor: banners?.GoMenuBtnBg ? banners.GoMenuBtnBg : APP_COLOR_RED,
                                    alignSelf: 'center',
                                    marginTop: 35
                                }]}
                                onPress={event => this.onPress(event, strings.GO_TO_MENU)}>
                                <Text allowFontScaling={FONT_SCALLING} style={[styles.gotoMenuTextStyle, { color: banners?.GoMenuBtnFontColor ? banners.GoMenuBtnFontColor : APP_COLOR_WHITE }]}>

                                    {strings.GO_TO_MENU.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ImageBackground>
                </View>
            )
        }
        return (
            <ScrollView style={[scrollStyle, { backgroundColor: APP_COLOR_WHITE }]}>
                <Loader />
                <Slider />
                {this.renderPopup()}
                <Common.Popup
                    onClose={() => this.handleHideAddedConfirmation()}
                    color={thirdColor}
                    visibilty={showAddedConfirmation}
                    subbody={'We found an incomplete order\n' +
                        'due to a failure in the last order.\n' +
                        'Resubmit your order?'}
                    heading={'Note'}
                    hideCross={true}
                    customBody={this.renderAddedConfirmation()}
                />
                <BoostYourStartPopUp
                    onCrossPress={this.onCrossPress}
                    modalVisibilty={this.state.bluetoothPopupVisibilty}
                    selectedHeading={'UH-OH!'}
                    selectedSubHeading={'Turn on your Bluetooth \n to check in'}
                    // selectedDetails={this.state.selectedDetails}
                    appTheme={this.state.componentTheme}
                />

                <BoostYourStartPopUp
                    onCrossPress={this.onCrossPress}
                    modalVisibilty={this.state.beaconPopupVisibilty}
                    selectedHeading={'UH-OH!'}
                    selectedSubHeading={"We were unable to check you in.\n It seems you're out of range."}
                    // selectedDetails={this.state.selectedDetails}
                    appTheme={this.state.componentTheme}
                />
                <BoostYourStartPopUp
                    onCrossPress={this.onCrossPress}
                    modalVisibilty={this.state.historyPopupVisibilty}
                    selectedHeading={'UH-OH!'}
                    selectedSubHeading={'NO ORDERS YET'}
                    appTheme={this.state.componentTheme}
                />
                <View style={subContainer} />
                {this.state.showPendingOrder
                    ? this.homeUpperOrderView()
                    : this.homeUpperNormalView()}
                {isUserLoggedIn ? this.userInfoView(userInfo) : this.userSkipView()}
            </ScrollView>
        );
    }
}

const styles = {
    sepratorLineStyle: {
        width: '100%',
        height: verticalScale(2),
        backgroundColor: ORDER_STATUS_STATUS_BAR_GRAY
    },
    scrollStyle: {
        flex: 1,
        backgroundColor: APP_COLOR_RED
    },
    container: {
        flex: 1
    },
    subContainer: {
        left: 0,
        right: 0,
        justifyContent: 'flex-end',
        backgroundColor: TRANSPARENT_COLOR
    },
    subContainerOrder: {
        backgroundColor: APP_COLOR_WHITE,
        flexDirection: 'column',
        paddingStart: LEFT_RIGHT_MARGIN,
        width: '100%'
    },
    horizontalListContainer: {
        height: HORIZONTAL_LIST_HEIGHT,
        // backgroundColor: APP_COLOR_BLACK,
        marginBottom: moderateScale(5)
    },
    horizontalListItemImageContainer: {
        height: HORIZONTAL_LIST_ITEM_IMAGE_CONTAINER_HEIGHT,
        width: HORIZONTAL_LIST_ITEM_WIDTH,
        flexDirection: 'row'
    },
    squadsCornerContainer: {
        flex: 1,
        backgroundColor: APP_COLOR_RED,
        // paddingBottom: SQUADS_CORNER_MARGIN_BOTTOM,
        marginTop: IF_OS_IS_IOS ? moderateScale(8) : moderateScale(0)
    },
    mealsContainer: {
        flex: 1,
        // backgroundColor: APP_COLOR_RED,
        // width: SCREEN_WIDTH,
        // height: SCREEN_HEIGHT / 3,
        justifyContent: 'center',
        alignItems: 'center'
    },
    horizontalListItemContainer: {
        width: HORIZONTAL_LIST_ITEM_WIDTH,
        height: HORIZONTAL_LIST_HEIGHT,
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginRight: moderateScale(10)
    },
    horizontalListItemBottomContainer: {
        width: HORIZONTAL_LIST_ITEM_WIDTH,
        height: HORIZONTAL_LIST_HEIGHT,
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: GO_FOR_IT_BUTTON_TOP_MARGIN
    },
    horizontalListItemTitleTextStyle: {
        color: APP_COLOR_RED,
        fontSize: HORIZONTAL_LIST_ITEM_TITLE_TEXT_SIZE,
        fontFamily: DINENGSCHRIFT_REGULAR,
        marginTop: moderateScale(-10)
    },
    editOrderTextStyle: {
        color: APP_COLOR_WHITE,
        fontSize: EDIT_ORDER_TEXT_SIZE,
        fontFamily: HELVETICANEUE_LT_STD_CN
    },
    trackOrderRowContainerRightStyle: {
        flex: 1,
        alignItems: 'flex-end',
        paddingEnd: 20
    },
    checkStatusTextStyle: {
        color: APP_COLOR_BLACK,
        fontSize: CHECK_STATUS_TEXT_SIZE,
        fontFamily: DINENGSCHRIFT_REGULAR,
        fontWeight: '400',
        marginTop: moderateScale(-3)
    },
    checkOrderTextStyle: {
        color: APP_COLOR_WHITE,
        fontSize: CHECK_STATUS_TEXT_SIZE,
        fontFamily: HELVETICANEUE_LT_STD_CN,
        marginTop: moderateScale(-3)
    },
    trackOrderTextStyle: {
        color: APP_COLOR_WHITE,
        fontSize: TRACK_ORDER_TEXT_SIZE,
        fontFamily: DINENGSCHRIFT_REGULAR
    },
    editOrderViewStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        position: 'absolute',
        borderColor: 'white',
        borderWidth: moderateScale(0),
        start: moderateScale(5),
        bottom: moderateScale(5)
    },
    editOrderArrowImageStyle: {
        width: scale(6),
        height: verticalScale(10),
        marginLeft: moderateScale(2),
        marginTop: moderateScale(0),
        marginBottom: IF_OS_IS_IOS ? moderateScale(7) : moderateScale(0)
    },
    trackOrderRowContainer: {
        marginTop: 10,
        flexDirection: 'row'
    },
    horizontalListItemPriceTextStyle: {
        color: APP_COLOR_RED,
        fontSize: HORIZONTAL_LIST_ITEM_TITLE_TEXT_SIZE,
        fontFamily: DINENGSCHRIFT_REGULAR,
        marginTop: moderateScale(4)
    },
    gotoMenuTextStyle: {
        color: APP_COLOR_WHITE,
        fontSize: GOTO_MENU_TEXT_SIZE,
        fontFamily: DINENGSCHRIFT_BOLD,
        marginTop: moderateScale(IF_OS_IS_IOS ? 5 : 0)
    },
    theUsualTextStyle: {
        color: APP_COLOR_BLACK,
        fontSize: GOTO_MENU_TEXT_SIZE,
        fontFamily: DINENGSCHRIFT_REGULAR
    },
    checkInTextStyle: {
        color: APP_COLOR_WHITE,
        fontSize: GOTO_MENU_TEXT_SIZE,
        fontFamily: DINENGSCHRIFT_REGULAR
        // marginBottom:-30,
    },
    gotoMenuContainerStyle: {
        flexDirection: 'row',
        backgroundColor: APP_COLOR_RED,
        borderRadius: moderateScale(10),
        justifyContent: 'center',
        alignItems: 'center',
        width: scale(140),
        height: verticalScale(40),
        marginBottom: 4
    },
    theUsualTextContainerStyle: {
        flexDirection: 'row',
        marginTop: moderateScale(4)
    },
    checkInContainerStyle: {
        //marginBottom: moderateScale(-50)
    },
    arrowImageStyle: {
        marginLeft: GOTO_MENU_ARROW_MARGIN_LEFT,
        marginRight: GOTO_MENU_ARROW_MARGIN_LEFT,
        width: GOTO_MENU_ARROW_WIDTH,
        height: GOTO_MENU_ARROW_HEIGHT,
        marginTop: IF_OS_IS_IOS ? moderateScale(-8) : moderateScale(0),
        alignSelf: 'center'
    },
    checkInImageStyle: {
        width: IF_OS_IS_IOS ? scale(45) : scale(45),
        height: IF_OS_IS_IOS ? verticalScale(45) : verticalScale(48),
        alignSelf: 'center',
        marginBottom: moderateScale(5),
        marginTop: moderateScale(5),
    },
    customCheckInImage: {
        width: scale(80),
        height: scale(80),
        alignSelf: 'center',
        // marginBottom: moderateScale(5),
        //marginTop: moderateScale(5)
    },
    goForItButtonStyle: {
        backgroundColor: APP_COLOR_RED,
        width: GO_FOR_IT_BUTTON_WIDTH,
        height: GO_FOR_IT_BUTTON_HEIGHT,
        alignItems: 'center',
        position: 'absolute',
        paddingBottom: IF_OS_IS_IOS ? moderateScale(9) : moderateScale(5),
        right: moderateScale(0),
        top: GO_FOR_IT_BUTTON_TOP_MARGIN,
        justifyContent: 'center',
        borderRadius: COMMON_BUTTON_RADIOUS
    },
    trackOrderRightTextStyle: {
        color: APP_COLOR_BLACK,
        fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE,
        fontFamily: DINENGSCHRIFT_REGULAR
    },
    scanYourBillStyle: {
        // backgroundColor: APP_COLOR_BLACK,
        width: SCAN_YOUR_BILL_BUTTON_WIDTH,
        height: SCAN_YOUR_BILL_BUTTON_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: COMMON_BUTTON_RADIOUS,
        alignSelf: 'flex-end',
        backgroundColor: APP_COLOR_RED
    },
    scanBillText: {
        ...COMMON_BUTTON_TEXT_SCALED_STYLE,
        fontFamily: DINENGSCHRIFT_BOLD,
        fontSize: SCAN_YOUR_BILL_BUTTON_TEXT_SIZE,
        color: APP_COLOR_WHITE,
        paddingTop: verticalScale(IF_OS_IS_IOS ? 1 : 0),
    },
    horizontalListItemImageViewStyle: {
        height: HORIZONTAL_LIST_ITEM_LARGE_IMAGE_HEIGHT,
        width: HORIZONTAL_LIST_ITEM_LARGE_IMAGE_WIDTH,
        marginLeft: HORIZONTAL_LIST_ITEM_IMAGES_MARGIN
    },
    horizontalListItemSmallImageStyle: {
        resizeMode: 'contain',
        width: HORIZONTAL_LIST_ITEM_SMALL_IMAGE_WIDTH,
        height: HORIZONTAL_LIST_ITEM_SMALL_IMAGE_HEIGHT
    },
    squadCornerRowContainer: {
        left: SQUADS_CORNER_LEFT_RIGHT_MARGIN,
        right: SQUADS_CORNER_LEFT_RIGHT_MARGIN,
        marginTop: SQUADS_CORNER_TOP_BOTTOM_MARGIN,
        flexDirection: 'row',
        height: verticalScale(55),
        justifyContent: 'center',
        alignItems: 'center'
    },
    squadCornerBottomRowContainer: {
        // left: SQUADS_CORNER_LEFT_RIGHT_MARGIN,
        // right: SQUADS_CORNER_LEFT_RIGHT_MARGIN,
        marginTop: SQUADS_CORNER_TOP_BOTTOM_MARGIN,
        flexDirection: 'column',
        position: 'absolute',
        bottom: moderateScale(20),
        left: moderateScale(0),
        right: moderateScale(0),
        justifyContent: 'center',
        alignItems: 'center'
    },
    squadCornerRowContainerLeftStyle: {
        flex: 1
    },
    squadCornerRowContainerRightStyle: {
        flex: 1,
        alignItems: 'flex-end',
        paddingEnd: moderateScale(40)
    },
    squadsCornerTextStyle: {
        color: APP_COLOR_WHITE,
        fontSize: SQUADS_CORNER_TEXT_SIZE,
        fontFamily: DINENGSCHRIFT_BOLD
    },
    dineInOnlyTextStyle: {
        color: APP_COLOR_WHITE,
        fontSize: DINE_IN_ONLY_TEXT_SIZE,
        fontFamily: DINENGSCHRIFT_REGULAR
    },
    squadsCornerRightTextStyle: {
        color: APP_COLOR_BLACK,
        fontSize: SQUADS_CORNER_SUBHEADING_TEXT_SIZE,
        fontFamily: DINENGSCHRIFT_BOLD
    },
    itemDetailTextStyle: {
        color: DETAIL_TEXT_COLOR,
        fontSize: DETAIL_TEXT_SIZE,
        fontFamily: HELVETICANEUE_LT_STD_CN
    },
    grabASeatTextStyle: {
        textAlign: 'center',
        fontSize: scale(17),
        fontFamily: HELVETICANEUE_LT_STD_CN,
        color: APP_COLOR_WHITE,
        marginBottom: moderateScale(20)
    },
    lastOrderButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        maxHeight: 35,
        paddingTop: 6,
        paddingBottom: 0,
        paddingLeft: 20,
        paddingRight: 5
    },
    lastOrderButtonText: {
        color: APP_COLOR_WHITE,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
        fontSize: 19,
        fontFamily: DIN_CONDENSED
    },
    lastOrderButtonArrow: {
        height: 13,
        margin: 0,
        marginBottom: 2,
        shadowColor: APP_COLOR_BLACK,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 5
    },
    confirmationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // height: 900
        backgroundColor: 'red'
    },
    favPopupButton: {
        ...COMMON_BUTTON_STYLE,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: color,
        marginTop: 20,
        
        maxWidth: '43%',
        paddingTop: 6,
        marginLeft: 10,
        marginRight: 10
    },
    favPopupButtonText: {
        ...COMMON_BUTTON_TEXT_STYLE,
        fontFamily: ROADSTER_REGULAR,
        fontSize: 20
    },
    favPopupContainer: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 0,
        paddingBottom: 20
    }
};

function mapStateToProps(state) {
    const {
        category: { allMenu },
        cart: { cartItemsArray },
        app: {
            accessToken,
            userType,
            loading,
            currency,
            updatedStars,
            walletAmountBalance,
            LevelName,
            shouldGetVersion,
            forceLogOut,
            SpinTheWheel,
            LoyaltyId,
            StartDate,
            EndDate
        },
        home: { usualMealsData, userOrdersCount, mealsData, banners, lastOrder },
        branches: { branches }
    } = state;
    const userData = getUserObject(state);
    const PaymentMethods = getUserPaymentMethods(state);
    const isAuthUser = userData.CustomerId;
    const isLoginUser = userType == 'login';
    const orderCountData = userOrdersCount.data || [];
    const ordersCount = orderCountData.length;
    const hasMenuItems = (state.category.allMenu || []).length > 0;
    let cartItemsCount = 0;
    const itemsCount = cartItemsArray.length;
    cartItemsArray.map(cartItem => {
        cartItemsCount += cartItem?.quantity ? cartItem.quantity : 0
    });
    return isAuthUser
        ? {
            isAuthUser,
            allMenu,
            accessToken,
            hasMenuItems,
            userData,
            userType,
            loadingState: loading,
            mealsData: isLoginUser ? [] : mealsData,
            usualMealsData: isLoginUser ? usualMealsData : [],
            userPreviousOrdersCount: ordersCount,
            pendingOrder: userOrdersCount.total_pending || 0,
            orderHistoryArray: orderCountData,
            cartItemsArray,
            appTheme: userType,
            currency,
            updatedStars: updatedStars ? updatedStars : 0,
            paymentMethodsOnSquadCorner: PaymentMethods,
            userWalletAmount: walletAmountBalance ? walletAmountBalance : 0,
            LevelName,
            LoyaltyId,
            StartDate,
            EndDate,
            SpinTheWheel,
            historyData: orderCountData,
            branches,
            banners,
            lastOrder,
            isLoginUser,
            shouldGetVersion,
            forceLogOut,
            cartItemsCount
        }
        : {
            accessToken,
            hasMenuItems,
            userData: { TierBalance: 0, currency: 'LBP', LoyaltyId: 0 },
            loadingState: loading,
            mealsData,
            userType,
            cartItemsArray,
            currency,
            userWalletAmount: 0,
            LevelName: 'challenger',
            updatedStars: 0,
            banners,
            lastOrder,
            isLoginUser,
            shouldGetVersion,
            cartItemsCount
        };
}

const mapDispatchToProps = dispatch => ({
    ...bindActionCreators(
        {
            ...homeActions,
            ...cartActoins,
            ...appstateAction,
            ...branchesActions,
            ...deliveryActions,
            ...categoryActions,
            ...notificationActions,
            ...squadAction
        },
        dispatch
    )
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Home);
