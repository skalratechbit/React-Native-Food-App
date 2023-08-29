import React, {Component} from 'react';
import {Text, View, Image, TouchableOpacity, FlatList} from 'react-native';
import {APP_COLOR_WHITE, APP_COLOR_RED, APP_COLOR_BLACK} from '../../config/colors';
import strings from '../../config/strings/strings';
import {RIGHT_ARROW_LARGE_WHITE} from '../../assets/images';
import {DINENGSCHRIFT_REGULAR, DINENGSCHRIFT_BOLD, HELVETICANEUE_LT_STD_CN} from '../../assets/fonts';
import {IF_OS_IS_IOS, FONT_SCALLING} from '../../config/common_styles';
import {actions as notificationsActions} from '../../ducks/notifications';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import {NotificationConfirmationPopup} from '../../components';
import CommonLoader from '../../components/CommonLoader';
import {numberWithCommas} from '../../config/common_functions';
import {getUserObject} from '../../helpers/UserHelper';
import TitleBar from '../../components/TitleBar';
import {getThemeByLevel} from '../../config/common_styles/appthemes';
import CommonPopup from '../../components/Common/CommonPopup';

import {ORGANIZATION_ID, CHANNEL_ID} from '../../config/constants/network_constants';

const TITLE_CONTAINER_HEIGHT = 52;
const TITLE_FONT_SIZE = 30;
const LEFT_RIGHT_MARGINS = 20;
const BELL_ICON_WIDTH = 22;
const BELL_ICON_HEIGHT = 24;
const ITEM_CELL_HEIGHT = 90;
const ITEMS_MARGIN = 5;
const DESCRIPTION_TEXT_SIZE = 18;

const MARGIN_LEFT_RIGHT = 20;
const ITEM_TITLE_TEXT_SIZE = 25;

const notificationsList = [
    {
        id: 0,
        title: 'Free Vouchers',
        description: 'Manal Khoury just sent you 2 ($20 Vouchers)'
    },
    {
        id: 1,
        title: 'Track Order',
        description: "It's Here!"
    },
    {
        id: 2,
        title: "You're out of vouchers!",
        description: 'Refill vouchers with redeemable amount!'
    },
    {
        id: 3,
        title: 'We have a winner!',
        description: '$30 Voucher will be added to your account!'
    },
    {
        id: 4,
        title: 'Become a Champion!',
        description: '1,230 stars needed! Boost your stars!'
    },
    {
        id: 5,
        title: 'Track Order',
        description: 'Your meal is in Progress!'
    }
];

class Notifications extends Component {
    state = {
        componentTheme: getThemeByLevel(this.props.customerData.LevelName),
        notificationsArray: [],
        visibilty: false,
        selectedHeading: '',
        selectedDetails: '',
        notificationId: '',
        selectedSubHeading: '',
        showLoginWarning: false
    };

    componentWillMount() {

    }

    componentDidMount() {
        if (this.props.customerData.CustomerId)
            this.props.getAllNotifications();
        else this.setState({showLoginWarning: true});
    }

    componentWillReceiveProps(nextProps) {
        console.log({notifications});
        const {notifications} = nextProps;
        if (notifications && !notifications.rows) {
          let array = [];
          Object.keys(notifications).map(data=>{
            array.push(notifications[data]);
        });
        this.setState({
            notificationsArray: array,
            // visibilty: notifications.message == 'updated'
        });
        }
    }

    onCrossPress = () => {
        this.setState({visibilty: false});
    };

    getParams(status) {
        const formdata = new FormData();
        const {
            customerData: { LoyaltyId }
        } = this.props;
        const { operationId, operationType } = this.state;

        formdata.append('OrgId', ORGANIZATION_ID);
        formdata.append('ChannelId', CHANNEL_ID);
        formdata.append('LoyaltyId', LoyaltyId);
        formdata.append('Status', status);
        formdata.append('OperationId', operationId)
        formdata.append('OperationType', operationType);

        return formdata;
    }

    onPressGrabIt = () => {
        this.setState({visibilty: false});
        this.props.confirmTransfer(this.getParams('accepted'));
    };

    onPressCancel = () => {
        this.setState({visibilty: false});
        this.props.confirmTransfer(this.getParams('rejected'));
    };

