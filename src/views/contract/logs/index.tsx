import React, { FC, useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import ComLayoutHead from '../../../components/layout/head';
import { themeWhite } from '../../../config/theme';
import ComFormButton from '../../../components/form/button';
import ComLine from '../../../components/line';
import { ComContractIndexListGeneralLog, ComContractIndexListHistory, ComContractIndexListOrderLog } from './list';
import { TypeGeneralEntrustemntLog, TypeHistoryLog } from '../_index/type';
import ajax from '../../../data/fetch';
import { TypeStopOrderLog } from '../index/type';

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
    { name: '止盈止损', id: 2 },
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
  const [orderData, setOrderData] = useState<TypeStopOrderLog[]>([]);
  // 不同记录的页数
  const [pageList, setPageList] = useState<[number, number, number]>([1, 1, 1]);
  const [canLoad, setCanLoad] = useState<[boolean, boolean, boolean]>([true, true, true]);

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y; //滑动距离
    const contentSizeHeight = event.nativeEvent.contentSize.height; //scrollView contentSize高度
    const oriageScrollHeight = event.nativeEvent.layoutMeasurement.height; //scrollView高度
    if (offsetY + oriageScrollHeight >= contentSizeHeight) {
      if (canLoad[selectStatus]) {
        setPageList(state => {
          const result: typeof pageList = [...state];
          result[selectStatus]++;
          return result;
        });
      }
    } else if (offsetY + oriageScrollHeight <= 1) {
      //这个是没有数据了然后给了false  得时候还在往上拉
    } else if (offsetY === 0) {
      //这个地方是下拉刷新，意思是到顶了还在指行，可以在这个地方进行处理需要刷新得数据
    }
  };

  // 获取止盈止损
  const getWillOrder = (page: number, coin: string) => {
    setCanLoad(state => [
      state[0],
      state[1],
      false,
    ]);
    ajax.get(`/contract/api/v2/order/profitLossLog?symbol=${coin.replace('USDT', '')}&page=${page}`).then(data => {
      if (data.status === 200 && data.data) {
        if (data?.data.length) {
          setCanLoad(state => [
            state[0],
            state[1],
            true,
          ]);
        }
        const result: TypeStopOrderLog[] = data.data.map((item: any) => {
          return {
            id: item.id,
            type: item.direction === '平多' ? 1 : 0,
            coinType: route.params.coin,
            leverType: '--',
            startPrice: item.price,
            isSuccess: item.status === '2',
            doPrice: item.price_action,
            stopType: item.type === '止盈' ? 1 : 0,
            orderType: 0,
            startTime: item.create_time,
            doTime: '--',
          };
        });
        setOrderData(state => (
          [...state].concat(result)
        ));
      }
    }).catch(err => {
      console.log(err);
    });
  };
  // 获取历史委托
  const getHistoryOrder = (page: number, coin: string) => {
    setCanLoad(state => [
      state[0],
      false,
      state[2],
    ]);
    ajax.get(`/contract/api/v1/bian/dealorder_log?symbol=${coin.replace('USDT', '')}&page=${page}`).then(data => {
      if (data.status === 200) {
        if (data?.data.length) {
          setCanLoad(state => [
            state[0],
            true,
            state[2],
          ]);
        }
        setHistoryLogsData(state => (
          [...state].concat(data?.data?.map((item: any) => ({
            id: item.id,
            // eslint-disable-next-line no-nested-ternary
            type: item.direction - 1,
            coinType,
            successPrice: item.price,
            successNumber: item.num,
            successTime: item.update_time || item.create_time,
            serviceFee: item.fee,
            changeValue: item.profit,
          })) || [])
        ));
      }
    }).catch(err => {
      console.log(err);
    });
  };

  // 获取普通委托
  const getNowOrder = (page: number, coin: string) => {
    setCanLoad(state => [
      false,
      state[1],
      state[2],
    ]);
    ajax.get(`/contract/api/v1/bian/allorder_log?symbol=${coin.replace('USDT', '')}&page=${page}`).then(data => {
      if (data.status === 200) {
        if (data?.data.length) {
          setCanLoad(state => [
            true,
            state[1],
            state[2],
          ]);
        }
        setGeneralEntrustementData(state => (
          [...state].concat(data?.data?.map((item: any) => ({
            id: item.id,
            // eslint-disable-next-line no-nested-ternary
            type: item.type === '1' ? (item.sell_buy === '1' ? 1 : 2) : (item.sell_buy === '1' ? 3 : 0),
            coinType,
            leverType: item.lever,
            willPrice: item.price || '市价',
            needNumber: item.coin_num,
            successNumber: item.deal_coin_num,
            status: item.status - 1,
            startTime: item.create_time,
            stopTime: item.back_time === '' ? item.create_time : item.back_time,
            changeValue: item.profit_per,
            orderType: item.price_type - 1,
          })) || [])
        ));
      }
    }).catch(err => {
      console.log(err);
    });
  };

  useEffect(() => {
    if (selectStatus === 0 && canLoad[0]) {
      getNowOrder(pageList[0], route.params.coin);
    } else if (selectStatus === 1 && canLoad[1]) {
      getHistoryOrder(pageList[1], route.params.coin);
    } else if (selectStatus === 2 && canLoad[2]) {
      getWillOrder(pageList[2], route.params.coin);
    }
  }, [route.params.coin, selectStatus, pageList]);

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
          <ScrollView onMomentumScrollEnd={onMomentumScrollEnd} style={style.scrollViewContent}>
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
          <ScrollView onMomentumScrollEnd={onMomentumScrollEnd} style={style.scrollViewContent}>
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
          <ScrollView onMomentumScrollEnd={onMomentumScrollEnd} style={style.scrollViewContent}>
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
