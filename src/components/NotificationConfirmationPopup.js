import React, { Component } from 'react';
import { View, Modal, Text, Image, TouchableOpacity } from 'react-native';
import strings from '../config/strings/strings';
import {
    APP_COLOR_WHITE,
    APP_COLOR_RED,
    APP_COLOR_BLACK
} from '../config/colors';
import { DINENGSCHRIFT_REGULAR, ROADSTER_REGULAR, HELVETICANEUE_LT_STD_CN } from '../assets/fonts';
import { POPCROSS_IC } from '../assets/images';
import { Button } from 'native-base';
import {
    COMMON_BUTTON_TEXT_STYLE,
    COMMON_BUTTON_RADIOUS,
    FONT_SCALLING
} from '../config/common_styles';

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
        paddingBottom: 0
    },
    popUpContainerView: {
        borderRadius: 10,
        borderWidth: 0,
        width: '80%',
        overflow: 'hidden'
    },
    headingTextStyle: {
        fontSize: 30,
        fontFamily: DINENGSCHRIFT_REGULAR,
        alignSelf: 'center',
        color: APP_COLOR_WHITE,
        marginTop: 15,
        textAlign: 'center'
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
        marginTop: 5
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
    goForItButtonStyle: {
        backgroundColor: APP_COLOR_RED,
        width: 200,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: COMMON_BUTTON_RADIOUS
    },
    horizontalListItemBottomContainer: {},
    cancelButtonStyle: {
        backgroundColor: APP_COLOR_WHITE,
        width: 150,
        height: 50,
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        borderRadius: COMMON_BUTTON_RADIOUS
    }
};

class NotificationConfirmationPopup extends Component {
    state = {
        modalVisibilty: false,
        apiname: ''
    };
    componentWillReceiveProps(nextProps) {
        this.setState({ modalVisibilty: nextProps.modalVisibilty });
    }
    handleRequestClose() {}
    render() {
        return (
            <Modal
                transparent={true}

                visible={this.state.modalVisibilty}
                onRequestClose={this.handleRequestClose}>
                <View style={styles.modalBackground}>
                    <View style={styles.popUpContainerView}>
                        <View
                            style={[
                                styles.headingViewStyle,
                                { backgroundColor: this.props.appTheme.thirdColor }
                            ]}>
                            <TouchableOpacity
                                onPress={this.props.onCrossPress}
                                style={styles.crossImageTouchStyle}>
                                <Image style={styles.crossImageStyle} source={POPCROSS_IC} />
                            </TouchableOpacity>
                            <Text allowFontScaling={FONT_SCALLING} style={styles.headingTextStyle}>
                                {this.props.selectedHeading && this.props.selectedHeading.toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.activityIndicatorWrapper}>
                            <Text
                                allowFontScaling={FONT_SCALLING}
                                style={[
                                    styles.subHeadingStyle,
                                    { color: this.props.appTheme.thirdColor }
                                ]}>
                                {this.props.selectedSubHeading && this.props.selectedSubHeading.toUpperCase()}
                            </Text>

                            <View style={styles.horizontalListItemBottomContainer}>
                                <Button
                                    onPress={this.props.onPressGrabIt}
                                    style={[
                                        styles.goForItButtonStyle,
                                        { backgroundColor: this.props.appTheme.thirdColor }
                                    ]}>
                                    <Text
                                        allowFontScaling={FONT_SCALLING}
                                        style={[
                                            COMMON_BUTTON_TEXT_STYLE,
                                            { fontFamily: ROADSTER_REGULAR, fontSize: 20 }
                                        ]}>
                                        {strings.GRAB_IT.toUpperCase()}
                                    </Text>
                                </Button>

                                <Button
                                    onPress={this.props.onPressCancel}
                                    style={[styles.cancelButtonStyle]}>
                                    <Text
                                        allowFontScaling={FONT_SCALLING}
                                        style={{ fontFamily: ROADSTER_REGULAR, fontSize: 20 }}>
                                        {strings.CANCEL.toUpperCase()}
                                    </Text>
                                </Button>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}
function mapStateToProps(state) {
    return { apiname: state.app.apiname, loadingState: state.app.loading };
}

export { NotificationConfirmationPopup };
