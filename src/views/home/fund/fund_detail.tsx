import React, {
  FC, useState, useCallback, useEffect,
} from 'react';
import { Text, TouchableNativeFeedback, View } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../../components/layout/head';
import {
  defaultThemeColor, themeWhite, defaultThemeBgColor, themeBlack, themeRed, themeTextGray, themeBlue, defaultThemeSmallColor,
} from '../../../config/theme';
import ComFormButton from '../../../components/form/button';
import { modalOutBg } from '../../../components/modal/outBg';
import HomeFundDetailAgreement from './fund_detail_agreement';
import { useGoToWithLogin } from '../../../tools/routeTools';
import ajax from '../../../data/fetch';
import { biNumberToSymbol } from '../../../tools/number';
import useGetDispatch from '../../../data/redux/dispatch';
import { InState } from '../../../data/redux/state';

const FundCard: FC<{
  title: string;
}> = ({
  title,
  children,
}) => {
  return (
    <View style={{
      backgroundColor: themeWhite, marginBottom: 10, paddingTop: 10,
    }}>
      <View style={{
        paddingLeft: 30,
        borderBottomColor: defaultThemeBgColor,
        borderBottomWidth: 1,
        paddingBottom: 10,
      }}>
        <Text style={{ fontSize: 16, lineHeight: 30 }}>{title}</Text>
      </View>
      <View style={{
        paddingLeft: 30, paddingRight: 30, paddingTop: 5, paddingBottom: 5,
      }}>{children}
      </View>
    </View>
  );
};

