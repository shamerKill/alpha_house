import React, { FC, useState, useEffect } from 'react';
import {
  View, StyleSheet, Image as StaticImage, ImageSourcePropType,
} from 'react-native';
import { Text, Image, Button } from 'react-native-elements';
import ComLayoutHead from '../../../components/layout/head';
import {
  themeWhite, defaultThemeColor, defaultThemeBgColor, themeGray, getThemeOpacity,
} from '../../../config/theme';
import ComLine from '../../../components/line';
import { useGoToWithLogin } from '../../../tools/routeTools';
import ajax from '../../../data/fetch';
import getHeadImage from '../../../tools/getHeagImg';
import useGetDispatch from '../../../data/redux/dispatch';
import { InState } from '../../../data/redux/state';

interface InMyFollowManageLiView {
  head: ImageSourcePropType, // 头像
  name: string; // 名字
  withMoney: string; // 累计跟随金额
  withProfit: string; // 跟单收益
  isClose: boolean; // 是否开启跟单
  orderMoney: string; // 固定金额跟单
  dayMoney: string; // 单日跟随本金
  id: string|number; // id
  coinType: string; // 跟随币种
}
const MyFollowManageLiView: FC<InMyFollowManageLiView & {onPress: () => void;}> = ({
  head, name, withMoney, withProfit, isClose, orderMoney, dayMoney, coinType, onPress,
}) => {
  return (
    <>
      <View style={style.listBox}>
        <View style={style.listBoxTop}>
          <Image
            resizeMode="stretch"
            containerStyle={style.listBoxTopHead}
            source={head} />
          <Text style={style.listBoxTopName}>{name}</Text>
          <Button
            containerStyle={style.listBoxTopBtn}
            titleStyle={style.listBoxTopBtnText}
            buttonStyle={style.listBoxTopBtnIn}
            onPress={onPress}
            title="编辑" />
        </View>
        <View style={style.listMiddleBox}>
          <View style={style.listMiddleBoxIn}>
            <Text style={style.listMiddleBoxValue}>{withMoney}</Text>
            <Text style={style.listMiddleBoxDesc}>累计跟随金额({coinType})</Text>
          </View>
          <View style={style.listMiddleBoxIn}>
            <Text style={[style.listMiddleBoxValue, { color: defaultThemeColor }]}>{withProfit}</Text>
            <Text style={style.listMiddleBoxDesc}>跟单收益({coinType})</Text>
          </View>
        </View>
        <View style={style.listDesc}>
          {
            isClose
              ? <Text style={style.listDescText}>已关闭跟单</Text>
              : (
                <View>
                  <Text style={style.listDescTextShow}>固定金额跟单：{orderMoney}</Text>
                  <Text style={style.listDescTextShow}>单日跟随本金：{dayMoney}</Text>
                </View>
              )
          }
        </View>
      </View>
      <ComLine />
    </>
  );
};

const MyFollowManageListScreen: FC = () => {
  const [routePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');
  const goToWithLogin = useGoToWithLogin();
  // 累计跟随订单
  const [orderTotal, setOrderTotal] = useState('');
  // 跟单总收益
  const [orderWin, setOrderWin] = useState('');
  // 跟随列表
  const [withList, setWithList] = useState<InMyFollowManageLiView[]>([]);

  const addEvent = {
    // 前往编辑页面
    goToDetail: (id: string|number, name: string) => {
      goToWithLogin('followEdit', { id, name });
    },
  };

  useEffect(() => {
    if (routePage !== 'followManageList') return;
    ajax.get('/v1/track/own_list').then(data => {
      if (data.status) {
        setOrderTotal(data.data.orderNum);
        setOrderWin(`${parseFloat(data.data.profitNum).toFixed(2)}%`);
        const result = data.data?.list?.map((item: any) => ({
          head: getHeadImage()[Number(item.headimg) || 0],
          name: item.nickname,
          withMoney: item.item.cumulative_num,
          withProfit: `${item.item.cumulative_profit}%`,
          isClose: item.item.is_documentary === '2',
          orderMoney: item.item.num,
          dayMoney: item.item.num_day,
          id: item.item.id,
          coinType: item.item.symbol,
        })) || [];
        setWithList(result);
      }
    }).catch(err => console.log(err));
  }, [routePage]);
  return (
    <ComLayoutHead
      title=""
      scrollStyle={{ backgroundColor: themeWhite }}>
      <Text style={style.title}>
        跟单管理
      </Text>
      <View style={style.topBox}>
        <View>
          <Text style={style.topBoxTitle}>{orderTotal}</Text>
          <Text style={style.topBoxDesc}>累计跟随订单(USDT)</Text>
        </View>
        <View>
          <Text style={style.topBoxTitle}>{orderWin}</Text>
          <Text style={style.topBoxDesc}>跟单总收益(USDT)</Text>
        </View>
        <View style={style.topBoxBgView}>
          <StaticImage
            resizeMode="stretch"
            style={style.topBoxBg}
            source={require('../../../assets/images/pic/with_top_bg.png')} />
        </View>
      </View>
      <Text style={style.middleTitle}>
        正在跟随
      </Text>
      {
        withList.map(item => (
          <MyFollowManageLiView
            key={item.id}
            onPress={() => addEvent.goToDetail(item.id, item.name)}
            {...item} />
        ))
      }
      {
        withList.length === 0 && (
          <Text style={{
            textAlign: 'center',
            fontSize: 16,
            color: getThemeOpacity(defaultThemeColor, 0.7),
            paddingTop: 20,
          }}>
            无跟随数据
          </Text>
        )
      }
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  title: {
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 20,
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  topBox: {
    marginTop: 10,
    marginBottom: 20,
    marginLeft: 10,
    paddingRight: 10,
    position: 'relative',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    height: 100,
  },
  topBoxBgView: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  topBoxBg: {
    width: '100%',
    height: '100%',
  },
  topBoxTitle: {
    color: themeWhite,
    fontSize: 20,
    textAlign: 'center',
    paddingBottom: 5,
  },
  topBoxDesc: {
    color: themeWhite,
    opacity: 0.6,
  },
  middleTitle: {
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: defaultThemeColor,
    backgroundColor: defaultThemeBgColor,
    paddingTop: 15,
    paddingBottom: 15,
  },
  listBox: {
    padding: 10,
  },
  listBoxTop: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  listBoxTopHead: {
    width: 30,
    height: 30,
    borderRadius: 30,
    borderColor: defaultThemeColor,
    borderWidth: 1,
  },
  listBoxTopName: {
    fontSize: 15,
    marginLeft: 10,
  },
  listBoxTopBtn: {
    position: 'absolute',
    top: 10,
    right: 0,
    height: 30,
    width: 80,
    backgroundColor: defaultThemeColor,
  },
  listBoxTopBtnIn: {
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: defaultThemeColor,
  },
  listBoxTopBtnText: {
    lineHeight: 24,
    fontSize: 14,
  },
  listMiddleBox: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
  },
  listMiddleBoxIn: {
    flex: 1,
  },
  listMiddleBoxValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listMiddleBoxDesc: {
    color: themeGray,
    paddingTop: 2,
  },
  listDesc: {
    backgroundColor: defaultThemeBgColor,
    padding: 10,
  },
  listDescText: {
    color: themeGray,
  },
  listDescTextShow: {
    color: themeGray,
    lineHeight: 20,
  },
});

export default MyFollowManageListScreen;
