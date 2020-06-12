import React, {
  FC, useState, useRef, useEffect,
} from 'react';
import {
  View, ActivityIndicator, Image, TouchableNativeFeedback, Text, StyleSheet, ScrollView, Animated,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import ComLayoutHead from '../../../components/layout/head';
import {
  themeWhite, defaultThemeColor, defaultThemeBgColor, themeTextGray, themeBlack, getThemeOpacity, themeRed,
} from '../../../config/theme';
import showComAlert from '../../../components/modal/alert';

type TypeSearchList = {
  name: string; // 交易对
  id: string|number; // id
  isFollow: boolean; // 是否已经关注
};

const MarketSearchList: FC<TypeSearchList&{followFunc: (id: TypeSearchList['id']) => void;}> = ({
  name,
  isFollow,
  followFunc,
  id,
}) => {
  return (
    <View style={style.listView}>
      <Text style={style.listTitle}>{name}</Text>
      <TouchableNativeFeedback onPress={() => followFunc(id)}>
        <View style={[
          style.listBtnView,
          isFollow ? style.listBtnViewFollow : style.listBtnViewNoFollow,
        ]}>
          <Text style={[
            style.listBtnText,
            isFollow ? style.listBtnTextFollow : style.listBtnTextNoFollow,
          ]}>
            { isFollow ? '取消关注' : '添加关注' }
          </Text>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
};

const MarketSearchScreen: FC = () => {
  const navigation = useNavigation();

  // 输入框
  const searchInput = useRef<TextInput>(null);

  // 搜索内容
  const [search, setSearch] = useState('');
  // 搜索历史列表
  const [historyList, setHistoryList] = useState<TypeSearchList[]>([]);
  // 搜索列表
  const [searchList, setSearchList] = useState<TypeSearchList[]>([]);
  // 搜索内容是否在请求中
  const [searchLoading, setSearchLoading] = useState(false);

  const addEvent = {
    // 收起键盘
    closeKey: () => {
      (searchInput.current as TextInput&{blur:()=>void})?.blur();
    },
    // 返回
    backPage: () => navigation.goBack(),
    // 右上角取消
    rightClose: () => {
      if (search !== '') setSearch('');
      else addEvent.backPage();
    },
    // 删除历史
    deleteHistory: () => {
      addEvent.closeKey();
      const close = showComAlert({
        title: '删除历史',
        desc: '是否要清空搜索历史?',
        success: {
          text: '确定',
          onPress: () => {
            setHistoryList([]);
            close();
          },
        },
        close: {
          text: '取消',
          onPress: () => close(),
        },
      });
    },
    // 添加/取消关注
    changeCoinFollow: (id: TypeSearchList['id']) => {
      setHistoryList(state => {
        return state.map(item => {
          const result = { ...item };
          if (item.id === id) result.isFollow = !item.isFollow;
          return result;
        });
      });
    },
  };

  // 处理搜索
  const searchLoadingTime = useRef(0);
  const loadingMarginTop = -40;
  const loadingAnimate = useRef(new Animated.Value(loadingMarginTop));
  useEffect(() => {
    if (search !== '') {
      // 如果不在请求中，添加显示动画
      if (!searchLoading) {
        Animated.timing(
          loadingAnimate.current, {
            toValue: 0,
            duration: 100,
            useNativeDriver: false,
          },
        ).start();
      }
      setSearchLoading(true);
      clearTimeout(searchLoadingTime.current);
      // 获取数据
      searchLoadingTime.current = Number(setTimeout(() => {
        setSearchList([
          { name: '搜索BTC/USDT 永续', id: 0, isFollow: false },
          { name: '搜索BTC/ETH', id: 1, isFollow: true },
          { name: '搜索ETH/USDT 永续', id: 2, isFollow: false },
        ]);
        // 关闭数据
        setSearchLoading(false);
        Animated.timing(
          loadingAnimate.current, {
            toValue: loadingMarginTop,
            duration: 100,
            useNativeDriver: false,
          },
        ).start();
      }, 1000));
    }
  }, [search]);

  // 进入
  useEffect(() => {
    // 调起键盘
    setTimeout(() => (searchInput.current as TextInput&{focus:()=>void})?.focus(), 200);
    setHistoryList([
      { name: 'BTC/USDT 永续', id: 0, isFollow: false },
      { name: 'BTC/ETH', id: 1, isFollow: true },
      { name: 'ETH/USDT 永续', id: 2, isFollow: false },
    ]);
  }, []);
  return (
    <ComLayoutHead
      close
      overScroll
      scrollStyle={{ backgroundColor: themeWhite }}>
      <View style={style.headView}>
        <View style={style.headViewSearch}>
          <Image
            resizeMode="contain"
            style={style.headViewSearchIcon}
            source={require('../../../assets/images/icons/search.png')} />
          <TextInput
            value={search}
            ref={searchInput}
            placeholder="请输入想要搜索的币种"
            style={style.headViewSearchInput}
            onChange={e => setSearch(e.nativeEvent.text)} />
        </View>
        <TouchableNativeFeedback onPress={() => addEvent.rightClose()}>
          <View style={style.headViewBtnView}>
            <Text style={style.headViewBtnText}>取消</Text>
          </View>
        </TouchableNativeFeedback>
      </View>
      {
        search === ''
          ? (
            // 搜索历史
            <View style={style.searchContentView}>
              <View style={style.searchHistoryTop}>
                <Text style={style.searchHistoryTopText}>搜索历史</Text>
                <TouchableNativeFeedback onPress={() => addEvent.deleteHistory()}>
                  <View style={style.searchHistoryTopView}>
                    <Image
                      resizeMode="contain"
                      style={style.searchHistoryTopIcon}
                      source={require('../../../assets/images/icons/delete.png')} />
                  </View>
                </TouchableNativeFeedback>
              </View>
              <ScrollView style={style.searchContentScrollView}>
                {
                  historyList.map(item => (
                    <MarketSearchList
                      {...item}
                      key={item.id}
                      followFunc={addEvent.changeCoinFollow} />
                  ))
                }
              </ScrollView>
            </View>
          ) : (
            // 当前搜索列表
            <ScrollView style={style.searchContentView}>
              <Animated.View style={{
                height: loadingMarginTop,
                alignItems: 'center',
                marginTop: loadingAnimate.current,
              }}>
                <ActivityIndicator
                  size="large"
                  color={defaultThemeColor} />
              </Animated.View>
              {
                searchList.map(item => (
                  <MarketSearchList
                    {...item}
                    key={item.id}
                    followFunc={addEvent.changeCoinFollow} />
                ))
              }
            </ScrollView>
          )
      }
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  headView: {
    flexDirection: 'row',
    borderBottomColor: defaultThemeBgColor,
    borderBottomWidth: 1,
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  headViewSearch: {
    backgroundColor: defaultThemeBgColor,
    flexDirection: 'row',
    borderRadius: 30,
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    flex: 1,
    height: 40,
  },
  headViewSearchIcon: {
    width: 20,
    height: 20,
    opacity: 0.4,
  },
  headViewSearchInput: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 10,
    height: 24,
    lineHeight: 24,
    paddingTop: 0,
    paddingBottom: 0,
  },
  headViewBtnView: {
    padding: 10,
    alignItems: 'center',
  },
  headViewBtnText: {
    fontSize: 16,
  },
  // 搜索内容
  searchContentView: {
    flex: 1,
    backgroundColor: defaultThemeBgColor,
  },
  // 搜索历史
  searchHistoryTop: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    borderBottomColor: defaultThemeBgColor,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: themeWhite,
  },
  searchHistoryTopText: {
    color: themeTextGray,
    fontWeight: 'bold',
  },
  searchHistoryTopView: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchHistoryTopIcon: {
    width: 20,
    height: 20,
    opacity: 0.4,
  },
  searchContentScrollView: {
    flex: 1,
  },
  // 单条记录
  listView: {
    backgroundColor: themeWhite,
    borderBottomColor: defaultThemeBgColor,
    borderBottomWidth: 1,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeBlack,
    lineHeight: 40,
  },
  listBtnView: {
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
  },
  listBtnViewFollow: {
    backgroundColor: getThemeOpacity(themeRed, 0.1),
    borderColor: themeRed,
  },
  listBtnViewNoFollow: {
    backgroundColor: getThemeOpacity(defaultThemeColor, 0.1),
    borderColor: defaultThemeColor,
  },
  listBtnText: {
  },
  listBtnTextFollow: {
    color: themeRed,
  },
  listBtnTextNoFollow: {
    color: defaultThemeColor,
  },
});

export default MarketSearchScreen;