    onPress = (event, caption) => {
        switch (caption) {
            case strings.BACK:
                Actions.pop();
                break;

            case strings.CONTINUE:
                alert(strings.CONTINUE);
                break;

            default:
        }
    };

    backButtonPress() {
        Actions.pop();
    }

    getParamToUpdateNotoficationStatus(notificationID) {
        const formdata = new FormData();
        formdata.append('NotifyId', parseInt(notificationID));
        formdata.append('Status', 'read');

        return formdata;
    }

    showConfirmationPopup = (event, notificationID, operationId, operationType, amount, PopupTitle) => {
        this.setState(
            {
                visibilty: true,
                selectedSubHeading: numberWithCommas(amount, this.props.currency),
                notificationId: notificationID,
                operationId,
                operationType,
                selectedHeading: PopupTitle
            },
            () => {
                setTimeout(()=>{
                    this.props.updateNotificationStatus(
                        this.getParamToUpdateNotoficationStatus(notificationID)
                    );
                },1000)

            }
        );
    };
    handleCloseLoginWarning = () => {
        this.setState({
            showLoginWarning: false
        }, () => Actions.pop());
    }

    renderNoNotifications() {
        const noNotifications = this.state.notificationsArray.length == 0;
        return noNotifications && !this.props.loading ? (
            <View style={styles.noNotifications}>
                <Text style={styles.noNotificationsText}>{strings.NO_NOTIFICATIONS.toUpperCase()}</Text>
            </View>
        ) : null;
    }

    renderItem = ({item}) => {
        const {
        listItemContainer,
        arrowImageStyle,
        disabledViewColor,
        notificationButton
      } = styles;

        return (<View
            style={[
                listItemContainer,
            ]}>
            <TouchableOpacity
                disabled={
                    (item.HasConfirmation !== null && item.HasConfirmation === '1') && item.ConfirmationStatus === 'pending'
                        ? false
                        : true
                }
                onPress={event => {
                    this.showConfirmationPopup(
                        event,
                        item.NotificationId,
                        item.OperationId,
                        item.OperationType,
                        item.Amount,
                        item.PopupTitle
                    )
                }}
                
                style={notificationButton}>
                <View>
                    <Text allowFontScaling={FONT_SCALLING} style={[notificationButton,{fontSize:DESCRIPTION_TEXT_SIZE,fontWeight:'bold'}]}>
                        {item.Title && item.Title!==null && item.Title.toUpperCase()}
                    </Text>

                    <Text allowFontScaling={FONT_SCALLING} style={[notificationButton,{color:APP_COLOR_RED,width:'80%'}]}>
                        {item.Details}
                    </Text>
                    {(item.HasConfirmation!==null && item.HasConfirmation === '0') ? null : (
                        <Image style={arrowImageStyle} source={RIGHT_ARROW_LARGE_WHITE}/>
                    )}
                </View>
            </TouchableOpacity>
            {(item.HasConfirmation!==null && item.HasConfirmation === '1') && item.ConfirmationStatus === 'pending' ? null : (
                <View style={disabledViewColor}/>
            )}
        </View>);
    }

    render() {
        const {
            container,
            listContainer,
        } = styles;

        const {showLoginWarning, componentTheme: {thirdColor, ARROW_LEFT_RED}} = this.state;
        const  {title} =this.props
        return (
            <View style={container}>
                <CommonLoader/>
                <CommonPopup
                    onClose={this.handleCloseLoginWarning}
                    color={thirdColor}
                    visibilty={showLoginWarning}
                    heading={'UH-OH'}
                    subbody={strings.YOU_NEED_TO_BE_LOGGED_IN_TO_VIEW_NOTIFICATIONS}
                />
                <NotificationConfirmationPopup
                    onCrossPress={this.onCrossPress}
                    modalVisibilty={this.state.visibilty}
                    selectedHeading={this.state.selectedHeading}
                    selectedSubHeading={this.state.selectedSubHeading}
                    selectedDetails={this.state.selectedDetails}
                    appTheme={this.state.componentTheme}
                    onPressGrabIt={this.onPressGrabIt}
                    onPressCancel={this.onPressCancel}
                />
                <TitleBar
                    onPress={this.backButtonPress}
                    color={thirdColor}
                    titleText={title || strings.NOTIFICATIONS}
                    // titleIcon={BELL_RED_IMAGE}
                    backIcon={ARROW_LEFT_RED}
                    titleIconSize={{width: BELL_ICON_WIDTH, height: BELL_ICON_HEIGHT}}
                />
                <View style={[listContainer]}>
                    <FlatList
                        bounces={false}
                        horizontal={false}
                        data={this.state.notificationsArray}
                        style={{flex: 1}}
                        renderItem={this.renderItem}
                        ListEmptyComponent={this.ListEmptyComponent}
                    />
                </View>
            </View>
        );
    }
}

