import React, { Component } from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Actions } from 'react-native-router-flux';
import { APP_COLOR_WHITE } from '../../config/colors';
import { IF_OS_IS_IOS, FONT_SCALLING } from '../../config/common_styles';
import strings from '../../config/strings/strings';
import {
    VOUCHER_LEFT_ARROW_IC,
    VOUCHER_RIGHT_ARROW_IC
} from '../../assets/images'
import { FILTER_VOUCHER_STATUS } from '../../config/constants/app_logic';
import { DINENGSCHRIFT_BOLD } from '../../assets/fonts';
import { connect } from 'react-redux';
import { actions as vouchersActions } from '../../ducks/vouchers';

class VouchersHelper extends Component {

    state = {
        componentTheme: {},
        vouchersArray: [],
    }

    componentWillMount() {
        this.setThemeOfComponent();
    }

    componentDidMount() {
        if (this.props.fromDelivery == true) {
            this.setSelectonInVouchersObject(this.props.vouchers)
        }
    }

    setThemeOfComponent() {
        const theme = AsyncStorage.getItem('theme').then(data =>
            this.setState({ componentTheme: JSON.parse(data) })
        );
    }

    selectVoucher(index) {
        let array = this.state.vouchersArray.slice();

        if (this.props.fromDelivery == true) {
            if (array[index].selection == 1) {
                array[index].selection = 0
            }
            else {
                parseInt(this.props.totalWalletPrice) >= parseInt(this.props.totalAmount) ? 
                    array[index].selection = 0 : array[index].selection = 1;
            }

        }
        else {
            for (let i = 0; i < array.length; i++) {
                if (i == index) {
                    array[i].selection = 1;
                }
                else {
                    array[i].selection = 0;
                }
            }
        }
        if (this.props.fromDelivery) {
            this.props.setSelectedVoucherArray(null, array);
        }
        this.setState({ vouchersArray: array })

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.vouchers !== this.props.vouchers) {
            this.setSelectonInVouchersObject(nextProps.vouchers)
        }
    }

    setSelectonInVouchersObject(array) {
        if (array != undefined) {
            const voucherArray = [];
            array.filter(
                item => item.Vouchers.filter(voucher => {
                    if (voucher.Status === FILTER_VOUCHER_STATUS) {
                        voucherArray.push({
                            ...voucher,
                            Icon: item.Icon
                        });
                    }
                })
            );

            for (let i = 0; i < voucherArray.length; i++) {
                voucherArray[i]['selection'] = 0;
                if (this.props.fromDelivery == true) {
                    const amount = parseInt(voucherArray[i].Value);
                    voucherArray[i].Value = amount;
                }
            }

            this.setState({ vouchersArray: voucherArray });
        }
    }

    onPress = (event, caption) => {
        switch (caption) {

            case strings.BACK:
                Actions.weareat();
                break;

            case strings.ADD_ITEMS:
                alert(strings.ADD_ITEMS);
                break;

            default:
        };
    };

    render() {
        const voucherList = [
            { "image": this.state.componentTheme.VOUCHER_1, },
            { "image": this.state.componentTheme.VOUCHER_2, },
            { "image": this.state.componentTheme.VOUCHER_3, },
            { "image": this.state.componentTheme.VOUCHER_1, },
            { "image": this.state.componentTheme.VOUCHER_2, },
            { "image": this.state.componentTheme.VOUCHER_3, },

        ]
        const { vouchersArray } = this.state;
        const isEmpty = vouchersArray.length === 0;

        return (
            <View style={styles.blackInnerContanerStyle}>
                <View style={styles.voucherSelectionStyle}>
                    <Text allowFontScaling={FONT_SCALLING}
                        style={[styles.voucherTextStyle]}
                    >
                      {strings.VOUCHERS_COLON.toUpperCase()}
                    </Text>
                </View>
                <View style={styles.voucherSliderStyle}>
                    <Image style={styles.voucherRightLeftArrowStyle} source={VOUCHER_LEFT_ARROW_IC} />


                    <ScrollView horizontal hideHorizontalScrollIndicator={true} >
                        {this.state.vouchersArray.map((item, i) => (
                            <View style={styles.voucherListItemStyle} key={i}>
                                <TouchableOpacity onPress={() => this.selectVoucher(i)}>
                                    <Image style={[styles.voucherImageStyle,]} source={{ uri: item.Icon ? item.Icon : '' }} />
                                    {
                                        item.selection == 1 && <View style={styles.disabledViewColor}>
                                        </View>
                                    }

                                </TouchableOpacity>
                            </View>
                        ))
                        }
                        {isEmpty && (
                            <View style={styles.noVoucherContainer}>
                                <Text allowFontScaling={FONT_SCALLING} style={styles.noVoucherText}>
                                    {strings.YOU_HAVE_NO_VOUCHERS}
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                    <Image style={styles.voucherRightLeftArrowStyle} source={VOUCHER_RIGHT_ARROW_IC} />
                </View>
            </View>
        );
    }
}
const styles = {

    voucherRightLeftArrowStyle: {
        height: 12,
        width: 10,
        marginStart: 10,
        resizeMode: 'contain',
        marginBottom: IF_OS_IS_IOS ? 10 : 0,
        marginTop: 5
    },
    voucherSliderStyle: {
        width: 220,
        height: 55,
        marginEnd: 20,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',

    },
    voucherTextStyle: {
        marginStart: 10,
        fontSize: 16,
        fontFamily: DINENGSCHRIFT_BOLD,
        color: APP_COLOR_WHITE,
        textTransform: 'uppercase'
    },
    voucherSelectionStyle: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    blackInnerContanerStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginStart: 10
    },
    disabledViewColor: {
        flex: 1,
        backgroundColor: '#00000090',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0
    },
    voucherImageStyle: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        //backgroundColor:APP_COLOR_RED
    },
    voucherListItemStyle: {
        alignSelf: 'center',
        width: 50,
        height: 55,
        marginLeft: 5,
    },
    noVoucherContainer: {
        flex: 1,
        width: '100%',
        minWidth: IF_OS_IS_IOS ? 200 : 200,
        alignItems: 'center',
        justifyContent: 'center'
    },
    noVoucherText: {
        fontSize: 12,
        fontFamily: DINENGSCHRIFT_BOLD,
        color: APP_COLOR_WHITE,
        paddingTop: IF_OS_IS_IOS ? 0 : 5,
        textAlign: 'center'
    },
};

export default connect(null, vouchersActions)(VouchersHelper);
