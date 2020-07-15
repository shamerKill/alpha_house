import React, { FC, useState, useEffect } from 'react';
import {
  View, Text, Image as StaticImage, StyleSheet, TouchableNativeFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  themeBlack, getThemeOpacity, themeGray, defaultThemeBgColor, themeGreen, themeRed, defaultThemeColor, themeWhite,
} from '../../../config/theme';
import {
  TypePositionData, TypePlanEntrustement, TypeGeneralEntrustemnt, TypeStopOrder,
} from './type';
import showComAlert from '../../../components/modal/alert';
import ajax from '../../../data/fetch';


// 持仓列表视图
const ComContractIndexListPosition: FC<{data: TypePositionData}> = ({ data }) => {
  const navigation = useNavigation();

  // 盈亏颜色
  const color = parseFloat(data.profitRatio) < 0 ? themeRed : themeGreen;

  const addEvent = {
    // 止盈止损弹窗
    stopAlert: () => {
      return new Promise(resolve => {
        const close = showComAlert({
          title: '温馨提示',
          desc: '止盈止损触发后将按照设定的方式和价格向市场进行委托，成交价格受市场深度影响。满足触发条件时将立即触发，请在知晓风险的情况下使用。',
          success: {
            text: '知道了',
            onPress: () => {
              close();
              resolve();
            },
          },
          close: {
            text: '不再提示',
            onPress: () => {
              close();
              resolve();
            },
          },
        });
      });
    },
    // 止盈
    stopWin: async () => {
      await addEvent.stopAlert();
      navigation.navigate('ContractOrderClose', { id: data.id });
    },
    // 止损
    stopLow: async () => {
      await addEvent.stopAlert();
      navigation.navigate('ContractOrderClose', { id: data.id });
    },
    // 平仓
    closeOrder: () => {
    },
  };
  return (
    <View style={style.listView}>
      {/* 头部 */}
      <View style={style.listTop}>
        <Text style={[
          style.listTitle,
          {
            color: [themeRed, themeGreen][data.type],
          },
        ]}>
          {data.type === 0 ? '开空' : '开多'}
          &nbsp;&nbsp;
          {data.coinType}
          &nbsp;&nbsp;
          {data.leverType}X
        </Text>
      </View>
      {/* 中部 */}
      <View style={style.listCenter}>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerLeft,
        ]}>
          <Text style={style.listCenterValue}>{data.price}</Text>
          <Text style={style.listCenterDesc}>持仓均价</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerCenter,
        ]}>
          <Text style={[
            style.listCenterValue,
            { color },
          ]}>
            {data.profitValue}
          </Text>
          <Text style={style.listCenterDesc}>未实现盈亏</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerRight,
        ]}>
          <Text style={[
            style.listCenterValue,
            { color },
          ]}>
            {data.profitRatio}
          </Text>
          <Text style={style.listCenterDesc}>收益率</Text>
        </View>
      </View>
      {/* 详情 */}
      <View style={style.listInfo}>
        <Text style={style.listInfoText}>总仓&nbsp;{data.allValue}</Text>
        <Text style={style.listInfoText}>占用保证金&nbsp;{data.useBond}</Text>
        <Text style={style.listInfoText}>预估强评价&nbsp;{data.willBoomPrice}</Text>
        <Text style={style.listInfoText}>维持保证金率&nbsp;{data.useBondRatio}</Text>
      </View>
      {/* 按钮 */}
      <View style={style.listBtns}>
        {/* <TouchableNativeFeedback onPress={() => addEvent.stopWin()}>
          <View style={style.listBtn}>
            <Text style={style.listBtnText}>止盈</Text>
          </View>
        </TouchableNativeFeedback>
        <View style={style.listBtnsLine} />
        <TouchableNativeFeedback onPress={() => addEvent.stopLow()}>
          <View style={style.listBtn}>
            <Text style={style.listBtnText}>止损</Text>
          </View>
        </TouchableNativeFeedback> */}
        <View style={style.listBtnsLine} />
        <TouchableNativeFeedback onPress={() => addEvent.closeOrder()}>
          <View style={style.listBtn}>
            <Text style={style.listBtnText}>平仓</Text>
          </View>
        </TouchableNativeFeedback>
      </View>
    </View>
  );
};

