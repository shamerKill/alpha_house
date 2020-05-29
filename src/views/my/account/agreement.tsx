import React, { FC } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';
import { themeTextGray } from '../../../config/theme';
import ComLayoutHead from '../../../components/layout/head';

const RegisterAgreenmentScreen: FC = () => {
  const agreenmentText = [
    '  实盘跟随交易员或平台其它投资者下单，可能存在亏损风险，在风险控制不当的情况下，可能会整个账户全部亏损。亏损风险由您独自承担。请悉知',
    '  一、确认跟随后,您可在我的-跟单管理中随时调整您的跟单策略,亦可随时停止跟随。跟随下单后，你可以随时管理自己的订单,包括平仓、止损止盈等。',
    '  二、确认跟随后，跟随开仓的订单若产生盈利,将抽取8%的净利润作为交易员奖励。注意,无论订单时由您自主平仓或是跟随平仓，皆会发生订单利润分成。同时，您仅可跟随由被跟随者自主下单的订单，被跟随着的跟随其它的订单并不同步跟随。请知悉',
  ];

  return (
    <ComLayoutHead
      title="用户注册协议"
      scrollStyle={{ padding: 10 }}>
      {
          agreenmentText.map((item, index) => (
            <Text key={index} style={style.scrollText}>
              {item}
            </Text>
          ))
        }
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  scrollText: {
    fontSize: 15,
    color: themeTextGray,
    lineHeight: 24,
    paddingTop: 10,
  },
});

export default RegisterAgreenmentScreen;
