
import React, { Component }from 'react';
import { Text, View } from 'react-native';
import { DINENGSCHRIFT_REGULAR  } from '../../assets/fonts';
import { APP_COLOR_RED, ORDER_STATUS_STATUS_BAR_GRAY }  from '../../config/colors';
import strings  from '../../config/strings/strings';
import { FONT_SCALLING } from '../../config/common_styles';

const ORDER_STATUS_SMALL_TEXT_SIZE = 18;
const ORDER_STATUS_CIRCLE_SIZE = 18;
const LEFT_RIGHT_MARGIN = 20;



class OrderStatusBar extends Component {
    statusBarSingleCircleView(color){
        return(
            <View style={{  width: ORDER_STATUS_CIRCLE_SIZE,
                height: ORDER_STATUS_CIRCLE_SIZE,
                backgroundColor: color,
                borderRadius: ORDER_STATUS_CIRCLE_SIZE/2}}/>
            );
        }
        statusBarSingleBarView(color){
            return(
                <View style={[ styles.progressLineViewStyle, { backgroundColor: color } ]}/>
            );
        }

        statusBarView(){
            if (this.props.orderStatus==1) {
                return(
                    <View style={{
                        alignItems: 'center',
                        flexDirection: 'row',
                        marginTop: 20,
                        paddingEnd: LEFT_RIGHT_MARGIN,
                        paddingStart: LEFT_RIGHT_MARGIN
                    }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        { this.statusBarSingleCircleView(this.props.appTheme.thirdColor) }
                        { this.statusBarSingleBarView(ORDER_STATUS_STATUS_BAR_GRAY) }
                        { this.statusBarSingleCircleView(ORDER_STATUS_STATUS_BAR_GRAY) }
                        { this.statusBarSingleBarView(ORDER_STATUS_STATUS_BAR_GRAY) }
                        { this.statusBarSingleCircleView(ORDER_STATUS_STATUS_BAR_GRAY) }
                        { this.statusBarSingleBarView(ORDER_STATUS_STATUS_BAR_GRAY) }
                        { this.statusBarSingleCircleView(ORDER_STATUS_STATUS_BAR_GRAY) }
                    </View>
                </View>
            );
        }else if (this.props.orderStatus==2) {
            return(
                <View style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    marginTop: 20,
                    paddingEnd: LEFT_RIGHT_MARGIN,
                    paddingStart: LEFT_RIGHT_MARGIN
                }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    { this.statusBarSingleCircleView(this.props.appTheme.thirdColor) }
                    { this.statusBarSingleBarView(this.props.appTheme.thirdColor) }
                    { this.statusBarSingleCircleView(this.props.appTheme.thirdColor) }
                    { this.statusBarSingleBarView(ORDER_STATUS_STATUS_BAR_GRAY) }
                    { this.statusBarSingleCircleView(ORDER_STATUS_STATUS_BAR_GRAY) }
                    { this.statusBarSingleBarView(ORDER_STATUS_STATUS_BAR_GRAY) }
                    { this.statusBarSingleCircleView(ORDER_STATUS_STATUS_BAR_GRAY) }
                </View>
            </View>
        );
    }else if (this.props.orderStatus==3) {
        return(
            <View style={{
                alignItems: 'center',
                flexDirection: 'row',
                marginTop: 20,
                paddingEnd: LEFT_RIGHT_MARGIN,
                paddingStart: LEFT_RIGHT_MARGIN
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                { this.statusBarSingleCircleView(this.props.appTheme.thirdColor) }
                { this.statusBarSingleBarView(this.props.appTheme.thirdColor) }
                { this.statusBarSingleCircleView(this.props.appTheme.thirdColor) }
                { this.statusBarSingleBarView(this.props.appTheme.thirdColor) }
                { this.statusBarSingleCircleView(this.props.appTheme.thirdColor) }
                { this.statusBarSingleBarView(ORDER_STATUS_STATUS_BAR_GRAY) }
                { this.statusBarSingleCircleView(ORDER_STATUS_STATUS_BAR_GRAY) }
            </View>
        </View>
    );
}else if (this.props.orderStatus==4) {
    return(
        <View style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginTop: 20,
            paddingEnd: LEFT_RIGHT_MARGIN,
            paddingStart: LEFT_RIGHT_MARGIN
        }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            { this.statusBarSingleCircleView(this.props.appTheme.thirdColor) }
            { this.statusBarSingleBarView(this.props.appTheme.thirdColor) }
            { this.statusBarSingleCircleView(this.props.appTheme.thirdColor) }
            { this.statusBarSingleBarView(this.props.appTheme.thirdColor) }
            { this.statusBarSingleCircleView(this.props.appTheme.thirdColor) }
            { this.statusBarSingleBarView(this.props.appTheme.thirdColor) }
            { this.statusBarSingleCircleView(this.props.appTheme.thirdColor) }
        </View>
    </View>
);
}else {
    return(
        <View style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginTop: 20,
            paddingEnd: LEFT_RIGHT_MARGIN,
            paddingStart: LEFT_RIGHT_MARGIN
        }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            { this.statusBarSingleCircleView(ORDER_STATUS_STATUS_BAR_GRAY) }
            { this.statusBarSingleBarView(ORDER_STATUS_STATUS_BAR_GRAY) }
            { this.statusBarSingleCircleView(ORDER_STATUS_STATUS_BAR_GRAY) }
            { this.statusBarSingleBarView(ORDER_STATUS_STATUS_BAR_GRAY) }
            { this.statusBarSingleCircleView(ORDER_STATUS_STATUS_BAR_GRAY) }
            { this.statusBarSingleBarView(ORDER_STATUS_STATUS_BAR_GRAY) }
            { this.statusBarSingleCircleView(ORDER_STATUS_STATUS_BAR_GRAY) }
        </View>
    </View>
);
}
}

statusTextView(){
    if (this.props.orderStatus==1) {
        return(
            <View style={{
                alignItems: 'center',
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'space-between',
                paddingEnd: LEFT_RIGHT_MARGIN,
                paddingStart: 0,
            }}>

            <Text allowFontScaling={FONT_SCALLING}
                  style={[ styles.orderStatusTextStyle, { color: this.props.appTheme.thirdColor } ]}>
                { strings.STARTED.toUpperCase() }
            </Text>
            <Text allowFontScaling={FONT_SCALLING}
                  style={[ styles.orderStatusTextStyle, { color: ORDER_STATUS_STATUS_BAR_GRAY } ]}>
                { strings.IN_PROGRESS.toUpperCase() }
            </Text>
            <Text allowFontScaling={FONT_SCALLING}
                  style={[ styles.orderStatusTextStyle, { color: ORDER_STATUS_STATUS_BAR_GRAY } ]}>
                { strings.ON_THE_WAY.toUpperCase() }
            </Text>
            <Text allowFontScaling={FONT_SCALLING}
                  style={[ styles.orderStatusTextStyle, { color: ORDER_STATUS_STATUS_BAR_GRAY } ]}>
                { strings.ITS_HERE.toUpperCase() }
            </Text>
        </View>
    );
}else if (this.props.orderStatus==2) {
    return(
        <View style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginTop: 10,
            justifyContent: 'space-between',
            paddingEnd: 0,
            paddingStart: 0,
        }}>

        <Text allowFontScaling={FONT_SCALLING}
              style={[ styles.orderStatusTextStyle, { color: this.props.appTheme.thirdColor } ]}>
            { strings.STARTED.toUpperCase() }
        </Text>
        <Text allowFontScaling={FONT_SCALLING}
              style={[ styles.orderStatusTextStyle, { color:this.props.appTheme.thirdColor } ]}>
            { strings.IN_PROGRESS.toUpperCase() }
        </Text>
        <Text allowFontScaling={FONT_SCALLING}
              style={[ styles.orderStatusTextStyle, { color: ORDER_STATUS_STATUS_BAR_GRAY } ]}>
            { strings.ON_THE_WAY.toUpperCase() }
        </Text>
        <Text allowFontScaling={FONT_SCALLING}
              style={[ styles.orderStatusTextStyle, { color: ORDER_STATUS_STATUS_BAR_GRAY } ]}>
            { strings.ITS_HERE.toUpperCase() }
        </Text>
    </View>
);
}else if (this.props.orderStatus==3) {
    return(
        <View style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginTop: 10,
            justifyContent: 'space-between',
            paddingEnd: 0,
            paddingStart: 0,
        }}>

        <Text allowFontScaling={FONT_SCALLING}
              style={[ styles.orderStatusTextStyle, { color: this.props.appTheme.thirdColor } ]}>
            { strings.STARTED.toUpperCase() }
        </Text>
        <Text allowFontScaling={FONT_SCALLING}
              style={[ styles.orderStatusTextStyle, { color: this.props.appTheme.thirdColor } ]}>
            { strings.IN_PROGRESS.toUpperCase() }
        </Text>
        <Text allowFontScaling={FONT_SCALLING}
              style={[ styles.orderStatusTextStyle, { color: this.props.appTheme.thirdColor } ]}>
            { strings.ON_THE_WAY.toUpperCase() }
        </Text>
        <Text allowFontScaling={FONT_SCALLING}
              style={[ styles.orderStatusTextStyle, { color: ORDER_STATUS_STATUS_BAR_GRAY } ]}>
            { strings.ITS_HERE.toUpperCase() }
        </Text>
    </View>
);
}else if (this.props.orderStatus==4) {
    return(
        <View style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginTop: 10,
            justifyContent: 'space-between',
            paddingEnd: 0,
            paddingStart: 0,
        }}>

        <Text allowFontScaling={FONT_SCALLING}
              style={[ styles.orderStatusTextStyle, { color: this.props.appTheme.thirdColor } ]}>
            { strings.STARTED.toUpperCase() }
        </Text>
        <Text allowFontScaling={FONT_SCALLING}
              style={[ styles.orderStatusTextStyle, { color: this.props.appTheme.thirdColor } ]}>
            { strings.IN_PROGRESS.toUpperCase() }
        </Text>
        <Text allowFontScaling={FONT_SCALLING}
              style={[ styles.orderStatusTextStyle, { color: this.props.appTheme.thirdColor } ]}>
            { strings.ON_THE_WAY.toUpperCase() }
        </Text>
        <Text allowFontScaling={FONT_SCALLING}
              style={[ styles.orderStatusTextStyle, { color: this.props.appTheme.thirdColor } ]}>
            { strings.ITS_HERE.toUpperCase() }
        </Text>
    </View>
);
}else {
    return(
        <View style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginTop: 10,
            justifyContent: 'space-between',
            paddingEnd: 0,
            paddingStart: 0,
        }}>

        <Text allowFontScaling={FONT_SCALLING}
            style={[ styles.orderStatusTextStyle, { color: ORDER_STATUS_STATUS_BAR_GRAY } ]}>
            { strings.STARTED.toUpperCase() }
        </Text>
        <Text allowFontScaling={FONT_SCALLING}
              style={[ styles.orderStatusTextStyle, { color: ORDER_STATUS_STATUS_BAR_GRAY } ]}>
            { strings.IN_PROGRESS.toUpperCase() }
        </Text>
        <Text allowFontScaling={FONT_SCALLING}
              style={[ styles.orderStatusTextStyle, { color: ORDER_STATUS_STATUS_BAR_GRAY } ]}>
            { strings.ON_THE_WAY.toUpperCase() }
        </Text>
        <Text allowFontScaling={FONT_SCALLING}
              style={[ styles.orderStatusTextStyle, { color: ORDER_STATUS_STATUS_BAR_GRAY } ]}>
            { strings.ITS_HERE.toUpperCase() }
        </Text>
    </View>
);
}
}
render (){

    return (
        <View>
            { this.statusBarView() }
            { this.statusTextView() }
        </View>
    );
}
};

const styles = {
    orderStatusTextStyle: {
        fontSize: ORDER_STATUS_SMALL_TEXT_SIZE,
        fontFamily: DINENGSCHRIFT_REGULAR,
        color: APP_COLOR_RED
    },
    progressLineViewStyle:{
        height: 4,
        backgroundColor: APP_COLOR_RED,
        flex: 1,
        marginTop: 7
    },
};

export { OrderStatusBar };