// 普通委托
export const ComContractIndexListGeneral: FC<{data: TypeGeneralEntrustemnt}> = ({ data }) => {
  const navigation = useNavigation();
  const addEvent = {
    // 撤销订单
    backOrder: () => {
      const close = showComAlert({
        desc: '确定撤销此委托单么？',
        success: {
          text: '确定',
          onPress: () => {
            close();
          },
        },
        close: {
          text: '取消',
          onPress: () => {
            close();
          },
        },
      });
    },
    // 预设止盈止损
    willStopOrder: () => {
      const close = showComAlert({
        title: '温馨提示',
        desc: (<Text style={{ lineHeight: 20 }}>预设止盈止损并非实际存在的止盈止损单，需委托成交后才可发起。因行情变动剧烈，预设单不保证预设一定生效。下单委托成交后，默认将按照您的实际成交数量全部挂上止盈止损单。如您撤销挂单委托，预设止盈止损单将同时失效。</Text>),
        success: {
          text: '知道了',
          onPress: () => {
            close();
            navigation.navigate('ContractWillClose', { id: data.id });
          },
        },
        close: {
          text: '不再提示',
          onPress: () => {
            close();
            navigation.navigate('ContractWillClose', { id: data.id });
          },
        },
      });
    },
  };
  return (
    <View style={style.listView}>
      {/* 头部 */}
      <View style={style.listTop}>
        <Text style={[
          style.listTitle,
          {
            color: [themeRed, themeGreen][data.type],
          },
        ]}>
          {
            ['开空', '开多', '平空', '平多'][data.type]
          }
          &nbsp;&nbsp;
          {data.coinType}
          &nbsp;&nbsp;
          {data.leverType}X
        </Text>
        <Text style={style.listTopTime}>{data.time}</Text>
      </View>
      {/* 中部 */}
      <View style={style.listCenter}>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerLeft,
        ]}>
          <Text style={style.listCenterValue}>{data.willNumber}</Text>
          <Text style={style.listCenterDesc}>委托量</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerCenter,
        ]}>
          <Text style={[style.listCenterValue]}>
            {data.willPrice}
          </Text>
          <Text style={style.listCenterDesc}>委托价格</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerRight,
        ]}>
          <Text style={[style.listCenterValue]}>
            {data.haveNumber}
          </Text>
          <Text style={style.listCenterDesc}>已成交</Text>
        </View>
      </View>
      {/* 详情 */}
      <View style={style.listInfo}>
        <Text style={style.listInfoText}>可撤&nbsp;{data.backValue}</Text>
        <Text style={style.listInfoText}>状态&nbsp;{['未成交', '部分成交'][data.state]}</Text>
        {/* <Text style={style.listInfoText}>止盈触发价&nbsp;{data.winStartPrice}</Text>
        <Text style={style.listInfoText}>止盈执行价&nbsp;{data.winDoPrice}</Text>
        <Text style={style.listInfoText}>止损触发价&nbsp;{data.lowStartPrice}</Text>
        <Text style={style.listInfoText}>止损执行价&nbsp;{data.lowDoPrice}</Text> */}
      </View>
      {/* 按钮 */}
      <View style={style.listBtns}>
        {/* <TouchableNativeFeedback onPress={() => addEvent.backOrder()}>
          <View style={style.listBtn}>
            <Text style={style.listBtnText}>撤销</Text>
          </View>
        </TouchableNativeFeedback> */}
        <View style={style.listBtnsLine} />
        <TouchableNativeFeedback onPress={() => addEvent.willStopOrder()}>
          <View style={style.listBtn}>
            <Text style={style.listBtnText}>预设止盈止损</Text>
          </View>
        </TouchableNativeFeedback>
      </View>
    </View>
  );
};

