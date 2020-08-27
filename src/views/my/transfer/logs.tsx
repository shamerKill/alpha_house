import React, { FC, useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableNativeFeedback,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import ComLayoutHead from '../../../components/layout/head';
import {
  getThemeOpacity, defaultThemeColor, themeBlue, themeTextGray, themeWhite, defaultThemeBgColor, themeGray,
} from '../../../config/theme';
import showSelector from '../../../components/modal/selector';

const MyTransferLogsScreen: FC = () => {
  // 币种
  const [coinType, setCoinType] = useState('USDT');
  const [listData] = useState<{
    title: string;
    value: string;
    time: string;
    id: number|string;
  }[]>([]);

  const addEvent = {
    // 更改币种
    changeCoinType: () => {
      const coinArr = ['USDT'];
      const close = showSelector({
        data: coinArr,
        selected: coinType,
        onPress: (data) => {
          if (typeof data !== 'string') return;
          if (data === coinType) return;
          setCoinType(data);
          close();
        },
      });
    },
  };

  return (
    <ComLayoutHead
      title="划转记录"
      overScroll>
      <View style={style.headView}>
        <Text style={style.headText}>详情</Text>
        <TouchableNativeFeedback onPress={addEvent.changeCoinType}>
          <View style={style.headRight}>
            <Text style={style.headCoin}>{coinType}</Text>
            <Image
              style={style.headIcon}
              resizeMode="contain"
              source={require('../../../assets/images/icons/contract-down.png')} />
          </View>
        </TouchableNativeFeedback>
      </View>
      <ScrollView style={{ flex: 1 }}>
        {
          listData.map(item => (
            <View style={style.listView} key={item.id}>
              <View style={style.listInfo}>
                <Text style={style.listTitle}>{item.title}</Text>
                <Text style={style.listTime}>{item.time}</Text>
              </View>
              <Text style={style.listValue}>{item.value}{coinType}</Text>
            </View>
          ))
        }
      </ScrollView>
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  headView: {
    flexDirection: 'row',
    backgroundColor: getThemeOpacity(defaultThemeColor, 0.3),
    padding: 10,
    alignItems: 'center',
  },
  headText: {
    color: themeBlue,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    lineHeight: 30,
  },
  headRight: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginRight: -10,
  },
  headCoin: {
    color: themeTextGray,
    paddingRight: 5,
  },
  headIcon: {
    width: 14,
    height: 14,
  },
  // 列表
  listView: {
    backgroundColor: themeWhite,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: defaultThemeBgColor,
    borderBottomWidth: 1,
  },
  listInfo: {
  },
  listTitle: {
    fontSize: 15,
    paddingBottom: 5,
  },
  listTime: {
    fontSize: 12,
    color: themeGray,
  },
  listValue: {
    fontSize: 15,
  },
});

export default MyTransferLogsScreen;
