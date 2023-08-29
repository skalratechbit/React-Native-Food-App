
import React ,{Component} from 'react';
import { View ,Modal,Text,Image,TouchableOpacity} from 'react-native';
import { APP_COLOR_WHITE, APP_COLOR_RED, APP_COLOR_BLACK }  from '../../config/colors';
import { HELVETICANEUE_LT_STD_CN, DINENGSCHRIFT_BOLD } from '../../assets/fonts'
import { POPCROSS_IC } from '../../assets/images';
import { FONT_SCALLING, } from '../../config/common_styles';
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
            justifyContent:'center',
            backgroundColor: '#00000099'
        },
        activityIndicatorWrapper: {
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            paddingLeft: 30,
            paddingRight: 30,

        },
        headingViewStyle:{
            backgroundColor:APP_COLOR_RED,
            padding:22,
        },
        popUpContainerView:{
            borderRadius:10,borderWidth:0,
            width:'80%',overflow:'hidden'
        },
        headingTextStyle:{
            fontSize:18,
            fontFamily:DINENGSCHRIFT_BOLD,
            alignSelf:'center',
            color:APP_COLOR_WHITE,
            marginTop:7,
            textAlign:'center'
        },
        subHeadingStyle:{
            fontSize:16,
            fontFamily:DINENGSCHRIFT_BOLD,
            alignSelf:'center',
            color:APP_COLOR_RED,
            marginTop:15,
        },
        detailTextStyle:{
            fontSize:18,
            fontFamily:HELVETICANEUE_LT_STD_CN,
            alignSelf:'center',
            color:APP_COLOR_BLACK,
            textAlign:'center',
            marginStart:10,
            marginEnd:10,
            marginBottom:10,
            marginTop:5
        },
        crossImageStyle:{
            width:18,
            height:18,
            resizeMode:'contain',

        },
        crossImageTouchStyle:{
            width:30,
            height:30,
            justifyContent:'center',
            alignItems:'center',
            position:'absolute',
            right:8,
            top:5,
        }
    };

    class  ScheduleOrderPopUp extends   Component {
        state={
            modalVisibilty:false,
            apiname:''
        }
        componentWillReceiveProps(nextProps) {

            this.setState({modalVisibilty:nextProps.modalVisibilty});
        }
        handleRequestClose() {}
        render(){
            return (
                <Modal
                    transparent={true}
                   
                    visible={this.state.modalVisibilty}
                    onRequestClose={this.handleRequestClose}>
                    <View style={styles.modalBackground}>
                        <View style={styles.popUpContainerView}>
                            <View style={[styles.headingViewStyle,{backgroundColor:this.props.appTheme.thirdColor}]}>
                                <TouchableOpacity onPress={this.props.onCrossPress} style={styles.crossImageTouchStyle}>
                                    <Image style={styles.crossImageStyle}
                                        source={ POPCROSS_IC }/>
                                    </TouchableOpacity>
                                    <Text allowFontScaling={FONT_SCALLING}
                                          style={styles.headingTextStyle} >{this.props.selectedHeading.toUpperCase()}</Text>
                                </View>
                                <View style={styles.activityIndicatorWrapper}>
                                    <Text allowFontScaling={FONT_SCALLING}
                                          style={[styles.subHeadingStyle,{color:this.props.appTheme.thirdColor,textAlign:'center'}]}>{this.props.selectedSubHeading.toUpperCase()}</Text>
                                    <Text allowFontScaling={FONT_SCALLING}
                                          style={styles.detailTextStyle}>
                                        {this.props.selectedDetails}
                                    </Text>
                                </View>

                            </View>

                        </View>
                    </Modal>
                );
            }
        }
        export default ScheduleOrderPopUp

