import React, { FC, useState, useEffect } from 'react';
import {
  View, TouchableNativeFeedback, Text, ScrollView, Image, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../../components/layout/head';
import { defaultThemeColor, themeWhite, defaultThemeBgColor } from '../../../config/theme';
import { TypeMarketListLine } from '../index/type';
import { ComMarketLineTypeView } from '../index/com_line';
import showComAlert from '../../../components/modal/alert';
import ajax from '../../../data/fetch';
import useGetDispatch from '../../../data/redux/dispatch';
import { InState } from '../../../data/redux/state';

type TypeMarketEditList = {
  name: TypeMarketListLine['name'];
  id: TypeMarketListLine['id'];
  isSelected: boolean; // 是否选中
  type?: TypeMarketListLine['type'];
};

const selectImages = [
  () => require('../../../assets/images/icons/no_selected.png'),
  () => require('../../../assets/images/icons/selected.png'),
];

const MarketEditList: FC<TypeMarketEditList & {onPress: (id: TypeMarketEditList['id']) => void}> = ({
  name,
  isSelected,
  type,
  onPress,
  id,
}) => {
  return (
    <View style={style.listView}>
      <TouchableNativeFeedback
        onPress={() => onPress(id)}
        background={TouchableNativeFeedback.SelectableBackgroundBorderless()}>
        <View style={style.listSelectView}>
          <Image
            style={style.listSelectIcon}
            resizeMode="contain"
            source={selectImages[Number(isSelected)]()} />
        </View>
      </TouchableNativeFeedback>
      <View style={style.listTextView}>
        <Text style={style.listText}>{name}</Text>
        {
          type !== undefined
          && <ComMarketLineTypeView type={type} inputStyle={style.listTextAfterView} />
        }
      </View>
    </View>
  );
};

const MarketEdit: FC = () => {
  const navigation = useNavigation();

  const [routePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');

  const [listData, setListData] = useState<TypeMarketEditList[]>([]);
  // 是否全部选中
  const [listAllSelected, setListAllSelected] = useState(false);
  // 是否在请求中
  const [searchLoading, setSearchLoading] = useState(false);

  const addEvent = {
    // 全选按钮
    selectAllBtn: () => {
      setListAllSelected(allState => {
        setListData(state => state.map(item => {
          const result = { ...item };
          result.isSelected = !allState;
          return result;
        }));
        return !allState;
      });
    },
    // 单个点击按钮
    listSelectBtn: async (id: TypeMarketListLine['id']) => {
      let allSelectLength = 0;
      setListData(state => state.map((item, index) => {
        const result = { ...item };
        if (result.id === id) result.isSelected = !result.isSelected;
        if (result.isSelected) allSelectLength++;
        if (index === listData.length - 1) {
          if (allSelectLength === listData.length) {
            setListAllSelected(true);
          } else {
            setListAllSelected(false);
          }
        }
        return result;
      }));
    },
    // 删除
    deleteList: () => {
      if (searchLoading) return;
      const deleteCoins = listData.filter(item => item.isSelected);
      const selectLength = listData.filter(item => item.isSelected).length;
      if (selectLength === 0) return;
      const close = showComAlert({
        desc: `是否删除选中的${selectLength}条数据`,
        success: {
          text: '删除',
          onPress: () => {
            Promise.all(deleteCoins.map(item => ajax.post('/v1/market/follow', { symbol: item.id, type: 2 }))).then((data) => {
              const error = data.filter(item => item.status !== 200);
              if (error.length === 0) {
                setListData(state => state.filter(item => !item.isSelected));
                showMessage({
                  position: 'bottom',
                  message: '删除成功',
                  type: 'success',
                });
              } else {
                showMessage({
                  position: 'bottom',
                  message: error[0].message,
                  type: 'warning',
                });
              }
            }).catch(() => {
              showMessage({
                position: 'bottom',
                message: '网络有误，删除失败',
                type: 'success',
              });
            });
            close();
          },
        },
        close: {
          text: '取消',
          onPress: () => close(),
        },
      });
    },
  };

  useEffect(() => {
    // 获取数据
    setSearchLoading(true);
    if (routePage !== 'MarketEdit') return;
    Promise.all([ajax.get('/v1/market/follow'), ajax.get('/v1/market/trade_pair')]).then(([data1, data2]) => {
      const followData: string[] = data1.data.map((item: any) => item.symbol);
      const allData = data2.data;
      if (data1.status === 200 && data2.status === 200) {
        const result: TypeMarketEditList[] = [];
        Object.keys(allData).forEach((key: string) => {
          if (key === 'cash') return;
          allData[key].forEach((coin: string) => {
            if (followData.includes(coin)) {
              result.push({
                name: coin.replace(/^(.+)USDT$/, '$1/USDT'),
                id: coin,
                isSelected: false,
                type: 1,
              });
            }
          });
        });
        setListData(result);
      } else if (data1.status === 200) {
        showMessage({
          position: 'bottom',
          message: data2.data,
          type: 'warning',
        });
      } else {
        showMessage({
          position: 'bottom',
          message: data1.data,
          type: 'warning',
        });
      }
    }).catch(err => {
      console.log(err);
    }).finally(() => {
      setSearchLoading(false);
    });
  }, [routePage]);

  return (
    <ComLayoutHead
      overScroll
      title="自选管理"
      rightComponent={(
        <TouchableNativeFeedback onPress={() => navigation.navigate('MarketSearch')}>
          <Text style={{ color: defaultThemeColor, fontSize: 15 }}>添加自选</Text>
        </TouchableNativeFeedback>
      )}>
      <SafeAreaView style={style.listSafeView}>
        <ScrollView style={style.listScrollView}>
          {
            listData.map(item => (
              <MarketEditList
                key={item.id}
                onPress={addEvent.listSelectBtn}
                {...item} />
            ))
          }
        </ScrollView>
        {/* 底部选项 */}
        <View style={style.bottomView}>
          <TouchableNativeFeedback onPress={() => addEvent.selectAllBtn()}>
            <View style={style.bottomLeft}>
              <Image
                style={style.bottomLeftIcon}
                resizeMode="contain"
                source={selectImages[Number(listAllSelected)]()} />
              <Text style={style.bottomLeftText}>全选</Text>
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback onPress={() => addEvent.deleteList()}>
            <View style={style.bottomRight}>
              <Image
                style={style.bottomRightIcon}
                resizeMode="contain"
                source={require('../../../assets/images/icons/delete_default.png')} />
              <Text style={style.bottomRightText}>
                删除({listData.filter(item => item.isSelected).length})
              </Text>
            </View>
          </TouchableNativeFeedback>
        </View>
      </SafeAreaView>
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  listSafeView: {
    flex: 1,
  },
  listScrollView: {
    flex: 1,
  },
  // 列表
  listView: {
    backgroundColor: themeWhite,
    borderBottomWidth: 1,
    borderBottomColor: defaultThemeBgColor,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listSelectView: {
    padding: 10,
  },
  listSelectIcon: {
    width: 20,
    height: 20,
  },
  listTextView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listText: {
    fontSize: 16,
  },
  listTextAfterView: {
    height: 40,
    marginTop: 0,
  },
  // 底部
  bottomView: {
    backgroundColor: themeWhite,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  bottomLeftIcon: {
    width: 24,
    height: 24,
  },
  bottomLeftText: {
    fontSize: 16,
    paddingLeft: 10,
  },
  bottomRight: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomRightIcon: {
    width: 20,
    height: 20,
  },
  bottomRightText: {
    fontSize: 16,
    paddingLeft: 10,
    color: defaultThemeColor,
  },
});

export default MarketEdit;
