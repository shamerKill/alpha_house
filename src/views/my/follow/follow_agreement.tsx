import React, { FC, useState } from 'react';
import { View, StyleSheet, TouchableNativeFeedback } from 'react-native';
import { Text, CheckBox } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { themeWhite, themeTextGray, defaultThemeColor } from '../../../config/theme';

const MyFollowAgreenmentOut: FC<{close: () => void; success: () => void;}> = ({ close, success }) => {
  const agreenmentText = [
    '实盘跟随交易员或平台其它投资者下单，可能存在亏损风险，在风险控制不当的情况下，可能会整个账户全部亏损。亏损风险由您独自承担。请悉知',
    '一、确认跟随后,您可在我的-跟单管理中随时调整您的跟单策略,亦可随时停止跟随。跟随下单后，你可以随时管理自己的订单,包括平仓、止损止盈等。',
    '二、确认跟随后，跟随开仓的订单若产生盈利,将抽取8%的净利润作为交易员奖励。注意,无论订单时由您自主平仓或是跟随平仓，皆会发生订单利润分成。同时，您仅可跟随由被跟随者自主下单的订单，被跟随着的跟随其它的订单并不同步跟随。请知悉',
  ];

  const [checked, setChecked] = useState(false);
  return (
    <View style={style.bgBox}>
      <Text h4 style={style.title}>
        跟单协议
      </Text>
      <ScrollView style={style.scrollView}>
        {
          agreenmentText.map((item, index) => (
            <Text key={index} style={style.scrollText}>
              {item}
            </Text>
          ))
        }
        <CheckBox
          title="我已知悉"
          checked={checked}
          checkedIcon="dot-circle-o"
          uncheckedIcon="circle-o"
          onPress={() => setChecked(state => !state)}
          checkedColor={defaultThemeColor}
          textStyle={style.checkBoxTitle} />
      </ScrollView>
      <View style={style.btnsView}>
        <TouchableNativeFeedback onPress={() => close()}>
          <Text style={style.btnsNone}>考虑一下</Text>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => checked && success()}>
          <Text style={[style.btnsNone, checked && style.btnsSuccess]}>我已了解</Text>
        </TouchableNativeFeedback>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  bgBox: {
    backgroundColor: themeWhite,
    width: '80%',
    borderRadius: 5,
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  scrollView: {
    height: 300,
  },
  scrollText: {
    fontSize: 15,
    color: themeTextGray,
    lineHeight: 24,
  },
  checkBoxTitle: {
    color: defaultThemeColor,
  },
  btnsView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10,
  },
  btnsNone: {
    color: themeTextGray,
    paddingTop: 5,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 16,
    paddingBottom: 5,
  },
  btnsSuccess: {
    color: defaultThemeColor,
  },
});

export default MyFollowAgreenmentOut;