const styles = {
    disabledViewColor: {
        flex: 1,
        // backgroundColor: '#00000040',
        position: 'absolute',
        left: 0,
        right: 0,
        top: -5,
        bottom: 0
    },
    container: {
        flex: 1,
        width: null,
        height: null,
        alignItems: 'center',
        backgroundColor: APP_COLOR_RED
    },
    subContainer: {
        backgroundColor: APP_COLOR_RED,
        flexDirection: 'row',
        alignItems: 'center',
        paddingStart: LEFT_RIGHT_MARGINS,
        paddingEnd: LEFT_RIGHT_MARGINS,
        width: '100%'
    },
    titleArrowImageStyle: {
        marginStart: 10
        // marginBottom:IF_OS_IS_IOS?4:0
    },
    aboutTextStyle: {
        fontSize: TITLE_FONT_SIZE,
        fontFamily: DINENGSCHRIFT_REGULAR,
        marginBottom: IF_OS_IS_IOS ? 0 : 10,
        color: APP_COLOR_RED
    },
    aboutIconStyle: {
        height: BELL_ICON_HEIGHT,
        width: BELL_ICON_WIDTH,
        marginStart: 10
        // marginBottom:IF_OS_IS_IOS?10:0,
    },
    listContainer: {
        flex: 1,
        backgroundColor: APP_COLOR_BLACK,
        width: '100%'
    },
    listItemContainer: {
        height: "auto",
        flexDirection: 'column',
        marginLeft: 0,
        paddingLeft: 0,
        paddingRight: 0,
        marginRight: 0,
        marginTop: 0,
        paddingTop: 5,
        paddingBottom: 10,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: ITEMS_MARGIN,
        backgroundColor:APP_COLOR_BLACK,
        borderBottomWidth:0.5,
        borderBottomColor:APP_COLOR_WHITE
    },
    listItemTitleTextStyle: {
        color: APP_COLOR_WHITE,
        marginStart: MARGIN_LEFT_RIGHT,
        fontSize: ITEM_TITLE_TEXT_SIZE,
        fontFamily: DINENGSCHRIFT_REGULAR
    },
    descriptionTextStyle: {
        color: APP_COLOR_WHITE,
        fontSize: DESCRIPTION_TEXT_SIZE,
        fontFamily: HELVETICANEUE_LT_STD_CN,
        marginStart: MARGIN_LEFT_RIGHT,
        marginTop: 5,
        marginRight: 50
    },
    arrowImageStyle: {
        width: '2%',
        height: '2%',
         marginTop: '3%',
        position: 'absolute',
        right: MARGIN_LEFT_RIGHT
    },
    noNotifications: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        //marginTop: 50,
        height: 'auto'
    },
    noNotificationsText: {
        fontSize: 21,
        fontFamily: DINENGSCHRIFT_BOLD,
        color: APP_COLOR_WHITE,
    },
    notificationButton: {
        flex: 1,
        width: '100%',
        height: "auto",
        justifyContent: 'center',
        marginLeft: 5,
        color:APP_COLOR_WHITE,
        fontFamily:DINENGSCHRIFT_REGULAR
    }
};

function mapStateToProps(state) {
    console.log('notifications', state);
    const customerData = getUserObject(state);

    return {
        loading: state.app.loading,
        ACCESS_TOKEN: state.app.accessToken,
        notifications: state.notifications.notifications,
        currency: state.app.currency,
        customerData
    };
}

export default connect(
    mapStateToProps,
    notificationsActions
)(Notifications);
