import React, {
  FC, useState, useEffect, useRef,
} from 'react';
import {
  View, StyleSheet, Image as StaticImage, TouchableNativeFeedback,
} from 'react-native';
import {
  useRoute, RouteProp, useNavigation, StackActions,
} from '@react-navigation/native';
import { Text } from 'react-native-elements';
import { TextInput } from 'react-native-gesture-handler';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../../components/layout/head';
import {
  themeWhite, themeGray, defaultThemeColor, defaultThemeBgColor,
} from '../../../config/theme';
import ComLine from '../../../components/line';
import showSelector from '../../../components/modal/selector';
import ComFormButton from '../../../components/form/button';
import { modalOutBg } from '../../../components/modal/outBg';
import MyFollowAgreenmentOut from './follow_agreement';
import showComAlert from '../../../components/modal/alert';
import { useGoToWithLogin } from '../../../tools/routeTools';
import ajax from '../../../data/fetch';
import storage from '../../../data/database';

const MyFollowModeScreen: FC = () => {
  const { params: { id: userId, name } } = useRoute<RouteProp<{followMode: {id: string|number, name: string}}, 'followMode'>>();
  const navigation = useNavigation();
  const goToWithLogin = useGoToWithLogin();
  const descArr = (min: number, max: number, coinType: string) => ([
    `例如您设置跟单金额 x ${coinType}，不论交易员下单多少本金，您的下单本金均为 x ${coinType}。单次最低跟单金额为 ${min} ${coinType}。`,
    '单日累计跟随本金为跟单金额的整数倍',
  ]);
  const coinDataArr = useRef<{id: number|string; symbol: string; num: number}[]>([]);

  const [maxValue, setMaxValue] = useState(0);
  const [minValue, setMinValue] = useState(0);
  // 跟随导师
  const [userName] = useState(name);
  // 跟单币种
  const [coinType, setCoinType] = useState('');
  // 跟单金额
  const [orderMoney, setOrderMoney] = useState('2');
  // 单日跟随本金
  const [dayMoney, setDayMoney] = useState('200');

  const addEvent = {
    selectCoin: () => {
      const close = showSelector({
        data: coinDataArr.current.map(item => item.symbol),
        selected: coinType,
        onPress: (value) => {
          if (typeof value !== 'string') return;
          const data = coinDataArr.current.filter(item => item.symbol === value)[0];
          setCoinType(value);
          setMinValue(data.num);
          setOrderMoney(`${data.num}`);
          setDayMoney(`${data.num * 100}`);
          setMaxValue(data.num * 1000);
          close();
        },
      });
    },
    setValue: (setType: React.Dispatch<React.SetStateAction<string>>, value: string) => {
      setType(() => {
        // const resultString = value.match(/[\d|\.]/g)?.join('');
        // if (!resultString) return '0';
        // let result = parseFloat(resultString);
        // if (type) {
        //   if (type === 'cut') (result > 1) && result--;
        //   if (type === 'add') result++;
        //   return result.toString();
        // }
        return value;
      });
    },
    verfiy: () => {
      let valueMessage = '';
      if (parseFloat(dayMoney) < parseFloat(orderMoney)) valueMessage = '单日跟随本金小于单次跟单金额';
      if (parseFloat(orderMoney) < minValue) valueMessage = '单次跟随金额低于最低金额';
      if ((parseFloat(dayMoney) / parseFloat(orderMoney)) % 1 !== 0) valueMessage = '单日累计跟随本金为跟单金额的整数倍';
      if (valueMessage) {
        showMessage({
          position: 'bottom',
          message: '跟随失败',
          description: valueMessage,
          type: 'warning',
        });
        return;
      }
      storage.get<number>('followAgreenType').then(data => {
        if (new Date().getTime() - data > 60 * 60 * 24) {
          addEvent.showModel();
          storage.save('followAgreenType', new Date().getTime());
        } else {
          addEvent.submit();
        }
      }).catch(() => {
        // 没有数据
        addEvent.showModel();
        storage.save('followAgreenType', new Date().getTime());
      });
    },
    showModel: () => {
      modalOutBg.outBgsetShow(true);
      modalOutBg.outBgsetChildren(
        <MyFollowAgreenmentOut
          close={() => {
            modalOutBg.outBgsetShow(false);
          }}
          success={() => {
            modalOutBg.outBgsetShow(false);
            addEvent.submit();
          }} />,
      );
    },
    submit: () => {
      ajax.post('/v1/track/action_track', {
        trackID: userId,
        contract_type: 1,
        symbol: coinDataArr.current.filter(item => item.symbol === coinType)[0].id,
        num: parseFloat(orderMoney),
        day_num: parseFloat(dayMoney),
      }).then(data => {
        if (data.status === 200) addEvent.submitSuccess();
        else {
          showMessage({
            position: 'bottom',
            message: data.message,
            type: 'warning',
          });
        }
      }).catch(err => console.log(err));
    },
    submitSuccess: () => {
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
          },
        },
      });
    },
  };

  useEffect(() => {
    ajax.get('/v1/track/edit_view?id=').then(data => {
      if (data.status === 200 && data.data.value) {
        coinDataArr.current = Object.keys(data.data.value).map((coin) => ({
          id: coin,
          num: data.data.value[coin],
          symbol: coin,
        }));
        setCoinType(coinDataArr.current[0].symbol);
        setMinValue(coinDataArr.current[0].num);
        setOrderMoney(`${coinDataArr.current[0].num}`);
        setDayMoney(`${coinDataArr.current[0].num * 100}`);
        setMaxValue(coinDataArr.current[0].num * 1000);
      }
    }).catch(err => console.log(err));
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
            {/* <TouchableNativeFeedback onPress={() => addEvent.setValue(setOrderMoney, orderMoney, 'cut')}>
              <View style={style.tabListBtn}>
                <StaticImage
                  resizeMode="contain"
                  style={style.tabListCut}
                  source={require('../../../assets/images/icons/cut.png')} />
              </View>
            </TouchableNativeFeedback> */}
            <TextInput
              style={style.tabListInput}
              keyboardType="numeric"
              value={orderMoney}
              onChange={e => addEvent.setValue(setOrderMoney, e.nativeEvent.text)} />
            {/* <TouchableNativeFeedback onPress={() => addEvent.setValue(setOrderMoney, orderMoney, 'add')}>
              <View style={style.tabListBtn}>
                <StaticImage
                  resizeMode="contain"
                  style={style.tabListAdd}
                  source={require('../../../assets/images/icons/add.png')} />
              </View>
            </TouchableNativeFeedback> */}
          </View>
          <Text style={style.tabListDesc}>{descArr(minValue, maxValue, coinType)[0]}</Text>
        </View>
        <View style={style.tabListView}>
          <Text style={style.tabListTitle}>单日跟随本金{coinType}</Text>
          <View style={style.tabListRight}>
            {/* <TouchableNativeFeedback onPress={() => addEvent.setValue(setDayMoney, dayMoney, 'cut')}>
              <View style={style.tabListBtn}>
                <StaticImage
                  resizeMode="contain"
                  style={style.tabListCut}
                  source={require('../../../assets/images/icons/cut.png')} />
              </View>
            </TouchableNativeFeedback> */}
            <TextInput
              style={style.tabListInput}
              keyboardType="number-pad"
              value={dayMoney}
              onChange={e => addEvent.setValue(setDayMoney, e.nativeEvent.text)} />
            {/* <TouchableNativeFeedback onPress={() => addEvent.setValue(setDayMoney, dayMoney, 'add')}>
              <View style={style.tabListBtn}>
                <StaticImage
                  resizeMode="contain"
                  style={style.tabListAdd}
                  source={require('../../../assets/images/icons/add.png')} />
              </View>
            </TouchableNativeFeedback> */}
          </View>
          <Text style={style.tabListDesc}>{descArr(minValue, maxValue, coinType)[1]}</Text>
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
    height: 40,
    fontSize: 14,
    borderWidth: 1,
    borderColor: themeGray,
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
