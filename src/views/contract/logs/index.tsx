import React, { FC, useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import ComLayoutHead from '../../../components/layout/head';
import { themeWhite } from '../../../config/theme';
import ComFormButton from '../../../components/form/button';
import ComLine from '../../../components/line';
import { ComContractIndexListGeneralLog, ComContractIndexListHistory } from './list';
import { TypeGeneralEntrustemntLog, TypeHistoryLog } from '../index/type';
import ajax from '../../../data/fetch';

const ContractLogsAllScreen: FC = () => {
  // const selectArr = [
  //   'BTC/USDT 永续',
  //   'EOS/USDT 永续',
  //   'ETH/USDT 永续',
  //   'BCH/USDT 永续',
  // ];
  const tabList = [
    { name: '普通委托', id: 0 },
    { name: '历史成交', id: 1 },
    // { name: '', id: 2 },
    // { name: '计划委托', id: 1 },
    // { name: '止盈止损', id: 2 },
  ];
  const route = useRoute<RouteProp<{logsIndex: { coin: string }}, 'logsIndex'>>();
  const coinType = route.params.coin;

  // 不同历史记录选择的类型
  // const [selectType, setSelectType] = useState(tabList.map(() => 0));
  // 选择的列表
  const [selectStatus, setSelectStatus] = useState(tabList[0].id);
  // 普通委托列表
  const [generalEntrustementData, setGeneralEntrustementData] = useState<TypeGeneralEntrustemntLog[]>([]);
  // 历史成交记录
  const [historyLogsData, setHistoryLogsData] = useState<TypeHistoryLog[]>([]);
  // 计划委托列表
  // const [planementData, setPlanementData] = useState<TypePlanEntrustementLog[]>([]);
  // 止盈止损列表
  // const [orderData, setOrderData] = useState<TypeStopOrderLog[]>([]);

  // const addEvent = {
  //   selectType: () => {
  //     const close = showSelector({
  //       title: '全部类型',
  //       data: selectArr,
  //       selected: selectArr[selectType[selectStatus]],
  //       onPress: (value) => {
  //         if (typeof value !== 'string') return;
  //         const selectIndex = selectArr.indexOf(value);
  //         if (selectArr.indexOf(value) === selectType[selectStatus]) return;
  //         setSelectType(state => state.map((item, index) => (index === selectStatus ? selectIndex : item)));
  //         close();
  //       },
  //     });
  //   },
  // };

  useEffect(() => {
    ajax.get(`/v1/bian/dealorder_log?symbol=${coinType.split('/')[0]}`).then(data => {
      if (data.status === 200) {
        setHistoryLogsData(data?.data?.map((item: any) => ({
          id: item.binance_id,
          // eslint-disable-next-line no-nested-ternary
          type: item.direction - 1,
          coinType,
          successPrice: item.price,
          successNumber: item.hands,
          successTime: item.update_time,
          serviceFee: item.fee,
          changeValue: item.profit,
        })) || []);
      }
    }).catch(err => {
      console.log(err);
    });
    ajax.get(`/v1/bian/allorder_log?symbol=${coinType.split('/')[0]}`).then(data => {
      if (data.status === 200) {
        setGeneralEntrustementData(data?.data?.map((item: any) => ({
          id: item.binance_id,
          // eslint-disable-next-line no-nested-ternary
          type: item.type === '1' ? (item.sell_buy === '1' ? 0 : 3) : (item.sell_buy === '1' ? 2 : 1),
          coinType,
          leverType: item.lever,
          willPrice: item.price || '市价',
          needNumber: item.hands,
          successNumber: item.deal_num,
          status: item.status - 1,
          startTime: item.create_time,
          stopTime: item.back_time || item.update_time,
          changeValue: item.profit_per,
          orderType: item.price_type - 1,
        })) || []);
      }
    }).catch(err => {
      console.log(err);
    });
  }, [route.params.coin]);

  return (
    <ComLayoutHead
      title="历史记录"
      overScroll>
      {/* // rightComponent={(
      //   <TouchableNativeFeedback onPress={() => addEvent.selectType()}>
      //     <Text style={{ color: defaultThemeColor, fontSize: 15 }}>选择类型</Text>
      //   </TouchableNativeFeedback>
      // )} */}
      <View style={style.topTabView}>
        {
          tabList.map(item => (
            <ComFormButton
              key={item.id}
              title={item.name}
              containerStyle={style.topTabBtn}
              fontStyle={{ fontSize: 16 }}
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
              historyLogsData.map(item => (
                <ComContractIndexListHistory
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
              // orderData.map(item => (
              //   <ComContractIndexListOrderLog
              //     key={item.id}
              //     data={item} />
              // ))
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
    // justifyContent: 'space-between',
  },
  topTabBtn: {
    width: '30%',
    marginRight: 10,
  },
  scrollViewContent: {
    flex: 1,
  },
});

export default ContractLogsAllScreen;
