import React, { FC, useState, useEffect } from 'react';
import {
  View, ImageSourcePropType, StyleSheet, Image as StaticImage,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Image, Text } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import ComLayoutHead from '../../../components/layout/head';
import {
  themeWhite, defaultThemeColor, themeGray, themeTextGray, themeBlack, themeGreen, themeRed, defaultThemeBgColor,
} from '../../../config/theme';
import ComLine from '../../../components/line';
import ComFormButton from '../../../components/form/button';
import { useGoToWithLogin } from '../../../tools/routeTools';
import ajax from '../../../data/fetch';
import getHeadImage from '../../../tools/getHeagImg';

type TypeUserInfo = {
  head: ImageSourcePropType, // 头像
  name: string; // 名称
  time: string; // 时间
  site: string; // 地址
  desc: string; // 描述
};
type TypeUserValue = {
  totalProfit: string; // 累计收益
  lastThreeProfit: string; // 近3周胜率
  totalDays: number; // 交易时间
  totalLength: number; // 交易笔数
  totalPerson: number; // 累计跟随人数
  willWinProfit: string; // 预计分成比例
};
type TypeLogList = {
  type: 0|1; // 买跌/买涨
  win: boolean; // 盈亏
  coinType: string; // 币种类型
  multiple: string; // 开的倍数
  openPrice: string; // 开仓价
  closePrice: string; // 平仓价
  profit: string; // 收益率
  openTime: string; // 开仓时间
  closeTime: string; // 平仓时间
  orderId: string; // 订单ID
  orderType: string; // 订单类型
};

