import React, { FC, useState, useEffect } from 'react';
import {
  View, ImageSourcePropType, StyleSheet,
} from 'react-native';
import { Image, Text } from 'react-native-elements';
import ComLayoutHead from '../../../components/layout/head';
import ComFormButton from '../../../components/form/button';
import { themeWhite, defaultThemeColor, themeGray } from '../../../config/theme';
import ComLine from '../../../components/line';
import { useGoToWithLogin } from '../../../tools/routeTools';
import ajax from '../../../data/fetch';
import getHeadImage from '../../../tools/getHeagImg';

interface InFollowLi {
  head: ImageSourcePropType, // 头像
  name: string; // 名称
  totalProfit: string; // 累计收益率
  lastThreeWeek: string; // 近3周收益
  totalPerson: number; // 总人数
  id: number|string; // 用户ID
}

const MyFollowListScreen: FC = () => {
  const [listData, setListData] = useState<InFollowLi[]>([]);
  const goToWithLogin = useGoToWithLogin();

  const addEvent = {
    withThePeople: (id: InFollowLi['id']) => {
      goToWithLogin('followUserDetails', { id });
    },
  };

  useEffect(() => {
    ajax.get('/v1/track/list').then(data => {
      if (data.status === 200) {
        const result: InFollowLi[] = Object.values(data.data).map((item: any) => {
          return {
            head: getHeadImage()[item.headimg || 0],
            name: item.nickname,
            totalProfit: item.track_profit,
            lastThreeWeek: Math.floor((item.track_success_per) * 10000) / 100,
            totalPerson: item.track_num,
            id: item.id,
          };
        });
        setListData(result);
      }
    }).catch(err => console.log(err));
  }, []);
  return (
    <ComLayoutHead
      title="跟单">
      <ComLine />
      <View>
        {
          listData.map(item => (
            <FollowLi
              key={item.id}
              withPeopleFunc={addEvent.withThePeople}
              {...item} />
          ))
        }
      </View>
    </ComLayoutHead>
  );
};


const FollowLi: FC<InFollowLi&{withPeopleFunc: (id: InFollowLi['id']) => void;}> = ({
  head,
  name,
  totalProfit,
  lastThreeWeek,
  totalPerson,
  id,
  withPeopleFunc,
}) => {
  return (
    <View style={style.FollowLi}>
      {/* 个人信息 */}
      <View style={style.userInfo}>
        {/* 头像 */}
        <Image
          resizeMode="stretch"
          containerStyle={style.head}
          source={head} />
        {/* 名字 */}
        <Text style={style.userName}>
          { name }
        </Text>
      </View>
      {/* 跟单按钮 */}
      <ComFormButton
        title="跟单"
        containerStyle={style.withBtn}
        style={style.withBtnIn}
        fontStyle={style.withBtnText}
        onPress={() => withPeopleFunc(id)} />
      {/* 数据 */}
      <View style={style.valueView}>
        <View style={style.valueTextView}>
          <Text style={[style.valueText, style.valueTextLeft]}>{totalProfit}</Text>
          <Text style={[style.valueTextDesc]}>累计收益率</Text>
        </View>
        <View style={style.valueTextView}>
          <Text style={[style.valueText, style.valueTextCenter]}>{lastThreeWeek}%</Text>
          <Text style={[style.valueTextDesc, style.valueTextCenter]}>交易胜率</Text>
        </View>
        <View style={style.valueTextView}>
          <Text style={[style.valueText, style.valueTextRight]}>{totalPerson}</Text>
          <Text style={[style.valueTextDesc, style.valueTextRight]}>累计跟随人数</Text>
        </View>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  FollowLi: {
    backgroundColor: themeWhite,
    marginBottom: 10,
    padding: 10,
    position: 'relative',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  head: {
    width: 40,
    height: 40,
    borderColor: defaultThemeColor,
    borderWidth: 1,
    borderRadius: 20,
  },
  userName: {
    fontSize: 16,
    marginLeft: 10,
  },
  withBtn: {
    position: 'absolute',
    top: 10,
    right: 0,
    width: 70,
    height: 36,
    borderRadius: 0,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  withBtnIn: {
    borderRadius: 0,
    height: 36,
  },
  withBtnText: {
    fontSize: 15,
    paddingLeft: 8,
  },
  valueView: {
    flexDirection: 'row',
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  valueTextView: {
    flex: 1,
  },
  valueText: {
    fontSize: 16,
    paddingBottom: 5,
  },
  valueTextDesc: {
    color: themeGray,
  },
  valueTextLeft: {
    color: defaultThemeColor,
  },
  valueTextCenter: {
    textAlign: 'center',
  },
  valueTextRight: {
    textAlign: 'right',
  },
});

export default MyFollowListScreen;
