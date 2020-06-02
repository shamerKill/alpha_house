import React, { FC, useState, useEffect } from 'react';
import {
  View, TouchableNativeFeedback, Text, ScrollView, Image, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ComLayoutHead from '../../../components/layout/head';
import { defaultThemeColor, themeWhite, defaultThemeBgColor } from '../../../config/theme';
import { TypeMarketListLine } from '../index/type';
import { ComMarketLineTypeView } from '../index/com_line';
import showComAlert from '../../../components/modal/alert';

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

  const [listData, setListData] = useState<TypeMarketEditList[]>([]);
  // 是否全部选中
  const [listAllSelected, setListAllSelected] = useState(false);

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
      const selectLength = listData.filter(item => item.isSelected).length;
      if (selectLength === 0) return;
      const close = showComAlert({
        title: '',
        desc: `是否删除选中的${selectLength}条数据`,
        success: {
          text: '删除',
          onPress: () => {
            setListData(state => state.filter(item => !item.isSelected));
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
    setListData([
      {
        name: 'ETH/USD 永续', id: 'ETH/USD 永续', isSelected: false, type: 1,
      },
      {
        name: 'BTC/USD 永续', id: 'BTC/USD 永续', isSelected: false, type: 2,
      },
      { name: 'EOS/USD 永续', id: 'EOS/USD 永续', isSelected: false },
    ]);
  }, []);

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
