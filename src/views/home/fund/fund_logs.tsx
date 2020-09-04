import React, { FC, useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ComLayoutHead from '../../../components/layout/head';
import { themeWhite, defaultThemeSmallColor, themeTextGray } from '../../../config/theme';
import ajax from '../../../data/fetch';

const HomeFundLogs: FC = () => {
  const [orderList, setOrderList] = useState<{ time: string; value: string; id: string; }[]>([]);
  const [allBuy, setAllBuy] = useState('');
  const [allProfit, setAllProfit] = useState('');

  useEffect(() => {
    ajax.get('/v1/fund/fund_order').then(data => {
      let buyNum = 0;
      let profitNum = 0;
      setOrderList(data?.data?.map((item: any, index: any) => {
        buyNum += item.number;
        profitNum += item.profit;
        return {
          time: item.create_time,
          value: item.number,
          id: index,
        };
      }) || []);
      setAllBuy(`${buyNum}`);
      setAllProfit(`${profitNum}`);
    }).catch(err => {
      console.log(err);
    });
  }, []);
  return (
    <ComLayoutHead overScroll title="订单记录">
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={['#8671fe', '#4b33ff']}
        style={{
          height: 120,
          width: '90%',
          marginLeft: '5%',
          marginTop: 20,
          borderRadius: 5,
        }}>
        <Text style={{
          color: themeWhite,
          paddingLeft: 20,
          paddingTop: 20,
          fontSize: 16,
        }}>
          认购总额
        </Text>
        <Text style={{
          color: themeWhite,
          fontSize: 22,
          fontWeight: 'bold',
          paddingLeft: 20,
          paddingTop: 5,
        }}>
          {allBuy}
        </Text>
        <Text style={{
          color: themeWhite,
          paddingRight: 20,
          paddingLeft: 20,
          paddingTop: 20,
          fontSize: 14,
        }}>
          收益总额：{allProfit}
        </Text>
      </LinearGradient>
      <View style={{
        backgroundColor: defaultThemeSmallColor,
        marginTop: 20,
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Text style={{ color: themeTextGray, fontSize: 16 }}>认购金额</Text>
        <Text style={{ color: themeTextGray, fontSize: 16 }}>认购时间</Text>
      </View>
      <ScrollView style={{ flex: 1 }}>
        {
          orderList.map((item) => (
            <View
              key={item.id}
              style={{
                paddingLeft: 10,
                paddingRight: 10,
                flexDirection: 'row',
                height: 40,
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomColor: '#e6e6e6',
                borderBottomWidth: 1,
              }}>
              <Text style={{ fontSize: 16 }}>{ item.value }</Text>
              <Text style={{ fontSize: 14, color: themeTextGray }}>{ item.time }</Text>
            </View>
          ))
        }
      </ScrollView>
    </ComLayoutHead>
  );
};

export default HomeFundLogs;
