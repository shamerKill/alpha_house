import React, { FC, useState, useEffect } from 'react';
import {
  View, Image, Text, TouchableNativeFeedback, StyleSheet,
} from 'react-native';
import ComLayoutHead from '../../components/layout/head';
import { themeGray, themeTextGray } from '../../config/theme';
import ComLine from '../../components/line';
import ajax from '../../data/fetch';

const MyAssetsScreen: FC = () => {
  // 账户列表
  const [accountsList, setAccountsList] = useState<{
    name: string;
    canUse: string;
    symbol: string;
    type: 'dir'|'node';
  }[]>([]);

  useEffect(() => {
    const getData = async () => {
      // 账户列表
      const accountList = await ajax.get('/v1/account/list');
      if (accountList.status !== 200) return;
      // 币币列表
      const coinList = await ajax.get('/v1/account/coin_list');
      if (coinList.status !== 200) return;
      const list: typeof accountsList = [];
      list.push({
        name: 'USDT合约账户',
        canUse: accountList.data.usdtContractAccount,
        symbol: 'USDT',
        type: 'dir',
      });
      list.push({
        name: '币币账户',
        canUse: accountList.data.coinAccount,
        symbol: 'USDT',
        type: 'dir',
      });
      coinList.data?.map((item: any) => {
        list.push({
          name: `${item.symbol}`,
          canUse: item.account,
          symbol: item.symbol,
          type: 'node',
        });
      });
      setAccountsList(list);
    };
    try {
      getData();
    } catch (err) {
      console.log(err);
    }
  }, []);
  return (
    <ComLayoutHead
      title="资产列表">
      <ComLine height={10} />
      {
        accountsList.map((item, index) => (
          <View key={index} style={[style.listView, item.type === 'node' && { marginLeft: 10 }]}>
            <TouchableNativeFeedback>
              <View style={[
                style.listInnerView,
                item.type === 'node' && {
                  paddingTop: 5, paddingBottom: 5, marginTop: 5, marginBottom: 5,
                },
              ]}>
                <Image
                  style={style.listRound}
                  resizeMode="contain"
                  source={
                    item.type === 'dir' ? require('../../assets/images/icons/list_round.png') : require('../../assets/images/icons/news_info.png')
                  } />
                <Text style={[
                  style.listName,
                  item.type === 'node' && { color: themeTextGray },
                ]}>
                  {item.name}
                </Text>
                <View style={style.listRight}>
                  <Text style={style.listPrice}>{item.canUse}</Text>
                  <Text style={style.listDesc}>
                    {item.name === '币币账户' ? '≈' : '可用'}
                    {item.symbol}
                  </Text>
                </View>
              </View>
            </TouchableNativeFeedback>
            <View style={style.accountViewBg}>
              <Image
                style={style.accountViewBgImage}
                resizeMode="stretch"
                source={require('../../assets/images/pic/card_bg.png')} />
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
    alignItems: 'flex-end',
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

export default MyAssetsScreen;
