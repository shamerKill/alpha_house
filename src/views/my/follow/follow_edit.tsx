import React, { FC, useState, useEffect, useRef } from 'react';
import {
  TouchableNativeFeedback, Text, StyleSheet, View, Image as StaticImage, Animated,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { TextInput } from 'react-native-gesture-handler';
import ComLayoutHead from '../../../components/layout/head';
import {
  defaultThemeColor, themeWhite, themeTextGray, defaultThemeBgColor, themeGray,
} from '../../../config/theme';
import ComLine from '../../../components/line';
import { showMessage } from 'react-native-flash-message';
import showComAlert from '../../../components/modal/alert';
import ComFormButton from '../../../components/form/button';
import ComFormCheckRadius from '../../../components/form/checkRadius';
import ajax from '../../../data/fetch';

const MyFollowEditScreen: FC = () => {
  const { params: { id: orderId, name } } = useRoute<RouteProp<{followEdit: { id: string|number, name: string }}, 'followEdit'>>();
  const navigation = useNavigation();
  const coinID = useRef('');
  const descArr = (min: number, max: number, coin: string) => ([
    '关闭后不再跟随交易员下单。已跟随开仓的订单，保持同步平仓，不受影响。',
    `例如您设置跟单金额 x ${coin}，不论交易员下单多少本金，您的下单本金均为 x ${coin}。单次最低跟单金额为 ${min} ${coin}。`,
    `单日累计跟随本金到达此数值后，将不再您跟随下单，最大为：${max} ${coin}。`,
  ]);

  const [maxValue, setMaxValue] = useState(0);
  const [minValue, setMinValue] = useState(0);
  // 跟单名字
  const [withName] = useState(name);
  // 跟单币种
  const [withCoin, setWithCoin] = useState('');
  // 跟单开关
  const [withChecked, setWithChecked] = useState(false);
  const checkedBox = useRef();
  // 跟单金额
  const [orderMoney, setOrderMoney] = useState('');
  // 单日跟随本金
  const [dayMoney, setDayMoney] = useState('');

  const addEvent = {
    // 取消跟随
    closeWith: () => {
      const close = showComAlert({
        title: '取消跟随',
        desc: '停止跟随后将不再跟随交易员下单，交易员将不再出现在跟随列表中，已跟随开仓的订单，将保持同步平仓。',
        success: {
          text: '确定',
          onPress: () => {
            close();
            addEvent.submit(true);
          },
        },
        close: {
          text: '取消',
          onPress: () => close(),
        }
      });
    },
    // 设置数量
    setValue: (setType: React.Dispatch<React.SetStateAction<string>>, value: string, type?: 'cut'|'add') => {
      setType(() => {
        const resultString = value.match(/[\d|\.]/g)?.join('');
        if (!resultString) return '0';
        let result = parseFloat(resultString);
        if (type) {
          if (type === 'cut') (result !== 0) && result--;
          if (type === 'add') result++;
          return result.toString();
        }
        return resultString;
      });
    },
    // 跟单开关
    withCheckBoxBack: (value: boolean) => {
      setWithChecked(value);
      ComFormCheckRadius.prototype.setChecked(true);
    },
    // 提交验证
    verfiy: () => {
      let valueMessage =  '';
      if (parseFloat(dayMoney) < parseFloat(orderMoney)) valueMessage = '单日跟随本金小于单次跟单金额';
      if (parseFloat(orderMoney) < minValue) valueMessage = '单次跟随金额低于最低金额';
      if (parseFloat(dayMoney) > maxValue) valueMessage = '单日跟随本金大于最大跟随本本金';
      if (valueMessage) {
        return showMessage({
          message: '保存失败',
          description: valueMessage,
          type: 'warning',
        });
      }
      addEvent.submit();
    },
    submit: (closeWith?: true) => {
      ajax.post('/v1/track/edit_action', {
        id: orderId,
        is_track: closeWith ? '2' : '1',
        is_documentary: withChecked ? '1' : '2',
        contract_type: 2,
        symbol: coinID.current,
        num: orderMoney,
        day_num: dayMoney
      }).then(data => {
        if (data.status === 200) {
          addEvent.submitSuccess();
        } else {
          showMessage({
            message: data.message,
            type: 'warning',
          });
        }
      }).catch(err => {
        console.log(err);
      });
    },
    submitSuccess: (closeWith?: true) => {
      const close = showComAlert({
        title: closeWith ? '取消成功' : '修改成功',
        desc: closeWith ? '取消成功，订单删除' : '修改成功，请前往跟单管理页面查看详情',
        success: {
          text: '返回列表',
          onPress: () => {
            navigation.goBack();
            close();
          },
        },
        close: closeWith ? undefined : {
          text: '取消',
          onPress: () => {
            close();
          }
        },
      });
    },
  };

  useEffect(() => {
    ajax.get(`/v1/track/edit_view?id=${orderId}`).then(data => {
      console.log(data);
      if (data.status === 200) {
        setWithCoin(data.data.info.symbol);
        setOrderMoney(`${data.data.info.num}`);
        setDayMoney(`${data.data.info.num_day}`);
        if (data.data.info.is_documentary === '1') addEvent.withCheckBoxBack(true);
        const coin = data.data.value.filter((item: any) => item.symbol === data.data.info.symbol)[0];
        setMinValue(coin.num);
        setMaxValue(coin.num * 1000);
        coinID.current = coin.id;
      }
    }).catch(err => console.log(err));
  }, []);
  return (
    <ComLayoutHead
      title="编辑订单"
      rightComponent={(
        <TouchableNativeFeedback onPress={addEvent.closeWith}>
          <Text style={style.titleRight}>取消跟随</Text>
        </TouchableNativeFeedback>
      )}>
      <View style={style.topBox}>
        <View style={style.topBoxView}>
          <Text style={style.topBoxDesc}>跟单</Text>
          <Text style={style.topBoxDesc}>跟单币种</Text>
        </View>
        <View style={style.topBoxView}>
          <Text style={[style.topBoxText, style.topBoxTextName]}>{withName}</Text>
          <Text style={style.topBoxText}>{withCoin}</Text>
        </View>
      </View>
      <ComLine />
      <View style={style.content}>
        <View style={style.tabListView}>
          <Text style={style.tabListTitle}>跟单开关</Text>
          <ComFormCheckRadius
            defaultValue={withChecked}
            checkState={addEvent.withCheckBoxBack} />
          <Text style={style.tabListDesc}>{descArr(minValue, maxValue, withCoin)[1]}</Text>
        </View>
        <View style={style.tabListView}>
          <Text style={style.tabListTitle}>单次跟单金额{withCoin}</Text>
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
          <Text style={style.tabListDesc}>{descArr(minValue, maxValue, withCoin)[1]}</Text>
        </View>
        <View style={style.tabListView}>
          <Text style={style.tabListTitle}>单日跟随本金{withCoin}</Text>
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
          <Text style={style.tabListDesc}>{descArr(minValue, maxValue, withCoin)[2]}</Text>
        </View>
      </View>
      <ComFormButton
        onPress={() => addEvent.verfiy()}
        containerStyle={style.submitButton}
        title="保存" />
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  titleRight: {
    color: defaultThemeColor,
    textAlign: 'right',
    lineHeight: 50,
  },
  topBox: {
    backgroundColor: themeWhite,
    padding: 10,
  },
  topBoxView: {
    flexDirection: 'row',
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  topBoxDesc: {
    color: themeTextGray,
  },
  topBoxText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  topBoxTextName: {
    color: defaultThemeColor,
  },
  content: {
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
  tabChecked: {
    width: 60,
    height: 30,
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: defaultThemeColor,
    borderColor: defaultThemeColor,
    borderWidth: 1,
    display: 'flex',
    position: 'relative',
  },
  tabCheckedIn: {
    width: 28,
    height: 28,
    backgroundColor: themeWhite,
    borderRadius: 30,
  },
  submitButton: {
    marginTop: 30,
    marginBottom: 30,
  },
});

export default MyFollowEditScreen;
