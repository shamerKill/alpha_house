import React, { FC, useState } from 'react';
import {
  View, TouchableNativeFeedback, Text, StyleSheet, ScrollView,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../../components/layout/head';
import {
  themeWhite, defaultThemeBgColor, themeGray, defaultThemeColor,
} from '../../../config/theme';
import ContractContentView from './com_content';
import ComContractIndexBotton from './index_botton';


const ContractScreen: FC = () => {
  const navigation = useNavigation();
  let { params: routeParams } = useRoute<RouteProp<{constract: { contractType: typeof selectType; coinType: string; }}, 'constract'>>();
  if (!routeParams) routeParams = { contractType: 0, coinType: '' };

  // 合约类型 usdt合约0，币本位合约1，混合合约2
  const [selectType, setSelectType] = useState<0|1|2>(0);
  // 杠杆倍数
  const [leverType, setLeverType] = useState('');
  // 可平手数
  const [canCloseOrderValue, setCanCloseOrderValue] = useState<{lang: string; sort: string;}>({ lang: '0', sort: '0' });

  const addEvent = {
    // 更改合约类型页面
    changeSelectType: ({ coinType = routeParams.coinType, contractType = routeParams.contractType }: { coinType?: string; contractType?: typeof selectType }) => {
      // FIXME: 没有比本位合约和混合合约
      if (contractType !== 0) {
        showMessage({
          position: 'bottom',
          message: '功能暂未开放，敬请期待',
          type: 'info',
        });
        return;
      }
      setSelectType(contractType);
      navigation.navigate('Contract', { contractType, coinType });
    },
  };

  return (
    <ComLayoutHead
      close
      overScroll
      scrollStyle={{ backgroundColor: themeWhite }}>
      <View style={style.headView}>
        <TouchableNativeFeedback onPress={() => addEvent.changeSelectType({ contractType: 0 })}>
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
        <TouchableNativeFeedback onPress={() => addEvent.changeSelectType({ contractType: 1 })}>
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
        <TouchableNativeFeedback onPress={() => addEvent.changeSelectType({ contractType: 2 })}>
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
        <ContractContentView
          changeConTypeCallback={addEvent.changeSelectType}
          selectType={selectType}
          coinType={routeParams.coinType}
          changePageLeverType={setLeverType}
          canCloseOrderValue={canCloseOrderValue} />
        <ComContractIndexBotton
          selectType={selectType}
          leverType={leverType}
          setCanCloseOrderValue={setCanCloseOrderValue} />
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