const MyFollowUserDetails: FC = () => {
  const { params: { id: userId } } = useRoute<RouteProp<{followUserDetails: {id: string|number}}, 'followUserDetails'>>();
  const goToWithLogin = useGoToWithLogin();
  // 用户信息
  const [userInfo, setUserInfo] = useState<TypeUserInfo>();
  // 用户收益信息
  const [userProfit, setUserProfit] = useState<TypeUserValue>();
  const userProfitList: {
    title: string;
    key: keyof TypeUserValue;
  }[] = [
    { title: '累计收益', key: 'totalProfit' },
    { title: '交易胜率', key: 'lastThreeProfit' },
    { title: '交易天数', key: 'totalDays' },
    { title: '交易笔数', key: 'totalLength' },
    { title: '累计跟随人数', key: 'totalPerson' },
  ];
  // 用户订单信息
  const [logList, setLogList] = useState<TypeLogList[]>([]);

  const addEvent = {
    withPerson: () => {
      if (!userInfo?.name) return;
      goToWithLogin('followMode', { id: userId, name: userInfo?.name });
    },
  };

  // 获取数据
  useEffect(() => {
    ajax.get(`/v1/track/detail?trackID=${userId}`).then(data => {
      if (data.status === 200) {
        const userData = data.data.userInfo;
        setUserInfo({
          head: getHeadImage()[Number(userData.headimg) || 0],
          name: userData.nickname,
          time: userData.track_day.split(' ')[0],
          site: userData.location,
          desc: userData.description,
        });
        setUserProfit({
          totalProfit: `${userData.track_profit}%`,
          lastThreeProfit: `${Math.floor(userData.track_success_per * 10000) / 100}%`,
          totalDays: data.data.track_day,
          totalLength: userData.order_num,
          totalPerson: userData.track_num,
          willWinProfit: data.data.config,
        });
        const result = data.data.orderList.map((item: any) => {
          return {
            type: Number(item.sell_buy === '1'),
            win: item.profit_per >= 0,
            coinType: item.symbol,
            multiple: `${item.lever}x`,
            openPrice: item.price,
            closePrice: item.deal_price,
            profit: `${item.profit_per}%`,
            openTime: item.create_time,
            closeTime: item.update_time,
            orderId: item.id,
            orderType: ['', '持仓中', '已平仓', '部分平仓', '全部平仓', '部分平仓'][Number(item.status)],
          };
        });
        setLogList(result);
      }
    }).catch(err => { console.log(err); });
  }, []);
  return (
    <ComLayoutHead
      overScroll
      scrollStyle={{ backgroundColor: themeWhite }}
      title="">
      <ScrollView style={{ flex: 1 }}>
        {/* 用户说明 */}
        <View style={style.userInfo}>
          <View style={style.userInfoDetail}>
            <Image
              containerStyle={style.userInfoImg}
              source={userInfo?.head || 0} />
            <View style={style.userInfoText}>
              <Text style={style.userInfoName}>{userInfo?.name}</Text>
              <Text style={style.userInfoTime}>{userInfo?.time}</Text>
            </View>
            <View style={style.userInfoSite}>
              <StaticImage
                resizeMode="contain"
                style={style.userInfoSiteIcon}
                source={require('../../../assets/images/icons/site.png')} />
              <Text style={style.userInfoSiteText}>{userInfo?.site}</Text>
            </View>
          </View>
          <View style={style.userInfoDesc}>
            <Text style={style.userInfoDescTitle}>个人简介</Text>
            <Text style={style.userInfoDescText}>{userInfo?.desc}</Text>
          </View>
        </View>
        <ComLine />
        {/* 收益率 */}
        <View style={style.profitView}>
          {
            userProfitList.map((item, index) => (
              <View
                key={item.key}
                style={style.profitListView}>
                <Text
                  style={[
                    style.profitListViewValue,
                    index % 3 === 1 && style.profitListViewTextCenter,
                    index % 3 === 2 && style.profitListViewTextRight,
                    (index === 0
                      && Boolean(userProfit?.[item.key])
                      && (parseFloat(userProfit?.[item.key] as string) > 0
                        ? style.textGreen : style.textRed)),
                  ]}>
                  {userProfit?.[item.key]}
                </Text>
                <Text
                  style={[
                    style.profitListViewText,
                    index % 3 === 1 && style.profitListViewTextCenter,
                    index % 3 === 2 && style.profitListViewTextRight,
                  ]}>
                  {item.title}
                </Text>
              </View>
            ))
          }
          <View style={style.profitTips}>
            <Text style={style.profitTipsText}>跟单利润分成比例：{userProfit?.willWinProfit}</Text>
            <StaticImage
              resizeMode="contain"
              style={style.profitTipsIcon}
              source={require('../../../assets/images/icons/info.png')} />
          </View>
        </View>
        <ComLine />
        {/* 历史持仓 */}
        <View style={style.storyLogsView}>
          <View style={style.storyLogsViewTitle}>
            <Text style={style.storyLogsViewTitleleft}>历史持仓</Text>
            <Text style={style.storyLogsViewTitleRight}>仅最近50条数据，数据每小时更新一次</Text>
          </View>
          {
            logList.map(item => (
              <View
                key={item.orderId}
                style={style.storyLogsBox}>
                {/* 上边 */}
                <View style={style.storyLogsBoxTop}>
                  {/* 左边 */}
                  <View style={style.storyLogsBoxTopLeft}>
                    <View style={style.storyLogsBoxTopLeftTitle}>
                      <Text style={[
                        style.storyLogsBoxTopLeftType,
                        item.type ? style.textGreen : style.textRed,
                      ]}>
                        {item.type ? '买涨' : '买跌'}
                      </Text>
                      <Text style={style.storyLogsBoxTopLeftInfo}>
                        <Text>{item.coinType}</Text>
                        <Text style={style.storyLogsBoxTopLeftSmall}>/USDT</Text>
                        {/* <Text>&nbsp;&nbsp;{item.multiple}</Text> */}
                      </Text>
                    </View>
                    <View style={style.storyLogsBoxTopPrice}>
                      <View style={style.storyLogsBoxTopPriceList}>
                        <Text style={style.storyLogsBoxTopPriceNum}>
                          {item.openPrice}
                        </Text>
                        <Text style={style.storyLogsBoxTopPriceDesc}>
                          开仓价
                        </Text>
                      </View>
                      <View style={style.storyLogsBoxTopPriceList}>
                        <Text style={style.storyLogsBoxTopPriceNum}>
                          {item.closePrice}
                        </Text>
                        <Text style={style.storyLogsBoxTopPriceDesc}>
                          平仓价
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* 右边 */}
                  <View style={style.storyLogsBoxTopRight}>
                    <Text style={[
                      style.storyLogsBoxTopRightTextProfit,
                      parseFloat(item.profit) > 0 ? style.textGreen : style.textRed,
                    ]}>
                      {item.profit}
                    </Text>
                    <Text style={style.storyLogsBoxTopRightTextDesc}>
                      收益率
                    </Text>
                  </View>
                </View>
                {/* 更多信息 */}
                <View style={style.storyLogsBoxBottom}>
                  <View style={style.storyLogsBoxBottomView}>
                    <Text style={style.storyLogsBoxBottomText}>
                      开仓时间:{item.openTime}
                    </Text>
                    <Text style={style.storyLogsBoxBottomText}>
                      平仓时间:{item.closeTime}
                    </Text>
                  </View>
                  <View style={style.storyLogsBoxBottomView}>
                    <Text style={style.storyLogsBoxBottomText}>
                      订单号:{item.orderId}
                    </Text>
                    <Text style={style.storyLogsBoxBottomText}>
                      订单类型:{item.orderType}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          }
        </View>
      </ScrollView>
      <View
        style={style.bottomButtonView}>
        <ComFormButton
          onPress={() => addEvent.withPerson()}
          style={style.bottomButton}
          title="跟单" />
      </View>
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  userInfo: {
    padding: 10,
  },
  userInfoDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  userInfoImg: {
    width: 50,
    height: 50,
    borderColor: defaultThemeColor,
    borderWidth: 1,
    borderRadius: 30,
  },
  userInfoText: {
    marginLeft: 10,
  },
  userInfoName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userInfoTime: {
    color: themeGray,
  },
  userInfoSite: {
    position: 'absolute',
    bottom: 0,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfoSiteIcon: {
    width: 14,
    height: 14,
  },
  userInfoSiteText: {
    color: themeGray,
    marginLeft: 5,
  },
  userInfoDesc: {
    flexDirection: 'row',
  },
  userInfoDescTitle: {
    backgroundColor: defaultThemeColor,
    color: themeWhite,
    width: 80,
    textAlign: 'center',
    lineHeight: 20,
    height: 20,
  },
  userInfoDescText: {
    marginLeft: 5,
    flex: 2,
    lineHeight: 20,
    color: themeTextGray,
  },
  // 收益率
  profitView: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  profitListView: {
    width: '33.33%',
    paddingBottom: 10,
  },
  profitListViewValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeBlack,
  },
  profitListViewText: {
    color: themeGray,
    paddingTop: 5,
  },
  profitListViewTextCenter: {
    textAlign: 'center',
  },
  profitListViewTextRight: {
    textAlign: 'right',
  },
  profitTips: {
    flexDirection: 'row',
    borderColor: defaultThemeBgColor,
    borderTopWidth: 1,
    width: '100%',
    alignItems: 'center',
  },
  profitTipsText: {
    color: themeGray,
    paddingTop: 5,
  },
  profitTipsIcon: {
    width: 15,
    height: 15,
    marginLeft: 5,
    marginTop: 6,
  },
  // 历史持仓
  storyLogsView: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  storyLogsViewTitle: {
    flexDirection: 'row',
    borderBottomColor: defaultThemeBgColor,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storyLogsViewTitleleft: {
    lineHeight: 50,
    fontSize: 20,
    fontWeight: 'bold',
  },
  storyLogsViewTitleRight: {
    fontSize: 12,
    color: themeGray,
  },
  storyLogsBox: {
    borderBottomColor: defaultThemeBgColor,
    borderBottomWidth: 1,
    paddingTop: 10,
    paddingBottom: 10,
  },
  storyLogsBoxTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
  },
  storyLogsBoxTopLeft: {
    flex: 5,
  },
  storyLogsBoxTopLeftTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
  },
  storyLogsBoxTopLeftType: {
    fontSize: 16,
    paddingRight: 20,
  },
  storyLogsBoxTopLeftInfo: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  storyLogsBoxTopLeftSmall: {
    fontWeight: 'normal',
    fontSize: 12,
    color: themeGray,
  },
  storyLogsBoxTopPrice: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  storyLogsBoxTopPriceList: {
    flex: 1,
  },
  storyLogsBoxTopPriceNum: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  storyLogsBoxTopPriceDesc: {
    fontSize: 12,
    color: themeGray,
  },
  storyLogsBoxTopRight: {
    flex: 2,
    borderLeftColor: defaultThemeBgColor,
    borderLeftWidth: 1,
  },
  storyLogsBoxTopRightTextProfit: {
    textAlign: 'right',
    fontSize: 18,
    fontWeight: 'bold',
    paddingTop: 10,
  },
  storyLogsBoxTopRightTextDesc: {
    textAlign: 'right',
    color: themeGray,
    paddingBottom: 10,
  },
  storyLogsBoxBottom: {
    backgroundColor: defaultThemeBgColor,
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
  },
  storyLogsBoxBottomView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 5,
  },
  storyLogsBoxBottomText: {
    color: themeGray,
    flex: 1,
    fontSize: 12,
  },
  // 底部按钮
  bottomButtonView: {
    backgroundColor: defaultThemeBgColor,
    zIndex: 10,
  },
  bottomButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  // 基础样式
  textGreen: {
    color: themeGreen,
  },
  textRed: {
    color: themeRed,
  },
});

export default MyFollowUserDetails;