// 计划委托
export const ComContractIndexListPlan: FC<{data: TypePlanEntrustement}> = ({ data }) => {
  return (
    <View style={style.listView}>
      {/* 头部 */}
      <View style={style.listTop}>
        <Text style={[
          style.listTitle,
          {
            color: [themeRed, themeGreen][data.type],
          },
        ]}>
          {data.type === 0 ? '开空' : '开多'}
          &nbsp;&nbsp;
          {data.coinType}
          &nbsp;&nbsp;
          {data.leverType}X
        </Text>
        <TouchableNativeFeedback>
          <View style={style.listTopRight}>
            <Text style={style.listTopRightText}>撤销</Text>
          </View>
        </TouchableNativeFeedback>
      </View>
      {/* 中部 */}
      <View style={style.listCenter}>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerLeft,
        ]}>
          <Text style={style.listCenterValue}>{data.startPrice}</Text>
          <Text style={style.listCenterDesc}>触发价格</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerCenter,
        ]}>
          <Text style={[style.listCenterValue]}>
            {data.doPrice}
          </Text>
          <Text style={style.listCenterDesc}>执行价格</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerRight,
        ]}>
          <Text style={[style.listCenterValue]}>
            {data.number}
          </Text>
          <Text style={style.listCenterDesc}>数量</Text>
        </View>
      </View>
      {/* 详情 */}
      <View style={style.listInfo}>
        <Text style={style.listInfoText}>方式&nbsp;{['限价', '市价'][data.doPriceType]}</Text>
        <Text style={style.listInfoText}>状态&nbsp;{['未触发', '已触发'][data.state]}</Text>
        <Text style={[style.listInfoText, { width: '100%' }]}>委托时间&nbsp;{data.sendTime}</Text>
        <Text style={[style.listInfoText, { width: '100%' }]}>触发时间&nbsp;{data.doTime}</Text>
      </View>
    </View>
  );
};

// 止盈止损
export const ComContractIndexListOrder: FC<{data: TypeStopOrder}> = ({ data }) => {
  return (
    <View style={style.listView}>
      {/* 头部 */}
      <View style={[style.listTop, { justifyContent: 'flex-start' }]}>
        <Text style={[
          style.listTitle,
          {
            color: [themeRed, themeGreen][data.type],
          },
        ]}>
          {data.type === 0 ? '开空' : '开多'}
          &nbsp;&nbsp;
          {data.coinType}
          &nbsp;&nbsp;
          {data.leverType}X
        </Text>
        <Text style={style.listTitleDesc}>{['未触发', '触发'][data.state]}</Text>
      </View>
      {/* 中部 */}
      <View style={style.listCenter}>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerLeft,
        ]}>
          <Text style={style.listCenterValue}>{data.startPrice}</Text>
          <Text style={style.listCenterDesc}>触发价格</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerCenter,
        ]}>
          <Text style={[style.listCenterValue]}>
            {data.doPrice}
          </Text>
          <Text style={style.listCenterDesc}>执行价格</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerRight,
        ]}>
          <Text style={[style.listCenterValue, { color: [themeRed, themeGreen][data.stopType] }]}>
            {['止损', '止盈'][data.stopType]}
          </Text>
          <Text style={style.listCenterDesc}>盈损</Text>
        </View>
      </View>
      {/* 详情 */}
      <View style={style.listInfo}>
        <Text style={style.listInfoText}>方式&nbsp;{['限价', '市价'][data.doPriceType]}</Text>
        <Text style={style.listInfoText}>状态&nbsp;{['未触发', '已触发'][data.state]}</Text>
        <Text style={[style.listInfoText, { width: '100%' }]}>委托时间&nbsp;{data.sendTime}</Text>
        <Text style={[style.listInfoText, { width: '100%' }]}>触发时间&nbsp;{data.doTime}</Text>
      </View>
      {/* 按钮 */}
      <View style={style.listBtns}>
        <TouchableNativeFeedback>
          <View style={style.listBtn}>
            <Text style={style.listBtnText}>修改</Text>
          </View>
        </TouchableNativeFeedback>
        <View style={style.listBtnsLine} />
        <TouchableNativeFeedback>
          <View style={style.listBtn}>
            <Text style={style.listBtnText}>撤销</Text>
          </View>
        </TouchableNativeFeedback>
      </View>
    </View>
  );
};

