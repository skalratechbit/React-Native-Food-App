import React, { Component } from 'react';
import {
    View,
    Modal,
    Text,
    Image,
    TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {
    APP_COLOR_WHITE,
    APP_COLOR_RED,
    APP_COLOR_BLACK
} from '../../config/colors';
import {
    DINENGSCHRIFT_REGULAR,
    HELVETICANEUE_LT_STD_CN
} from '../../assets/fonts';
import { POPCROSS_IC } from '../../assets/images';
import {
    FONT_SCALLING
} from '../../config/common_styles';
import strings from '../../config/strings/strings';
const ICON_SIZE = 31;
const ICON_VIEW_SIZE = 60;
const TEXT_LEFT_MARGIN = 65;
const TEXT_SIZE = 25;
const REGISTER_TEXT_SIZE = 8;
const BUTTON_HEIGHT = 53;
const ICONS_MARGIN = 16;
const LINE_HEIGHT = 0.5;

class ScreenModeInfoPopUp extends Component {
    state = {
        //modalVisibilty: this.props.modalVisibilty || false,
        apiname: ''
    };

    componentDidMount() {
        //only for tracking rotation instructions displaying
        AsyncStorage.setItem('showedInfoPopup', '1');
    }

    componentWillReceiveProps(nextProps) {
        //this.setState({ modalVisibilty: nextProps.modalVisibilty });
    }

    handleRequestClose() {}
    
    //renderers
    renderTitleHead() {
        return (
            <View style={[styles.headingViewStyle, { backgroundColor: APP_COLOR_WHITE }]}>
                <TouchableOpacity
                    onPress={this.props.onCrossPress}
                    style={styles.crossImageTouchStyle}>
                    <Image style={styles.crossImageStyle} source={POPCROSS_IC} />
                </TouchableOpacity>
                <Text
                    allowFontScaling={FONT_SCALLING}
                    style={[styles.headingTextStyle, { color: this.props.appTheme.thirdColor }]}>
                    {strings.BT_CLUB}
                </Text>
            </View>
        );
    }

    renderSuccessDataBody() {
        return (
            <View style={styles.activityIndicatorWrapper}>
                <Text allowFontScaling={FONT_SCALLING} style={styles.detailTextStyle}>
                   {strings.RENDER_SUCCESS_DATA_BODY}
                </Text>
            </View>
        );
    }

    renderNoDataBody() {
        return (
            <View style={styles.activityIndicatorWrapper}>
                <Text allowFontScaling={FONT_SCALLING} style={styles.detailTextStyle}>
                    {strings.RENDER_NO_DATA_TEXT}
                </Text>
            </View>
        );
    }

    render() {
        const { noData } = this.props;
        return (
            <Modal transparent={true} visible={true} onRequestClose={this.handleRequestClose}>
                <View style={styles.modalBackground}>
                    <View style={styles.popUpContainerView}>
                        {this.renderTitleHead()}
                        {noData ? this.renderNoDataBody() : this.renderSuccessDataBody()}
                    </View>
                </View>
            </Modal>
        );
    }
}

const styles = {
    containerStyle: {
        flex: 1,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.8,
        backgroundColor: APP_COLOR_BLACK
    },
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00000099'
    },
    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    headingViewStyle: {
        backgroundColor: APP_COLOR_RED,
        padding: 22,
        paddingBottom: 15
    },
    popUpContainerView: {
        borderRadius: 10,
        borderWidth: 0,
        width: '80%',
        overflow: 'hidden'
    },
    headingTextStyle: {
        fontSize: 35,
        fontFamily: DINENGSCHRIFT_REGULAR,
        alignSelf: 'center',
        color: APP_COLOR_WHITE,
        marginTop: 7
    },
    subHeadingStyle: {
        fontSize: 25,
        fontFamily: DINENGSCHRIFT_REGULAR,
        alignSelf: 'center',
        color: APP_COLOR_RED,
        marginTop: 15
    },
    detailTextStyle: {
        fontSize: 18,
        fontFamily: HELVETICANEUE_LT_STD_CN,
        alignSelf: 'center',
        color: APP_COLOR_BLACK,
        textAlign: 'center',
        marginStart: 10,
        marginEnd: 10,
        marginBottom: 10,
        marginTop: 0,
        paddingBottom: 5
    },
    crossImageStyle: {
        width: 18,
        height: 18,
        resizeMode: 'contain'
    },
    crossImageTouchStyle: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 8,
        top: 5
    },
    rotateArrowImageStyle: {
        width: 70,
        height: 70,
        resizeMode: 'contain',
        marginStart: 50
    },
    rotateTextstyle: {
        color: APP_COLOR_WHITE,
        fontSize: 24,
        fontFamily: DINENGSCHRIFT_REGULAR,
        marginEnd: 50
    }
};

export default ScreenModeInfoPopUp;