const HomeFundDetail: FC = () => {
  const [routePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');
  const gotoWith = useGoToWithLogin();
  const [agreenMent, setAgreenMent] = useState(false);

  const goToBuy = useCallback(() => {
    if (!agreenMent) {
      showMessage({
        position: 'bottom',
        type: 'warning',
        message: '请阅读并同意《电子协议》',
      });
    } else {
      gotoWith('HomeFundSubmit', {
        surplusNum,
      });
    }
  }, [agreenMent]);

  const showAgreement = useCallback(() => {
    modalOutBg.outBgsetShow(true);
    modalOutBg.outBgsetChildren(
      <HomeFundDetailAgreement
        success={() => {
          modalOutBg.outBgsetShow(false);
        }} />,
    );
  }, []);

  const [title, setTitle] = useState(''); // 标题
  const [ratio, setRatio] = useState(''); // 收益率
  const [time, setTime] = useState(''); // 认购期限
  const [startNum, setStartNum] = useState(''); // 起购金额
  const [allNum, setAllNum] = useState(''); // 总金额
  const [surplusNum, setSurplusNum] = useState(''); // 剩余金额
  const [endTime, setEndTime] = useState(''); // 结束时间

  const getDetail = () => {
    ajax.get('/v1/fund/fund').then(data => {
      if (data.status === 200) {
        setTitle(data.data.title);
        setRatio(data.data.earnings_rate);
        setTime(data.data.cycle);
        setStartNum(`${data.data.min}`);
        setAllNum(`${data.data.number}`);
        setSurplusNum(`${data.data.surplus_number}`);
        setEndTime(data.data.end_time);
      }
    }).catch(err => {
      console.log(err);
    });
  };

  useEffect(() => {
    if (routePage !== 'HomeFundDetail') return;
    getDetail();
  }, [routePage]);

  return (
    <ComLayoutHead
      title={title}
      rightComponent={(
        <TouchableNativeFeedback onPress={() => gotoWith('HomeFundLogs')}>
          <Text style={{ color: defaultThemeColor, fontSize: 15 }}>订单记录</Text>
        </TouchableNativeFeedback>
      )}
      bottomCompoent={(
        <View style={{
          backgroundColor: themeWhite,
          alignItems: 'center',
          borderTopColor: defaultThemeBgColor,
          borderTopWidth: 10,
        }}>
          <Text style={{ textAlign: 'center', lineHeight: 30, color: themeTextGray }}>
            剩余额度：<Text style={{ color: themeBlue }}>{biNumberToSymbol(surplusNum)}USDT</Text>
          </Text>
          <View style={{
            width: '80%',
            height: 3,
            backgroundColor: defaultThemeBgColor,
            marginBottom: 10,
            borderRadius: 3,
            overflow: 'hidden',
          }}>
            <View style={{
              width: `${((parseFloat(allNum) - parseFloat(surplusNum)) / parseFloat(allNum)) * 100}%`,
              height: '100%',
              backgroundColor: defaultThemeColor,
            }} />
          </View>
          <ComFormButton
            containerStyle={{ width: '100%' }}
            title="立即认购"
            onPress={goToBuy} />
        </View>
      )}>
      <View style={{
        backgroundColor: themeWhite, paddingLeft: 50, paddingRight: 50, marginBottom: 10,
      }}>
        <View style={{
          height: 80, justifyContent: 'center', alignItems: 'center', borderBottomColor: defaultThemeBgColor, borderBottomWidth: 1,
        }}>
          <Text style={{ color: themeBlack, fontSize: 14 }}>预期月化收益</Text>
          <Text style={{
            color: themeRed, fontSize: 20, fontWeight: 'bold', paddingTop: 5,
          }}>
            {ratio}
          </Text>
        </View>
        <View style={{
          flexDirection: 'row', justifyContent: 'space-around', height: 60, alignItems: 'center',
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text>{time}</Text>
            <Text style={{ fontSize: 12, color: themeTextGray, paddingTop: 5 }}>认购期限</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text>{biNumberToSymbol(startNum)}USDT</Text>
            <Text style={{ fontSize: 12, color: themeTextGray, paddingTop: 5 }}>起购金额</Text>
          </View>
        </View>
      </View>
      <FundCard title="认购流程">
        <View style={{
          position: 'relative',
          flexDirection: 'row',
          paddingTop: 15,
          paddingBottom: 10,
          alignItems: 'center',
        }}>
          <View style={{
            position: 'absolute',
            top: 10,
            left: '5%',
            width: '90%',
            height: 3,
            backgroundColor: defaultThemeSmallColor,
          }}>
            <View style={{
              position: 'absolute',
              top: -1,
              left: 0,
              width: 5,
              height: 5,
              backgroundColor: defaultThemeColor,
              borderRadius: 10,
            }} />
            <View style={{
              position: 'absolute',
              top: -1,
              left: '50%',
              marginLeft: -3,
              width: 5,
              height: 5,
              backgroundColor: defaultThemeColor,
              borderRadius: 10,
            }} />
            <View style={{
              position: 'absolute',
              top: -1,
              right: 0,
              width: 5,
              height: 5,
              backgroundColor: defaultThemeColor,
              borderRadius: 10,
            }} />
          </View>
          <View style={{ paddingTop: 10, width: '33%', alignItems: 'flex-start' }}>
            <Text style={{ color: defaultThemeColor }}>今日申购</Text>
          </View>
          <View style={{ paddingTop: 10, width: '33%', alignItems: 'center' }}>
            <Text>次日起息</Text>
          </View>
          <View style={{ paddingTop: 10, width: '33%', alignItems: 'flex-end' }}>
            <Text>到期赎回</Text>
          </View>
        </View>
      </FundCard>
      <FundCard title="产品详情">
        <Text style={{ color: themeTextGray, fontSize: 14, lineHeight: 24 }}>认购币种：USDT</Text>
        <Text style={{ color: themeTextGray, fontSize: 14, lineHeight: 24 }}>收益方式：预期月化收益{ratio}</Text>
        <Text style={{ color: themeTextGray, fontSize: 14, lineHeight: 24 }}>产品额度：{biNumberToSymbol(allNum)}USDT</Text>
        <Text style={{ color: themeTextGray, fontSize: 14, lineHeight: 24 }}>额度限制：{biNumberToSymbol(startNum)}USDT起购，每人认购无上限</Text>
        <Text style={{ color: themeTextGray, fontSize: 14, lineHeight: 24 }}>时间限制：即日起到{endTime},或购完为止</Text>
        <Text style={{ color: themeTextGray, fontSize: 14, lineHeight: 24 }}>时区：UTC+8</Text>
        <Text style={{ color: themeTextGray, fontSize: 14, lineHeight: 24 }}>投资期限：{time}</Text>
        <Text style={{ color: themeTextGray, fontSize: 14, lineHeight: 24 }}>基金类型：契约式（到期赎回）</Text>
      </FundCard>
      <FundCard title="产品简介">
        <Text style={{ color: themeTextGray, fontSize: 14, lineHeight: 24 }}>
          本基金为AlfaEx平台孵化DeFi项目综合类基金，是AlfaEX面向用户提供的广告聚合类型服务功能项目，为AlfaEX用户提供外部资产端固定周期增币项目的投资选择。AlfaEX通过优选资产服务商，为用户提供多样低风险的投资机会。
        </Text>
        <View style={{ alignItems: 'center' }}>
          <CheckBox
            containerStyle={{
              borderWidth: 0,
              backgroundColor: themeWhite,
              paddingTop: 20,
              paddingBottom: 10,
            }}
            checked={agreenMent}
            size={20}
            checkedColor={defaultThemeColor}
            onPress={() => setAgreenMent(state => !state)}
            title={(
              <View style={{
                flexDirection: 'row', justifyContent: 'center',
              }}>
                <Text style={{ color: themeBlack }}>
                  我已阅读并同意
                </Text>
                <TouchableNativeFeedback onPress={showAgreement}><Text style={{ color: themeBlue }}>《电子协议》</Text></TouchableNativeFeedback>
              </View>
          )} />
        </View>
      </FundCard>
    </ComLayoutHead>
  );
};

export default HomeFundDetail;
