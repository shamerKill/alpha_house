import React, { FC, useState, useEffect } from 'react';
import {
  View, Image, Text, TouchableNativeFeedback, StyleSheet,
} from 'react-native';
import ComLayoutHead from '../../../components/layout/head';
import { themeGray } from '../../../config/theme';
import ComLine from '../../../components/line';
import ajax from '../../../data/fetch';

const MytransferAccountsScreen: FC = () => {
  // 账户列表
  const [accountsList, setAccountsList] = useState<{
    name: string;
    canUse: string;
    symbol: string;
  }[]>([]);

  useEffect(() => {
    ajax.get('/contract/api/v1/bian/transfer_account_view').then(data => {
      if (data.status === 200) {
        setAccountsList([
          {
            name: '币币账户',
            canUse: data.data.coinAsset.account,
            symbol: data.data.coinAsset.symbol,
          },
          {
            name: 'USDT合约账户',
            canUse: data.data.usdtAsset.account,
            symbol: data.data.usdtAsset.symbol,
          },
        ]);
      }
    }).catch(err => {
      console.log(err);
    });
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
                  <Text style={style.listDesc}>可用{item.symbol}</Text>
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
