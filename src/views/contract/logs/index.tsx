import React, { FC, useState, useEffect } from 'react';
import {
  View, TouchableNativeFeedback, Text, StyleSheet, ScrollView,
} from 'react-native';
import ComLayoutHead from '../../../components/layout/head';
import { defaultThemeColor, themeWhite } from '../../../config/theme';
import ComFormButton from '../../../components/form/button';
import ComLine from '../../../components/line';
import { ComContractIndexListGeneralLog, ComContractIndexListOrderLog, ComContractIndexListPlanLog } from './list';
import { TypeGeneralEntrustemntLog, TypePlanEntrustementLog, TypeStopOrderLog } from '../index/type';
import showSelector from '../../../components/modal/selector';

const ContractLogsAllScreen: FC = () => {
  const selectArr = [
    'BTC/USDT 永续',
    'EOS/USDT 永续',
    'ETH/USDT 永续',
    'BCH/USDT 永续',
  ];
  const tabList = [
    { name: '普通委托', id: 0 },
    { name: '计划委托', id: 1 },
    { name: '止盈止损', id: 2 },
  ];

  // 不同历史记录选择的类型
  const [selectType, setSelectType] = useState(tabList.map(() => 0));
  // 选择的列表
  const [selectStatus, setSelectStatus] = useState(tabList[0].id);
  // 普通委托列表
  const [generalEntrustementData, setGeneralEntrustementData] = useState<TypeGeneralEntrustemntLog[]>([]);
  // 计划委托列表
  const [planementData, setPlanementData] = useState<TypePlanEntrustementLog[]>([]);
  // 止盈止损列表
  const [orderData, setOrderData] = useState<TypeStopOrderLog[]>([]);

  const addEvent = {
    selectType: () => {
      const close = showSelector({
        title: '全部类型',
        data: selectArr,
        selected: selectArr[selectType[selectStatus]],
        onPress: (value) => {
          if (typeof value !== 'string') return;
          const selectIndex = selectArr.indexOf(value);
          if (selectArr.indexOf(value) === selectType[selectStatus]) return;
          setSelectType(state => state.map((item, index) => (index === selectStatus ? selectIndex : item)));
          close();
        },
      });
    },
  };

  useEffect(() => {
    setGeneralEntrustementData([
      {
        id: 1,
        type: 0 as TypeGeneralEntrustemntLog['type'],
        coinType: 'BTC/USDT',
        leverType: '20',
        willPrice: '9512.32',
        needNumber: 10,
        successNumber: 0,
        isSuccess: false,
        startTime: '2019/12/14 08:12:12',
        stopTime: '2019/12/14 08:12:12',
        changeValue: '0.0',
        orderType: 0,
        serviceFee: '',
      },
      {
        id: 2,
        type: 1 as TypeGeneralEntrustemntLog['type'],
        coinType: 'BTC/USDT',
        leverType: '20',
        willPrice: '9512.32',
        needNumber: 1,
        successNumber: 1,
        isSuccess: true,
        startTime: '2019/12/14 08:12:12',
        stopTime: '2019/12/14 08:12:12',
        changeValue: '12.9',
        orderType: 1,
        serviceFee: '0.1',
      },
    ]);
    setPlanementData([
      {
        id: 1,
        type: 0 as TypePlanEntrustementLog['type'],
        coinType: 'BTC/USDT',
        leverType: '20',
        startPrice: '9512.32',
        doPrice: '9512.32',
        number: 0,
        isSuccess: false,
        startTime: '2019/12/14 08:12:12',
        stopTime: '2019/12/14 08:12:12',
        orderType: 1,
      },
      {
        id: 2,
        type: 1 as TypePlanEntrustementLog['type'],
        coinType: 'BTC/USDT',
        leverType: '20',
        startPrice: '9512.32',
        doPrice: '9512.32',
        number: 11,
        isSuccess: true,
        startTime: '2019/12/14 08:12:12',
        stopTime: '2019/12/14 08:12:12',
        orderType: 0,
      },
    ]);
    setOrderData([
      {
        id: 1,
        type: 0 as TypeStopOrderLog['type'],
        coinType: 'BTC/USDT',
        leverType: '20',
        startPrice: '9512.32',
        doPrice: '9512.32',
        number: 0,
        stopType: 0 as TypeStopOrderLog['stopType'],
        isSuccess: false,
        startTime: '2019/12/14 08:12:12',
        stopTime: '2019/12/14 08:12:12',
        orderType: 1,
      },
      {
        id: 2,
        type: 1 as TypeStopOrderLog['type'],
        coinType: 'BTC/USDT',
        leverType: '20',
        startPrice: '9512.32',
        doPrice: '9512.32',
        number: 10,
        stopType: 1 as TypeStopOrderLog['stopType'],
        isSuccess: true,
        startTime: '2019/12/14 08:12:12',
        stopTime: '2019/12/14 08:12:12',
        orderType: 1,
      },
    ]);
  }, []);
  return (
    <ComLayoutHead
      title="历史记录"
      overScroll
      rightComponent={(
        <TouchableNativeFeedback onPress={() => addEvent.selectType()}>
          <Text style={{ color: defaultThemeColor, fontSize: 15 }}>选择类型</Text>
        </TouchableNativeFeedback>
      )}>
      <View style={style.topTabView}>
        {
          tabList.map(item => (
            <ComFormButton
              key={item.id}
              title={item.name}
              containerStyle={style.topTabBtn}
              onPress={() => setSelectStatus(item.id)}
              gray={selectStatus !== item.id} />
          ))
        }
      </View>
      <ComLine />
      {
        selectStatus === 0 && (
          <ScrollView style={style.scrollViewContent}>
            {
              generalEntrustementData.map(item => (
                <ComContractIndexListGeneralLog
                  key={item.id}
                  data={item} />
              ))
            }
          </ScrollView>
        )
      }
      {
        selectStatus === 1 && (
          <ScrollView style={style.scrollViewContent}>
            {
              planementData.map(item => (
                <ComContractIndexListPlanLog
                  key={item.id}
                  data={item} />
              ))
            }
          </ScrollView>
        )
      }
      {
        selectStatus === 2 && (
          <ScrollView style={style.scrollViewContent}>
            {
              orderData.map(item => (
                <ComContractIndexListOrderLog
                  key={item.id}
                  data={item} />
              ))
            }
          </ScrollView>
        )
      }
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  topTabView: {
    flexDirection: 'row',
    backgroundColor: themeWhite,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  topTabBtn: {
    width: '30%',
  },
  scrollViewContent: {
    flex: 1,
  },
});

export default ContractLogsAllScreen;