const ComContractIndexBottom: FC<{coinType: string; selectType: 0|1|2; leverType: string;}> = ({
  coinType,
  leverType,
  // selectType,
}) => {
  const navigation = useNavigation();
  //  '计划委托', '止盈止损',
  const tabDataArr = [
    '持仓', '普通委托',
  ];
  useEffect(() => {
    console.log(leverType);
  }, []);

  // 选项卡的第几个
  const [selectTab, setSelectTab] = useState(0);
  // 持仓数据
  const [positionData, setPositionData] = useState<TypePositionData[]>([]);
  // 普通委托数据
  const [generalEntrustementData, setGeneralEntrustementData] = useState<TypeGeneralEntrustemnt[]>([]);
  // 计划委托数据
  const [planementData, setPlanementData] = useState<TypePlanEntrustement[]>([]);
  // 止盈止损数据类型
  const [orderData, setOrderData] = useState<TypeStopOrder[]>([]);

  // 获取持仓单
  useEffect(() => {
    if (selectTab === 0) {
      ajax.get(`/v1/bian/holdhourse_log?symbol=${coinType.split('/')[0]}`).then(data => {
        if (data.status === 200) {
          setPositionData(data?.data?.map((item: any, index: number) => ({
            id: index,
            type: Number(item.type === '2') as TypePositionData['type'],
            coinType,
            leverType: item.lever,
            price: item.price,
            // TODO:没有未实现盈亏
            profitValue: '-0.78',
            // TODO:没有收益率
            profitRatio: '-21.23%',
            allValue: item.num,
            useBond: item.ensure_num,
            // TODO:没有强平价
            willBoomPrice: '12.31',
            // TODO:没有保证金率
            useBondRatio: '0.50%',
          })) || []);
        }
      }).catch(err => {
        console.log(err);
      });
    } else if (selectTab === 1) {
      ajax.get(`/v1/bian/entrust_log?symbol=${coinType.split('/')[0]}`).then(data => {
        if (data.status === 200) {
          setGeneralEntrustementData(data?.data?.map((item: any) => ({
            id: item.binance_id,
            // eslint-disable-next-line no-nested-ternary
            type: item.type === '1' ? (item.sell_buy === '1' ? 1 : 4) : (item.sell_buy === '1' ? 3 : 2),
            coinType,
            leverType: item.lever,
            willNumber: item.num,
            willPrice: item.price,
            haveNumber: item.deal_num,
            backValue: item.surplus_num,
            state: Number(item.status === '8'),
            time: item.create_time,
          })) || []);
        }
      }).catch(err => {
        console.log(err);
      });
    }
  }, [selectTab, coinType]);

  useEffect(() => {
    setPlanementData([
      {
        id: 1,
        type: 0 as TypePlanEntrustement['type'],
        coinType: 'BTC/USDT',
        leverType: '20',
        startPrice: '9512.32',
        doPrice: '9512.32',
        number: 11,
        doPriceType: 0 as TypePlanEntrustement['doPriceType'],
        state: 0 as TypePlanEntrustement['state'],
        sendTime: '2019/12/14 08:12:12',
        doTime: '2019/12/14 08:12:12',
      },
      {
        id: 2,
        type: 1 as TypePlanEntrustement['type'],
        coinType: 'BTC/USDT',
        leverType: '20',
        startPrice: '9512.32',
        doPrice: '9512.32',
        number: 11,
        doPriceType: 0 as TypePlanEntrustement['doPriceType'],
        state: 0 as TypePlanEntrustement['state'],
        sendTime: '2019/12/14 08:12:12',
        doTime: '2019/12/14 08:12:12',
      },
    ]);
    setOrderData([
      {
        id: 1,
        type: 0 as TypePlanEntrustement['type'],
        coinType: 'BTC/USDT',
        leverType: '20',
        startPrice: '9512.32',
        doPrice: '9512.32',
        stopType: 0 as TypeStopOrder['stopType'],
        state: 0 as TypeStopOrder['state'],
        doPriceType: 0 as TypeStopOrder['doPriceType'],
        sendTime: '2019/12/14 08:12:12',
        doTime: '2019/12/14 08:12:12',
      },
      {
        id: 2,
        type: 1 as TypePlanEntrustement['type'],
        coinType: 'BTC/USDT',
        leverType: '20',
        startPrice: '9512.32',
        doPrice: '9512.32',
        stopType: 1 as TypeStopOrder['stopType'],
        state: 1 as TypeStopOrder['state'],
        doPriceType: 1 as TypeStopOrder['doPriceType'],
        sendTime: '2019/12/14 08:12:12',
        doTime: '2019/12/14 08:12:12',
      },
    ]);
  }, []);

  return (
    <View>
      {/* 选项卡 */}
      <View style={style.tabView}>
        <View style={style.tabViewLeft}>
          {
            tabDataArr.map((item, index) => (
              <TouchableNativeFeedback
                key={index}
                onPress={() => setSelectTab(index)}>
                <View style={style.tabViewBtn}>
                  <Text style={[
                    style.tabViewBtnText,
                    selectTab === index && { color: themeBlack, fontWeight: 'bold' },
                  ]}>
                    {item}
                  </Text>
                </View>
              </TouchableNativeFeedback>
            ))
          }
        </View>
        <TouchableNativeFeedback onPress={() => navigation.navigate('ContractLogs', { coin: coinType })}>
          <View style={style.tabViewRight}>
            <StaticImage
              resizeMode="contain"
              style={style.tabViewRightImage}
              source={require('../../../assets/images/icons/contract_list_log.png')} />
            <Text style={style.tabViewRightText}>全部</Text>
          </View>
        </TouchableNativeFeedback>
      </View>
      {/* 列表 */}
      {/* 持仓 */}
      {
        selectTab === 0
        && (
          positionData.map(item => (
            <ComContractIndexListPosition
              key={item.id}
              data={item} />
          ))
        )
      }
      {/* 普通委托 */}
      {
        selectTab === 1
        && (
          generalEntrustementData.map(item => (
            <ComContractIndexListGeneral
              key={item.id}
              data={item} />
          ))
        )
      }
      {/* 计划委托 */}
      {
        selectTab === 2
        && (
          planementData.map(item => (
            <ComContractIndexListPlan
              key={item.id}
              data={item} />
          ))
        )
      }
      {/* 止盈止损 */}
      {
        selectTab === 3
        && (
          orderData.map(item => (
            <ComContractIndexListOrder
              key={item.id}
              data={item} />
          ))
        )
      }
    </View>
  );
};

