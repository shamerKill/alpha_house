import React, { FC } from 'react';
import {
  View, Text, StyleSheet,
} from 'react-native';
import {
  themeBlack, getThemeOpacity, themeGray, defaultThemeBgColor, themeGreen, themeRed, defaultThemeColor, themeWhite,
} from '../../../config/theme';
import {
  TypePlanEntrustementLog, TypeGeneralEntrustemntLog, TypeStopOrderLog, TypeHistoryLog,
} from '../index/type';

// 普通委托
export const ComContractIndexListGeneralLog: FC<{data: TypeGeneralEntrustemntLog}> = ({ data }) => {
  const typeNumber = Number(data.status === 1);
  return (
    <View style={style.listView}>
      {/* 头部 */}
      <View style={style.listTop}>
        <Text style={[
          style.listTitle,
          {
            color: [themeRed, themeGreen, themeRed, themeGreen][data.type],
          },
        ]}>
          {['开空', '开多', '平多', '平空'][data.type]}
          &nbsp;&nbsp;
          {data.coinType}
          &nbsp;&nbsp;
          {data.leverType}X
        </Text>
        <Text style={[
          style.listTopTime,
          typeNumber === 1 && { color: themeGreen },
        ]}>
          {['委托中', '已成交', '失败', '已撤销', '停止', '拒绝', '失效', '部分成交', '爆仓强平', '爆仓强平'][typeNumber]}
        </Text>
      </View>
      {/* 中部 */}
      <View style={style.listCenter}>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerLeft,
        ]}>
          <Text style={style.listCenterValue}>{data.willPrice}</Text>
          <Text style={style.listCenterDesc}>委托价格</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerCenter,
        ]}>
          <Text style={[style.listCenterValue]}>
            {[data.needNumber, data.successNumber][typeNumber]}
          </Text>
          <Text style={style.listCenterDesc}>委托量</Text>
        </View>
        {/* <View style={[
          style.listCenterInner,
          style.listCenterInnerRight,
        ]}>
          <Text style={[
            style.listCenterValue,
            data.isSuccess && { color: parseFloat(data.changeValue) > 0 ? themeGreen : themeRed },
          ]}>
            {[data.successNumber, data.changeValue][typeNumber]}
          </Text>
          <Text style={style.listCenterDesc}>{['成交量', '盈亏'][typeNumber]}</Text>
        </View> */}
      </View>
      {/* 详情 */}
      <View style={style.listInfo}>
        {/* { data.isSuccess && <Text style={[style.listInfoText, { width: '100%' }]}>手续费&nbsp;{data.serviceFee}</Text> } */}
        <Text style={[style.listInfoText, { width: '100%' }]}>方式&nbsp;{['限价委托', '市价委托', '计划委托', '爆仓强平'][data.orderType]}</Text>
        { typeNumber === 1 && <Text style={[style.listInfoText, { width: '100%' }]}>成交时间&nbsp;{data.stopTime}</Text> }
        { !(typeNumber === 1) && <Text style={[style.listInfoText, { width: '100%' }]}>委托时间&nbsp;{data.startTime}</Text> }
        { !(typeNumber === 1) && <Text style={[style.listInfoText, { width: '100%' }]}>撤销时间&nbsp;{data.stopTime}</Text> }
      </View>
    </View>
  );
};

// 历史记录
export const ComContractIndexListHistory: FC<{data: TypeHistoryLog}> = ({ data }) => {
  return (
    <View style={style.listView}>
      {/* 头部 */}
      <View style={style.listTop}>
        <Text style={[
          style.listTitle,
          {
            color: [themeGreen, themeRed][data.type],
          },
        ]}>
          {['买入', '卖出'][data.type]}
          &nbsp;&nbsp;
          {data.coinType}
        </Text>
        <Text style={[
          style.listTopTime,
          { color: themeGreen },
        ]}>
          已成交
        </Text>
      </View>
      {/* 中部 */}
      <View style={style.listCenter}>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerLeft,
        ]}>
          <Text style={style.listCenterValue}>{data.successPrice}</Text>
          <Text style={style.listCenterDesc}>成交价格</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerCenter,
        ]}>
          <Text style={[style.listCenterValue]}>
            {data.successNumber}
          </Text>
          <Text style={style.listCenterDesc}>成交量</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerRight,
        ]}>
          <Text style={[
            style.listCenterValue,
            { color: parseFloat(data.changeValue) >= 0 ? themeGreen : themeRed },
          ]}>
            {data.changeValue}
          </Text>
          <Text style={style.listCenterDesc}>盈亏</Text>
        </View>
      </View>
      {/* 详情 */}
      <View style={style.listInfo}>
        <Text style={[style.listInfoText, { width: '100%' }]}>手续费&nbsp;{data.serviceFee}</Text>
        <Text style={[style.listInfoText, { width: '100%' }]}>成交时间&nbsp;{data.successTime}</Text>
      </View>
    </View>
  );
};

// 计划委托
export const ComContractIndexListPlanLog: FC<{data: TypePlanEntrustementLog}> = ({ data }) => {
  const typeNumber = Number(data.isSuccess);
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
        <Text style={[
          style.listTopTime,
          data.isSuccess && { color: themeGreen },
        ]}>
          {['已撤销', '已触发'][typeNumber]}
        </Text>
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
        <Text style={style.listInfoText}>方式&nbsp;{['限价', '市价'][data.orderType]}</Text>
        <Text style={[style.listInfoText, { width: '100%' }]}>设置时间&nbsp;{data.startTime}</Text>
        <Text style={[style.listInfoText, { width: '100%' }]}>{['撤销', '执行'][typeNumber]}时间&nbsp;{data.stopTime}</Text>
      </View>
    </View>
  );
};

// 止盈止损
export const ComContractIndexListOrderLog: FC<{data: TypeStopOrderLog}> = ({ data }) => {
  const typeNumber = Number(data.isSuccess);
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
        <Text style={[
          style.listTopTime,
          data.isSuccess && { color: themeGreen },
        ]}>
          {['已撤销', '已触发'][typeNumber]}
        </Text>
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
            {data.isSuccess ? data.doPrice : ([data.doPrice, '市价'][data.orderType])}
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
        <Text style={style.listInfoText}>方式&nbsp;{['限价', '市价'][data.orderType]}</Text>
        <Text style={style.listInfoText}>数量&nbsp;{data.number}</Text>
        <Text style={[style.listInfoText, { width: '100%' }]}>设置时间&nbsp;{data.startTime}</Text>
        <Text style={[style.listInfoText, { width: '100%' }]}>{['撤销', '执行'][typeNumber]}时间&nbsp;{data.stopTime}</Text>
      </View>
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
    fontSize: 16,
    fontWeight: 'bold',
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
