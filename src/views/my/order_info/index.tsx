import React, { FC, useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableNativeFeedback, Dimensions,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { ListItem } from 'react-native-elements';
import ComLayoutHead from '../../../components/layout/head';
import {
  defaultThemeColor, themeWhite, themeGray, themeBlack,
} from '../../../config/theme';
import ComLine from '../../../components/line';
import ComFormButton from '../../../components/form/button';
import showComDrawer from '../../../components/modal/drawer';
import ComMyOrderInfoLeftOut from './left_out';

const MyOrderInfo: FC = () => {
  // 屏幕宽度
  const screenWith = Math.round(Dimensions.get('window').width);
  const typeBtns:{name: string, id: number}[] = [
    { name: '充值提现', id: 0 },
    { name: 'USDT', id: 1 },
    { name: '混合合约', id: 2 },
    { name: '币本位合约', id: 3 },
    { name: '币币账户', id: 4 },
  ];
  // 处理空行
  const supplyTypeBtns: string[] = [];
  for (let i = 1, len = typeBtns.length % 3; i < len; i++) {
    supplyTypeBtns.push('');
  }
  const outBoxClose = useRef<{close: () => void;}>();


  // 订单类型
  const [orderType, setOrderType] = useState<typeof typeBtns[0]['id']>(0);
  // 按钮是否可选
  const [btnDisabled, setBtnDisabled] = useState(false);
  // 订单列表
  type TypeOrderList = {
    title: string;
    time: string;
    number: string;
    id: string;
  };
  const [orderList, setOrderList] = useState<TypeOrderList[]>([]);


  const addEvent = {
    // 筛选按钮
    screen: () => {
      console.log('筛选');
      const drawer = showComDrawer({
        noClose: true,
        width: '80%',
        context: <ComMyOrderInfoLeftOut close={outBoxClose} />,
      });
      outBoxClose.current = drawer;
    },
    // 选择账单类型
    changeOrderType: (id: typeof orderType) => {
      setBtnDisabled(true);
      setTimeout(setBtnDisabled, 1000, false);
      setOrderType(id);
    },
  };

  useEffect(() => {
    setOrderList([
      {
        title: '充值', time: '2018-03-25  08:57:25', number: '1000.00', id: '0',
      },
      {
        title: '提现', time: '2018-03-25  08:57:25', number: '-1000.00', id: '1',
      },
      {
        title: '提现', time: '2018-03-25  08:57:25', number: '-1000.00', id: '2',
      },
      {
        title: '提现', time: '2018-03-25  08:57:25', number: '-1000.00', id: '3',
      },
      {
        title: '提现', time: '2018-03-25  08:57:25', number: '-1000.00', id: '4',
      },
      {
        title: '提现', time: '2018-03-25  08:57:25', number: '-1000.00', id: '5',
      },
      {
        title: '提现', time: '2018-03-25  08:57:25', number: '-1000.00', id: '6',
      },
      {
        title: '提现', time: '2018-03-25  08:57:25', number: '-1000.00', id: '7',
      },
    ]);
    return () => {
      outBoxClose.current && outBoxClose.current.close();
    };
  }, []);
  return (
    <ComLayoutHead
      overScroll
      title="账单明细"
      rightComponent={(
        <TouchableNativeFeedback onPress={addEvent.screen}>
          <Text style={{ color: defaultThemeColor, fontSize: 15 }}>筛选</Text>
        </TouchableNativeFeedback>
      )}>
      <View style={{
        backgroundColor: themeWhite,
        padding: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}>
        {
          typeBtns.map(item => (
            <ComFormButton
              onPress={() => addEvent.changeOrderType(item.id)}
              disabled={btnDisabled}
              gray={item.id !== orderType}
              key={item.id}
              title={item.name}
              style={{
                width: screenWith * 0.3,
                marginTop: 5,
                marginBottom: 5,
              }}
              fontStyle={{
                fontSize: 14,
              }} />
          ))
        }
        {
          supplyTypeBtns.map((_item, index) => (
            <View
              key={index}
              style={{ width: screenWith * 0.3 }} />
          ))
        }
      </View>
      <ComLine />
      <ScrollView style={{
        backgroundColor: themeWhite,
        flex: 1,
      }}>
        {
          orderList.map(item => (
            <ListItem
              key={item.id}
              title={item.title}
              subtitle={item.time}
              rightTitle={`${item.number} USDT`}
              subtitleStyle={{ color: themeGray, paddingTop: 5 }}
              rightTitleStyle={{ color: themeBlack, fontSize: 14 }}
              bottomDivider />
          ))
        }
      </ScrollView>
    </ComLayoutHead>
  );
};

export default MyOrderInfo;
