import React, { FC, useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import ComLayoutHead from '../../components/layout/head';
import { defaultThemeColor, themeWhite, themeGray } from '../../config/theme';

const HomeNewsDetails: FC = () => {
  const route = useRoute<RouteProp<{newsDetails:{newsId:string}}, 'newsDetails'>>();
  const id = route.params.newsId;
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [desc, setDesc] = useState('');
  useEffect(() => {
    console.log(id);
    setTitle('季度合约定服升级的说明');
    setTime('2020-05-10 20:23:12');
    setDesc('季度合约交易区于5月7日17:00停服升级，预计半小时。期间，您将无法进行开平仓、资金划转、止盈止损、计划委托等操作，请提前把控仓位风险。因此为您带来不便，还请谅解！');
  }, []);
  return (
    <ComLayoutHead title="消息详情">
      <Text style={{
        color: defaultThemeColor,
        fontSize: 16,
        lineHeight: 40,
        backgroundColor: themeWhite,
        marginTop: 10,
        padding: 10,
      }}>
        {title}
      </Text>
      <View style={{
        marginTop: 10,
        backgroundColor: themeWhite,
        padding: 10,
      }}>
        <Text style={{ color: themeGray }}>{time}</Text>
        <Text style={{ lineHeight: 20, paddingTop: 10 }}>{desc}</Text>
      </View>
    </ComLayoutHead>
  );
};

export default HomeNewsDetails;
