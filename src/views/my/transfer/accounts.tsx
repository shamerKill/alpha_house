import React, { FC, useState, useEffect } from 'react';
import {
  View, Image, Text, TouchableNativeFeedback, StyleSheet,
} from 'react-native';
import ComLayoutHead from '../../../components/layout/head';
import { themeGray } from '../../../config/theme';
import ComLine from '../../../components/line';

const MytransferAccountsScreen: FC = () => {
  // 币种
  const coinType = 'USDT';
  // 账户列表
  const [accountsList, setAccountsList] = useState<{
    name: string;
    canUse: string;
  }[]>([]);

  useEffect(() => {
    setAccountsList([
      { name: '充值提现账户', canUse: '109.1' },
      { name: '币币账户', canUse: '119.1' },
      { name: 'USDT合约账户', canUse: '129.1' },
      { name: '混合合约账户', canUse: '139.1' },
    ]);
  }, []);
  return (
    <ComLayoutHead
      title="选择账户">
      <ComLine height={10} />
      {
        accountsList.map((item, index) => (
          <View key={index} style={style.listView}>
            <TouchableNativeFeedback>
              <View style={style.listInnerView}>
                <Image
                  style={style.listRound}
                  resizeMode="contain"
                  source={require('../../../assets/images/icons/list_round.png')} />
                <Text style={style.listName}>{item.name}</Text>
                <View style={style.listRight}>
                  <Text style={style.listPrice}>{item.canUse}</Text>
                  <Text style={style.listDesc}>可用{coinType}</Text>
                </View>
              </View>
            </TouchableNativeFeedback>
            <View style={style.accountViewBg}>
              <Image
                style={style.accountViewBgImage}
                resizeMode="stretch"
                source={require('../../../assets/images/pic/card_bg.png')} />
            </View>
          </View>
        ))
      }
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  listView: {
  },
  listInnerView: {
    margin: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listRound: {
    width: 15,
    height: 15,
  },
  listName: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 10,
  },
  listRight: {
    alignItems: 'center',
  },
  listPrice: {
    fontWeight: 'bold',
    paddingBottom: 5,
  },
  listDesc: {
    fontSize: 12,
    color: themeGray,
  },
  accountViewBg: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: -1,
  },
  accountViewBgImage: {
    height: '100%',
    width: '100%',
  },
});

export default MytransferAccountsScreen;