const style = StyleSheet.create({
  tabView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: defaultThemeBgColor,
  },
  tabViewLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  tabViewBtn: {
    height: 44,
    padding: 8,
    justifyContent: 'center',
  },
  tabViewBtnText: {
    color: getThemeOpacity(themeBlack, 0.5),
  },
  tabViewRight: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  tabViewRightImage: {
    width: 14,
    height: 14,
  },
  tabViewRightText: {
    color: themeGray,
    paddingLeft: 5,
  },
  // 列表视图
  listView: {
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 10,
    borderBottomColor: defaultThemeBgColor,
    backgroundColor: themeWhite,
  },
  listTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: defaultThemeBgColor,
    alignItems: 'center',
  },
  listTopRight: {
    padding: 10,
    marginRight: -10,
  },
  listTopRightText: {
    color: defaultThemeColor,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingTop: 10,
    paddingBottom: 10,
  },
  listTitleDesc: {
    fontSize: 12,
    fontWeight: '400',
    color: defaultThemeColor,
    backgroundColor: getThemeOpacity(defaultThemeColor, 0.2),
    borderRadius: 2,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 15,
    paddingRight: 15,
    marginLeft: 10,
  },
  listTopTime: {
    fontSize: 12,
    color: themeGray,
  },
  listCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: defaultThemeBgColor,
  },
  listCenterInner: {
    flex: 1,
  },
  listCenterInnerLeft: {},
  listCenterInnerCenter: {
    alignItems: 'center',
  },
  listCenterInnerRight: {
    alignItems: 'flex-end',
  },
  listCenterValue: {
    fontWeight: 'bold',
    paddingBottom: 3,
  },
  listCenterDesc: {
    fontSize: 12,
    color: themeGray,
  },
  listInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: defaultThemeBgColor,
  },
  listInfoText: {
    width: '50%',
    paddingBottom: 5,
    fontSize: 11,
    color: getThemeOpacity(themeBlack, 0.6),
  },
  listBtns: {
    flexDirection: 'row',
  },
  listBtnsLine: {
    height: 20,
    width: 1,
    backgroundColor: defaultThemeBgColor,
    marginTop: 10,
  },
  listBtn: {
    height: 40,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listBtnText: {
    color: defaultThemeColor,
  },
});

export default ComContractIndexBottom;
