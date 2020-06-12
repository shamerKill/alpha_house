import React, { FC, useState, useEffect } from 'react';
import {
  View, StyleSheet, Image as StaticImage, TouchableNativeFeedback,
} from 'react-native';
import { useRoute, RouteProp, useNavigation, StackActions } from '@react-navigation/native';
import { Text } from 'react-native-elements';
import { TextInput } from 'react-native-gesture-handler';
import ComLayoutHead from '../../../components/layout/head';
import {
  themeWhite, themeGray, defaultThemeColor, defaultThemeBgColor,
} from '../../../config/theme';
import ComLine from '../../../components/line';
import showSelector from '../../../components/modal/selector';
import ComFormButton from '../../../components/form/button';
import { showMessage } from 'react-native-flash-message';
import { modalOutBg } from '../../../components/modal/outBg';
import MyFollowAgreenmentOut from './follow_agreement';
import showComAlert from '../../../components/modal/alert';
import { useGoToWithLogin } from '../../../tools/routeTools';

const MyFollowModeScreen: FC = () => {
  const { params: { id: userId } } = useRoute<RouteProp<{followMode: {id: string|number}}, 'followMode'>>();
  const navigation = useNavigation();
  const goToWithLogin = useGoToWithLogin();
  console.log(userId);
  const descArr = (min: number, max: number) => ([
    `例如您设置跟单金额 x USDT，不论交易员下单多少本金，您的下单本金均为 x USDT。单次最低跟单金额为 ${min} USDT。`,
    `单日累计跟随本金到达此数值后，将不再您跟随下单，最大为：${max} USDT。`,
  ]);

  const [maxValue, setMaxValue] = useState(0);
  const [minValue, setMinValue] = useState(0);
  // 跟随导师
  const [userName, setUserName] = useState('');
  // 跟单币种
  const [coinType, setCoinType] = useState('USDT');
  // 跟单金额
  const [orderMoney, setOrderMoney] = useState('2');
  // 单日跟随本金
  const [dayMoney, setDayMoney] = useState('200');

  const addEvent = {
    selectCoin: () => {
      const close = showSelector({
        data: ['USDT', 'ETH', 'BTC'],
        selected: coinType,
        onPress: (value) => {
          if (typeof value !== 'string') return;
          setCoinType(value);
          close();
        },
      });
    },
    setValue: (setType: React.Dispatch<React.SetStateAction<string>>, value: string, type?: 'cut'|'add') => {
      setType(() => {
        const resultString = value.match(/\d/g)?.join('');
        if (!resultString) return '0';
        let result = parseFloat(resultString);
        if (type) {
          if (type === 'cut') (result !== 0) && result--;
          if (type === 'add') result++;
        }
        return result.toString();
      });
    },
    verfiy: () => {
      let valueMessage =  '';
      if (parseFloat(dayMoney) < parseFloat(orderMoney)) valueMessage = '单日跟随本金小于单次跟单金额';
      if (parseFloat(orderMoney) < minValue) valueMessage = '单次跟随金额低于最低金额';
      if (parseFloat(dayMoney) > maxValue) valueMessage = '单日跟随本金大于最大跟随本本金';
      if (valueMessage) {
        return showMessage({
          message: '跟随失败',
          description: valueMessage,
          type: 'warning',
        });
      }
      modalOutBg.outBgsetShow(true);
      modalOutBg.outBgsetChildren(
        <MyFollowAgreenmentOut
          close={() => {
            modalOutBg.outBgsetShow(false);
          }}
          success={() => {
            modalOutBg.outBgsetShow(false);
            addEvent.submit();
          }} />
      );
    },
    submit: () => {
      const close = showComAlert({
        title: '跟单成功',
        desc: '跟单成功，请前往跟单管理页面查看详情',
        success: {
          text: '查看详情',
          onPress: () => {
            close();
            navigation.dispatch(StackActions.popToTop());
            goToWithLogin('followManageList');
          },
        },
        close: {
          text: '取消',
          onPress: () => {
            close();
          }
        },
      });
    },
  };

  useEffect(() => {
    setUserName('其少金融学院');
    setMinValue(2);
    setMaxValue(200);
    setOrderMoney('2');
    setDayMoney('200');
  }, []);
  return (
    <ComLayoutHead
      title="">
      <View style={style.top}>
        <Text style={style.topTitle}>请先设置跟单方式</Text>
        <Text style={style.topDesc}>跟单</Text>
        <Text style={style.topName}>{userName}</Text>
      </View>
      <ComLine />
      <View style={style.tabView}>
        <View style={style.tabListView}>
          <Text style={style.tabListTitle}>跟单币种</Text>
          <TouchableNativeFeedback onPress={addEvent.selectCoin}>
            <View style={style.tabListRight}>
              <Text style={style.tabListRightCoin}>{coinType}</Text>
              <StaticImage
                resizeMode="contain"
                style={style.tabListRightMore}
                source={require('../../../assets/images/icons/list_more.png')} />
            </View>
          </TouchableNativeFeedback>
        </View>
        <View style={style.tabListView}>
          <Text style={style.tabListTitle}>单次跟单金额{coinType}</Text>
          <View style={style.tabListRight}>
            <TouchableNativeFeedback onPress={() => addEvent.setValue(setOrderMoney, orderMoney, 'cut')}>
              <View style={style.tabListBtn}>
                <StaticImage
                  resizeMode="contain"
                  style={style.tabListCut}
                  source={require('../../../assets/images/icons/cut.png')} />
              </View>
            </TouchableNativeFeedback>
            <TextInput
              style={style.tabListInput}
              keyboardType="number-pad"
              value={orderMoney}
              onChange={e => addEvent.setValue(setOrderMoney, e.nativeEvent.text)} />
            <TouchableNativeFeedback onPress={() => addEvent.setValue(setOrderMoney, orderMoney, 'add')}>
              <View style={style.tabListBtn}>
                <StaticImage
                  resizeMode="contain"
                  style={style.tabListAdd}
                  source={require('../../../assets/images/icons/add.png')} />
              </View>
            </TouchableNativeFeedback>
          </View>
          <Text style={style.tabListDesc}>{descArr(minValue, maxValue)[0]}</Text>
        </View>
        <View style={style.tabListView}>
          <Text style={style.tabListTitle}>单日跟随本金{coinType}</Text>
          <View style={style.tabListRight}>
            <TouchableNativeFeedback onPress={() => addEvent.setValue(setDayMoney, dayMoney, 'cut')}>
              <View style={style.tabListBtn}>
                <StaticImage
                  resizeMode="contain"
                  style={style.tabListCut}
                  source={require('../../../assets/images/icons/cut.png')} />
              </View>
            </TouchableNativeFeedback>
            <TextInput
              style={style.tabListInput}
              keyboardType="number-pad"
              value={dayMoney}
              onChange={e => addEvent.setValue(setDayMoney, e.nativeEvent.text)} />
            <TouchableNativeFeedback onPress={() => addEvent.setValue(setDayMoney, dayMoney, 'add')}>
              <View style={style.tabListBtn}>
                <StaticImage
                  resizeMode="contain"
                  style={style.tabListAdd}
                  source={require('../../../assets/images/icons/add.png')} />
              </View>
            </TouchableNativeFeedback>
          </View>
          <Text style={style.tabListDesc}>{descArr(minValue, maxValue)[1]}</Text>
        </View>
      </View>

      <ComFormButton
        title="立即跟随"
        onPress={() => addEvent.verfiy()}
        containerStyle={style.fromButton} />
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  top: {
    padding: 10,
    backgroundColor: themeWhite,
  },
  topTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    paddingBottom: 10,
  },
  topDesc: {
    color: themeGray,
  },
  topName: {
    fontWeight: 'bold',
    paddingTop: 5,
    fontSize: 18,
    color: defaultThemeColor,
    paddingBottom: 5,
  },
  // 选项
  tabView: {
    backgroundColor: themeWhite,
    paddingLeft: 10,
    paddingRight: 10,
  },
  tabListView: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    borderBottomColor: defaultThemeBgColor,
    borderBottomWidth: 1,
    marginRight: -10,
  },
  tabListTitle: {
    fontSize: 16,
  },
  tabListRight: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  tabListRightCoin: {
    fontSize: 16,
  },
  tabListRightMore: {
    width: 14,
    height: 14,
    marginLeft: 10,
  },
  tabListBtn: {
    padding: 10,
  },
  tabListCut: {
    width: 10,
    height: 10,
  },
  tabListAdd: {
    width: 10,
    height: 10,
  },
  tabListInput: {
    textAlign: 'center',
    width: 60,
    height: 50,
    fontSize: 13,
  },
  tabListDesc: {
    color: themeGray,
    fontSize: 13,
    paddingTop: 5,
    paddingRight: 10,
    width: '100%',
  },
  fromButton: {
    marginTop: 30,
  },
});

export default MyFollowModeScreen;
