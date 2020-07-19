import React, { FC } from 'react';
import {
  View, StyleSheet, Text, Image, ViewStyle,
} from 'react-native';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { TypeMarketListLine } from './type';
import {
  themeWhite, defaultThemeBgColor, themeBlack, themeGray, themeRed, themeGreen, getThemeOpacity,
} from '../../../config/theme';

export const ComMarketLineTypeView: FC<{type: TypeMarketListLine['type'], inputStyle?: ViewStyle}> = ({
  type,
  inputStyle,
}) => {
  return (
    <View style={[style.lineAfter, inputStyle]}>
      <View style={style.lineAfterTextView}>
        <Text style={style.lineAfterText}>
          { type === 0 && '现货'}
          { type === 1 && '金本位合约'}
          { type === 2 && '币本位合约'}
          { type === 3 && '混合合约'}
        </Text>
      </View>
      <View style={style.lineAfterBgView}>
        <Image
          resizeMode="stretch"
          style={style.lineAfterBg}
          source={require('../../../assets/images/icons/market_line_text_bg.png')} />
      </View>
    </View>
  );
};

const ComMarketLine: FC<{data: TypeMarketListLine}> = ({ data }) => {
  const {
    name,
    priceUSDT,
    priceRMB,
    ratio,
    volume,
    type,
  } = data;
  const navigation = useNavigation();
  return (
    <TouchableNativeFeedback onPress={() => navigation.navigate('Contract', { contractType: 1, coinType: name.split(' ')[0] })}>
      <View style={style.lineView}>
        <View style={style.lineLeft}>
          <View style={style.lineLeftText}>
            <View style={style.lineLeftText}>
              <Text style={style.lineLeftTopText}>{name}</Text>
              {
              type !== undefined
                && (
                  <ComMarketLineTypeView type={type} />
                )
            }
            </View>
            <Text style={style.lineLeftTopText}>{priceUSDT}</Text>
          </View>
          <View style={style.lineLeftTextDesc}>
            <Text style={style.lineLeftTextDescText}>24h&nbsp;&nbsp;&nbsp;{volume}</Text>
            <Text style={style.lineLeftTextDescText}>&yen;{priceRMB}</Text>
          </View>
        </View>
        <View style={style.lineRight}>
          <Text style={[
            style.lineRightText,
            parseFloat(ratio) > 0
              ? style.lineRightTextCut
              : style.lineRightTextAdd,
            parseFloat(ratio) === 0 && style.lineRightTextZero,
          ]}>
            {ratio}
          </Text>
        </View>
      </View>
    </TouchableNativeFeedback>
  );
};

const style = StyleSheet.create({
  lineView: {
    backgroundColor: themeWhite,
    borderBottomColor: defaultThemeBgColor,
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  lineLeft: {
    flex: 4,
  },
  lineLeftText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 30,
  },
  lineLeftTopText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: themeBlack,
  },
  lineAfter: {
    position: 'relative',
    marginLeft: -5,
  },
  lineAfterTextView: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  lineAfterText: {
    color: themeWhite,
    lineHeight: 20,
    fontSize: 10,
  },
  lineAfterBgView: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  lineAfterBg: {
    width: '100%',
    height: '100%',
  },
  lineLeftTextDesc: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  lineLeftTextDescText: {
    fontSize: 12,
    color: themeGray,
  },
  lineRight: {
    paddingLeft: 10,
    flex: 1,
  },
  lineRightText: {
    height: 32,
    lineHeight: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 3,
    borderWidth: 1,
  },
  lineRightTextAdd: {
    color: themeRed,
    backgroundColor: getThemeOpacity(themeRed, 0.1),
    borderColor: getThemeOpacity(themeRed, 0.4),
  },
  lineRightTextCut: {
    color: themeGreen,
    backgroundColor: getThemeOpacity(themeGreen, 0.1),
    borderColor: getThemeOpacity(themeGreen, 0.4),
  },
  lineRightTextZero: {
    color: themeGray,
    backgroundColor: getThemeOpacity(themeGray, 0.1),
    borderColor: getThemeOpacity(themeGray, 0.4),
  },
});

export default ComMarketLine;
