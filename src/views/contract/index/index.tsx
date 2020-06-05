import React, { FC, useState } from 'react';
import {
  View, TouchableNativeFeedback, Text, StyleSheet, ScrollView,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import ComLayoutHead from '../../../components/layout/head';
import {
  themeWhite, defaultThemeBgColor, themeGray, defaultThemeColor,
} from '../../../config/theme';
import ContractUSDTView from './usdt_page';
import ContractCoinView from './coin_page';
import ContractMixView from './mix_page';


const ContractScreen: FC = () => {
  const navigation = useNavigation();
  let { params: routeParams } = useRoute<RouteProp<{constract: { contractType: typeof selectType; coinType: string; }}, 'constract'>>();
  if (!routeParams) routeParams = { contractType: 0, coinType: 'BTC/USDT' };

  const [selectType, setSelectType] = useState<0|1|2>(0);

  const addEvent = {
    // 更改合约类型页面
    changeSelectType: (id: typeof selectType) => {
      setSelectType(id);
      navigation.navigate('Contract', { ...routeParams, contractType: id });
    },
  };

  return (
    <ComLayoutHead
      close
      overScroll
      scrollStyle={{ backgroundColor: themeWhite }}>
      <View style={style.headView}>
        <TouchableNativeFeedback onPress={() => addEvent.changeSelectType(0)}>
          <View style={style.headTouchView}>
            <Text style={[
              style.headTouchText,
              selectType === 0 && style.headTouchSelectText,
            ]}>
              USDT合约
            </Text>
            {
              selectType === 0
              && <View style={style.headTouchSelectView} />
            }
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => addEvent.changeSelectType(1)}>
          <View style={style.headTouchView}>
            <Text style={[
              style.headTouchText,
              selectType === 1 && style.headTouchSelectText,
            ]}>
              币本位合约
            </Text>
            {
              selectType === 1
              && <View style={style.headTouchSelectView} />
            }
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => addEvent.changeSelectType(2)}>
          <View style={style.headTouchView}>
            <Text style={[
              style.headTouchText,
              selectType === 2 && style.headTouchSelectText,
            ]}>
              混合合约
            </Text>
            {
              selectType === 2
              && <View style={style.headTouchSelectView} />
            }
          </View>
        </TouchableNativeFeedback>
      </View>
      <ScrollView style={style.contentScrollView}>
        {
          selectType === 0 && <ContractUSDTView coinType={routeParams.coinType} />
        }
        {
          selectType === 1 && <ContractCoinView coinType={routeParams.coinType} />
        }
        {
          selectType === 2 && <ContractMixView coinType={routeParams.coinType} />
        }
      </ScrollView>
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  headView: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: defaultThemeBgColor,
  },
  headTouchView: {
    height: 40,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headTouchText: {
    lineHeight: 38,
    fontSize: 16,
    color: themeGray,
    fontWeight: 'bold',
  },
  headTouchSelectText: {
    color: defaultThemeColor,
  },
  headTouchSelectView: {
    height: 2,
    width: 30,
    borderRadius: 2,
    backgroundColor: defaultThemeColor,
  },
  contentScrollView: {
    flex: 1,
  },
});

export default ContractScreen;
