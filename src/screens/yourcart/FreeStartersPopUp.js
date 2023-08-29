import React, { Component } from 'react';
import {
    View,
    Modal,
    Text,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native';
import {CachedImage} from 'react-native-img-cache';
import {
    APP_COLOR_WHITE,
    APP_COLOR_RED,
    APP_COLOR_BLACK,
    TRANSPARENT_COLOR
} from '../../config/colors';
import {
    DINENGSCHRIFT_REGULAR,
    ROADSTER_REGULAR,
    HELVETICANEUE_LT_STD_CN
} from '../../assets/fonts';
import {
    POPCROSS_IC,
    ITEM1,
    ITEM2,
    ITEM3,
    ITEM4,
    ITEM5,
    ITEM6
} from '../../assets/images';
import {
    FONT_SCALLING,
    IF_OS_IS_IOS
} from '../../config/common_styles';
import { connect } from 'react-redux';
import { actions as cartActions } from '../../ducks/cart';
import strings from '../../config/strings/strings';
const ICON_SIZE = 31;
const ICON_VIEW_SIZE = 60;
const TEXT_LEFT_MARGIN = 65;
const TEXT_SIZE = 25;
const REGISTER_TEXT_SIZE = 8;
const BUTTON_HEIGHT = 53;
const ICONS_MARGIN = 16;
const LINE_HEIGHT = 0.5;

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
        padding: 18
    },
    popUpContainerView: {
        borderRadius: 10,
        borderWidth: 0,
        width: 300,
        overflow: 'hidden'
    },
    headingTextStyle: {
        fontSize: 35,
        fontFamily: DINENGSCHRIFT_REGULAR,
        alignSelf: 'center',
        color: APP_COLOR_WHITE,
        marginTop: 7,
        textAlign: 'center'
    },
    subHeadingStyle: {
        fontSize: 25,
        fontFamily: DINENGSCHRIFT_REGULAR,
        alignSelf: 'center',
        color: APP_COLOR_RED
    },
    detailTextStyle: {
        fontSize: 18,
        fontFamily: HELVETICANEUE_LT_STD_CN,
        alignSelf: 'center',
        color: APP_COLOR_BLACK,
        textAlign: 'center',
        marginStart: 10,
        marginEnd: 10,
        marginTop: 20
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

    bottomviewStyle: {
        height: 60,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageContainerStyle: {
        width: 150,
        height: 106
    },
    itemImageStyle: {
        width: 152,
        height: 104,
        //resizeMode: 'stretch'
    },
    subItemImageStyle: {
        width: 350,
        height: 206,
        resizeMode: 'contain'
    },
    selectedDotColor: {
        backgroundColor: APP_COLOR_RED,
        borderRadius: 8,
        width: 16,
        height: 16,
        marginTop: IF_OS_IS_IOS ? 1 : 2
    },
    unslectedTopColor: {
        backgroundColor: 'yellow',
        borderRadius: 8,
        width: 16,
        height: 16,
        backgroundColor: TRANSPARENT_COLOR,
        borderWidth: 2,
        borderColor: APP_COLOR_RED,
        marginTop: IF_OS_IS_IOS ? 1 : 2
    }
};

class FreeStartersPopUp extends Component {
    state = {
        modalVisibilty: false,
        apiname: '',
        freeItemsDataArray: [
            { image: ITEM1, item: 1, datamargin: 0 },
            { image: ITEM2, item: 1, datamargin: 4 },
            { image: ITEM3, item: 1, datamargin: 0 },
            { image: ITEM4, item: 1, datamargin: 4 },
            { image: ITEM5, item: 1, datamargin: 0 },
            { image: ITEM6, item: 1, datamargin: 4 }
        ],
        buffalofreeItemsDataArray: [
            { image: ITEM1, item: 1, datamargin: 0 },
            { image: ITEM2, item: 1, datamargin: 4 },
            { image: ITEM3, item: 1, datamargin: 0 },
            { image: ITEM4, item: 1, datamargin: 4 },
            { image: ITEM5, item: 1, datamargin: 0 },
            { image: ITEM6, item: 1, datamargin: 4 }
        ],
        bbqfreeItemsDataArray: [
            { image: ITEM1, item: 1, datamargin: 0 },
            { image: ITEM2, item: 1, datamargin: 4 },
            { image: ITEM3, item: 1, datamargin: 0 },
            { image: ITEM4, item: 1, datamargin: 4 },
            { image: ITEM5, item: 1, datamargin: 0 },
            { image: ITEM6, item: 1, datamargin: 4 }
        ],

        subModalVisibilty: false,
        bbQStatus: true,
        bufflo: false
    };
    componentWillReceiveProps(nextProps) {
        //    this.setState({modalVisibilty:nextProps.modalVisibilty});
        if (nextProps.starters !== this.props.starters) {
            this.getstartersItemsFomObject(nextProps.starters);
        }
    }
    componentDidMount() {}
    addFreeItemsToCart() {
        var filteredArray = this.state.freeItemsDataArray.filter(obj => obj.Selection == 1);
        if (filteredArray.length == 0) {
            alert('Select at lest one item');
        } else {
            this.setState({ modalVisibilty: false });
            this.props.addFreeItemsToCart(null, this.state.freeItemsDataArray);
        }
    }

    getstartersItemsFomObject(object) {
        var array = [];
        for (var i = 0; i < object[0].Items.length; i++) {
            object[0].Items[i]['Selection'] = 0;
            object[0].Items[i]['Free'] = 1;
            if (i != 4) {
                array.push(object[0].Items[i]);
            }
        }
        this.setState({
            bbqfreeItemsDataArray: array,
            freeItemsDataArray: array,
            modalVisibilty: true
        });

        var buffaloArray = [];
        for (var i = 0; i < object[0].Items.length; i++) {
            object[0].Items[i]['Selection'] = 0;
            object[0].Items[i]['Free'] = 1;
            if (i != 3) {
                buffaloArray.push(object[0].Items[i]);
            }
        }

        this.setState({ buffalofreeItemsDataArray: buffaloArray, modalVisibilty: true });
    }
    selectThirdItem() {
        var array = this.state.freeItemsDataArray;
        for (var i = 0; i < array.length; i++) {
            array[i].Selection = 0;
        }
        array[3].Selection = 1;

        this.setState({ freeItemsDataArray: array });
    }

    onCrossPressSubCategory() {
        if (this.state.bufflo) {
            this.setState(
                {
                    subModalVisibilty: false,
                    freeItemsDataArray: this.state.buffalofreeItemsDataArray
                },
                () => this.selectThirdItem()
            );
        } else {
            this.setState(
                { subModalVisibilty: false, freeItemsDataArray: this.state.bbqfreeItemsDataArray },
                () => this.selectThirdItem()
            );
        }
    }
    selectItem(value, index) {
        if (index == 3) {
            this.setState({ subModalVisibilty: true });
            return;
        }

        var array = this.state.freeItemsDataArray;
        for (var i = 0; i < array.length; i++) {
            array[i].Selection = 0;
        }
        array[index].Selection = 1;

        this.setState({ freeItemsDataArray: array });
    }

    selectItemOption(index) {
        if (this.state.bbQStatus && index == 2) {
            this.setState({
                bufflo: true,
                bbQStatus: false
            });
        } else if (this.state.bufflo && index == 1) {
            this.setState({
                bufflo: false,
                bbQStatus: true
            });
        }
    }
    handleRequestClose() {}
    render() {
        var days;
        if (this.props.freeStarterExpiryDate) {
        }
        return (
            <Modal
                transparent={true}
               
                visible={this.state.modalVisibilty}
                onRequestClose={this.handleRequestClose}>
                {!this.state.subModalVisibilty ? (
                    <View style={styles.modalBackground}>
                        <View style={styles.popUpContainerView}>
                            <View
                                style={[
                                    styles.headingViewStyle,
                                    { backgroundColor: APP_COLOR_WHITE }
                                ]}
                            />

                            <View style={styles.activityIndicatorWrapper}>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                    {this.state.freeItemsDataArray.map((value, i) => (
                                        <View key={i}>
                                            <TouchableWithoutFeedback
                                                key={i}
                                                onPress={() => this.selectItem(value, i)}>
                                                <View style={[styles.imageContainerStyle]}>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        {(i == 3 || i == 5 || i == 1) && (
                                                            <View
                                                                style={{
                                                                    height: 110,
                                                                    width: 2,
                                                                    backgroundColor: APP_COLOR_WHITE
                                                                }}
                                                            />
                                                        )}

                                                        <CachedImage
                                                            style={styles.itemImageStyle}
                                                            source={{
                                                                uri: value.ThumbnailImg,
                                                            }}
                                                        />
                                                    </View>

                                                    {value.Selection == 1 && (
                                                        <View
                                                            style={{
                                                                position: 'absolute',
                                                                width:
                                                                    i == 3 || i == 4 || i == 1
                                                                        ? 148
                                                                        : 150,
                                                                height: 104,
                                                                borderWidth: 5,
                                                                borderColor: this.props.appTheme
                                                                    .thirdColor,
                                                                marginStart:
                                                                    i == 3 || i == 5 || i == 1
                                                                        ? 2
                                                                        : 0
                                                            }}
                                                        />
                                                    )}
                                                </View>
                                            </TouchableWithoutFeedback>
                                        </View>
                                    ))}
                                </View>
                                <Text
                                    allowFontScaling={FONT_SCALLING}
                                    style={[
                                        styles.detailTextStyle,
                                        {
                                            color: this.props.appTheme.thirdColor,
                                            textAlign: 'center'
                                        }
                                    ]}>
                                    {strings.YOUR_FREE_VOUCHERS}
                                </Text>
                                <Text
                                    allowFontScaling={FONT_SCALLING}
                                    style={[
                                        styles.subHeadingStyle,
                                        { color: this.props.appTheme.thirdColor }
                                    ]}>
                                    {strings.EXPIRES_IN} {this.props.freeStarterExpiryDate} {strings.DAYS}
                                </Text>
                            </View>
                            <TouchableWithoutFeedback onPress={() => this.addFreeItemsToCart()}>
                                <View
                                    style={[
                                        styles.bottomviewStyle,
                                        { backgroundColor: this.props.appTheme.thirdColor }
                                    ]}>
                                    <Text
                                        allowFontScaling={FONT_SCALLING}
                                        style={[
                                            styles.detailTextStyle,
                                            {
                                                color: APP_COLOR_WHITE,
                                                textAlign: 'center',
                                                marginTop: 0,
                                                fontFamily: ROADSTER_REGULAR,
                                                fontSize: 25
                                            }
                                        ]}>
                                        {strings.GRAB_IT_NOW}
                                    </Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                ) : (
                    <View style={styles.modalBackground}>
                        <View style={styles.popUpContainerView}>
                            <View style={styles.activityIndicatorWrapper}>
                                <TouchableWithoutFeedback>
                                    <View>
                                        <CachedImage
                                            style={styles.subItemImageStyle}
                                            source={{
                                                uri: this.state.bufflo
                                                    ? this.state.buffalofreeItemsDataArray[3]
                                                          .ThumbnailImg
                                                    : this.state.bbqfreeItemsDataArray[3]
                                                          .ThumbnailImg,
                                            }}
                                        />
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                            <TouchableOpacity
                                onPress={() => this.onCrossPressSubCategory()}
                                style={styles.crossImageTouchStyle}>
                                <Image style={styles.crossImageStyle} source={POPCROSS_IC} />
                            </TouchableOpacity>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    height: 50,
                                    backgroundColor: APP_COLOR_WHITE,
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                <TouchableOpacity
                                    style={{ marginStart: 40, flexDirection: 'row' }}
                                    onPress={() => this.selectItemOption(1)}>
                                    {this.state.bbQStatus ? (
                                        <View
                                            style={[
                                                styles.selectedDotColor,
                                                { backgroundColor: this.props.appTheme.thirdColor }
                                            ]}
                                        />
                                    ) : (
                                        <View
                                            style={[
                                                styles.unslectedTopColor,
                                                { borderColor: this.props.appTheme.thirdColor }
                                            ]}
                                        />
                                    )}
                                    <Text
                                        style={{
                                            color: this.props.appTheme.thirdColor,
                                            fontSize: 20,
                                            fontFamily: DINENGSCHRIFT_REGULAR,
                                            marginStart: 10
                                        }}>
                                        {this.state.bbqfreeItemsDataArray[3].ItemName}{' '}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ marginStart: 30, flexDirection: 'row', marginEnd: 50 }}
                                    onPress={() => this.selectItemOption(2)}>
                                    {this.state.bufflo ? (
                                        <View
                                            style={[
                                                styles.selectedDotColor,
                                                { backgroundColor: this.props.appTheme.thirdColor }
                                            ]}
                                        />
                                    ) : (
                                        <View
                                            style={[
                                                styles.unslectedTopColor,
                                                { borderColor: this.props.appTheme.thirdColor }
                                            ]}
                                        />
                                    )}
                                    <Text
                                        style={{
                                            color: this.props.appTheme.thirdColor,
                                            fontSize: 20,
                                            fontFamily: DINENGSCHRIFT_REGULAR,
                                            marginStart: 10
                                        }}>
                                        {this.state.buffalofreeItemsDataArray[3].ItemName}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View
                                style={[
                                    styles.bottomviewStyle,
                                    { backgroundColor: this.props.appTheme.thirdColor }
                                ]}>
                                <Text
                                    allowFontScaling={FONT_SCALLING}
                                    style={[
                                        styles.detailTextStyle,
                                        {
                                            color: APP_COLOR_WHITE,
                                            textAlign: 'center',
                                            marginTop: 0,
                                            fontFamily: DINENGSCHRIFT_REGULAR,
                                            fontSize: 25
                                        }
                                    ]}>
                                    {strings.EXPIRES_IN} {this.props.freeStarterExpiryDate} {strings.DAYS}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </Modal>
        );
    }
}
function mapStateToProps(state) {
    return {
        cartItemsArray: state.cart.cartItemsArray,
        freeStarterExpiryDate: state.app.freeStarterExpiryDate
    };
}

export default connect(mapStateToProps, cartActions)(FreeStartersPopUp);
