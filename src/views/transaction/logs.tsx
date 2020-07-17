import React, { FC, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableNativeFeedback,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import {
  defaultThemeBgColor, themeGray, themeBlack, getThemeOpacity, themeGreen, themeRed,
} from '../../config/theme';
import ComFormButton from '../../components/form/button';
import showComAlert from '../../components/modal/alert';
import ajax from '../../data/fetch';
import useGetDispatch from '../../data/redux/dispatch';
import { InState } from '../../data/redux/state';

type TypeLogsData = {
  type: 0|1; // 买入0，卖出1
  time: string; // 时间
  id: string|number;
  willPrice: string; // 委托价格
  willNumber: string; // 委托数量
  doPrice: string; // 成交均价
  doNumber: string; // 成交数量
  priceUnit: string; // 价格单位
  numberUnit: string; // 数量单位
  orderType: 0|1|2|3; // 订单类型未成交0|完全成交1|部分成交2｜已撤销3
};

const ComTranscationLogView: FC<TypeLogsData> = ({
  type,
  time,
  id,
  willPrice,
  willNumber,
  doPrice,
  doNumber,
  priceUnit,
  numberUnit,
  orderType,
}) => {
  const addEvent = {
    backOrder: () => {
      // 撤销订单
      const close = showComAlert({
        title: '撤销提示',
        desc: '是否撤销当前未成交委托?',
        success: {
          text: '仍要撤销',
          onPress: () => {
            addEvent.submit();
            close();
          },
        },
        close: {
          text: '取消撤销',
          onPress: () => close(),
        },
      });
    },
    submit: () => {
      ajax.post('/v1/currency/revoke', { id }).then(data => {
        if (data.status === 200) {
          showMessage({
            position: 'bottom',
            message: '撤销成功',
            type: 'success',
          });
          ComTranscationView.prototype.getData();
        } else {
          showMessage({
            position: 'bottom',
            message: data.message,
            type: 'warning',
          });
        }
      }).catch(err => {
        console.log(err);
      });
    },
  };
  return (
    <View style={style.logsViewList}>
      {/* 顶部 */}
      <View style={style.logsHeadView}>
        <Text style={[
          style.logsHeadType,
          { color: [themeGreen, themeRed][type] },
        ]}>
          {['买入', '卖出'][type]}
        </Text>
        <Text style={style.logsHeadTime}>{time}</Text>
        <View style={style.logsHeadMore}>
          {
            orderType === 0
              ? (
                <ComFormButton
                  containerStyle={style.logsHeadMoreBtn}
                  fontStyle={style.logsHeadMoreBtnText}
                  onPress={addEvent.backOrder}
                  title="撤销" />
              )
              : (
                <Text style={style.logsHeadMoreText}>
                  { ['', '完全成交', '部分成交', '已撤销'][orderType] }
                </Text>
              )
          }
        </View>
      </View>
      {/* 数据显示 */}
      <View style={style.logsContent}>
        <View style={style.logsListView}>
          <Text style={style.logsListValue}>{willPrice}</Text>
          <Text style={style.logsListDesc}>委托价格{priceUnit}</Text>
        </View>
        <View style={style.logsListView}>
          <Text style={style.logsListValue}>{willNumber}</Text>
          <Text style={style.logsListDesc}>委托数量{numberUnit}</Text>
        </View>
        <View style={style.logsListView}>
          <Text style={style.logsListValue}>{doPrice}</Text>
          <Text style={style.logsListDesc}>成交均价{priceUnit}</Text>
        </View>
        <View style={style.logsListView}>
          <Text style={style.logsListValue}>{doNumber}</Text>
          <Text style={style.logsListDesc}>成交数量{numberUnit}</Text>
        </View>
      </View>
    </View>
  );
};

const ComTranscationView: FC<{coinType: string}> = ({
  coinType,
}) => {
  const [routePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');
  // 显示数据类型未成交委托0，历史委托1
  const [listType, setListType] = useState<0|1>(0);
  // 未成交委托
  const [noDoList, setNoDoList] = useState<TypeLogsData[]>([]);
  // 历史委托
  const [logsList, setLogsList] = useState<TypeLogsData[]>([]);

  const addEvent = {
    // 更改列表类型
    changeListType: (type: typeof listType) => {
      if (type !== listType) setListType(type);
    },
    // 获取数据
    getData: () => {
      ajax.post('/v1/currency/currency_info', {
        symbol: coinType.split('/')[0],
        type: listType + 1,
      }).then(data => {
        if (data.status === 200) {
          if (listType === 0) {
            setNoDoList(data?.data?.map((item: any) => {
              return {
                type: item.type - 1,
                time: item.create_time,
                id: item.id,
                willPrice: item.price,
                willNumber: item.entrust_num,
                doPrice: item.price,
                doNumber: item.deal_num,
                priceUnit: item.sell_currency,
                numberUnit: item.buy_currency,
                orderType: [0, 3, 2, 1][item.status - 1],
              };
            }) || []);
          } else {
            setLogsList(data?.data?.map((item: any) => {
              return {
                type: item.type - 1,
                time: item.create_time,
                id: item.id,
                willPrice: item.price,
                willNumber: item.entrust_num,
                doPrice: item.price,
                doNumber: item.deal_num,
                priceUnit: item.sell_currency,
                numberUnit: item.buy_currency,
                orderType: [0, 3, 2, 1][item.status - 1],
              };
            }) || []);
          }
        }
      }).catch(err => {
        console.log(err);
      });
    },
  };

  ComTranscationView.prototype.getData = addEvent.getData;

  useEffect(() => {
    addEvent.getData();
  }, [listType, coinType]);
  useEffect(() => {
    if (routePage === 'Transaction') addEvent.getData();
  }, [routePage]);

  return (
    <View>
      {/* 切换头部 */}
      <View style={style.headView}>
        <TouchableNativeFeedback onPress={() => addEvent.changeListType(0)}>
          <View style={style.headTabView}>
            <Text style={[
              style.headTabText,
              listType === 0 && { color: themeBlack },
            ]}>
              未成交委托
            </Text>
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => addEvent.changeListType(1)}>
          <View style={style.headTabView}>
            <Text style={[
              style.headTabText,
              listType === 1 && { color: themeBlack },
            ]}>
              历史委托
            </Text>
          </View>
        </TouchableNativeFeedback>
      </View>
      {/* 列表 */}
      <View style={style.logsView}>
        {
          [noDoList, logsList][listType].map(item => (
            <ComTranscationLogView key={item.id} {...item} />
          ))
        }
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  headView: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: defaultThemeBgColor,
  },
  headTabView: {
    height: 40,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headTabText: {
    fontWeight: '700',
    fontSize: 16,
    color: themeGray,
  },
  // logs
  logsView: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  logsViewList: {
    borderBottomColor: defaultThemeBgColor,
    borderBottomWidth: 1,
    paddingTop: 10,
    paddingBottom: 10,
  },
  logsHeadView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 10,
  },
  logsHeadType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logsHeadTime: {
    paddingLeft: 10,
    flex: 1,
    color: themeGray,
    fontSize: 12,
  },
  logsHeadMore: {
  },
  logsHeadMoreText: {
    color: getThemeOpacity(themeBlack, 0.6),
    fontSize: 13,
  },
  logsHeadMoreBtn: {
    width: 60,
    height: 26,
    justifyContent: 'center',
  },
  logsHeadMoreBtnText: {
    lineHeight: 20,
    fontSize: 13,
  },
  logsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  logsListView: {
    width: '50%',
    paddingBottom: 5,
  },
  logsListValue: {
    paddingBottom: 2,
    fontSize: 15,
  },
  logsListDesc: {
    color: themeGray,
    fontSize: 12,
  },
});

export default ComTranscationView;
