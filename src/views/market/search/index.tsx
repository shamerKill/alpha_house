import React, {
  FC, useState, useRef, useEffect,
} from 'react';
import {
  View, Image, TouchableNativeFeedback, Text, StyleSheet, ScrollView,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../../components/layout/head';
import {
  themeWhite, defaultThemeColor, defaultThemeBgColor, themeTextGray, themeBlack, getThemeOpacity, themeRed,
} from '../../../config/theme';
import showComAlert from '../../../components/modal/alert';
import ajax from '../../../data/fetch';
import { EnumCoinType } from '../../../data/enum/coin';
import { ComMarketLineTypeView } from '../index/com_line';
import { TypeMarketListLine } from '../index/type';
import storage from '../../../data/database';

type TypeSearchList = {
  name: string; // 交易对
  symbol: string; // 币种symbol
  id: string|number; // id
  isFollow: boolean; // 是否已经关注
};

const MarketSearchList: FC<TypeSearchList&{followFunc: (id: TypeSearchList['id'], symbol: TypeSearchList['symbol']) => void;}> = ({
  name,
  isFollow,
  followFunc,
  id,
  symbol,
}) => {
  return (
    <View style={style.listView}>
      <View style={style.inListView}>
        <Text style={style.listTitle}>{name}</Text>
        <ComMarketLineTypeView
          type={Number(id) - 1 as TypeMarketListLine['type']}
          inputStyle={{
          }} />
      </View>
      <TouchableNativeFeedback onPress={() => followFunc(id, symbol)}>
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

  // 搜索数据库
  const searchDataBase = useRef<TypeSearchList[]>([]);

  // 输入框
  const searchInput = useRef<TextInput>(null);

  // 搜索内容
  const [search, setSearch] = useState('');
  // 搜索历史列表
  const [historyList, setHistoryList] = useState<string[]>([]);
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
    // 搜索
    submitSearch: (text: string) => {
      if (searchLoading) {
        showMessage({
          position: 'bottom',
          message: '数据加载中,请等待',
          type: 'info',
        });
        return;
      }
      const reg = new RegExp(text.toUpperCase().trim(), 'g');
      const filter = searchDataBase.current.filter(item => {
        return reg.test(item.symbol);
      });
      setSearchList(filter);
      setHistoryList(state => ([...state, text]));
    },
    // 添加/取消关注
    changeCoinFollow: (id: TypeSearchList['id'], symbol: TypeSearchList['symbol']) => {
      ajax.post('/v1/market/follow', {
        symbol,
        type: `${id}`,
      }).then(data => {
        console.log(data);
        if (data.status === 200) {
          setSearchList(state => {
            return state.map(item => {
              const result = { ...item };
              if (result.id === id && item.symbol === symbol) {
                result.isFollow = !result.isFollow;
              }
              return result;
            });
          });
        } else {
          showMessage({
            position: 'bottom',
            message: data.message,
            type: 'warning',
          });
        }
      }).catch(err => {
        console.log(err);
      });
    },
  };

  // 进入
  useEffect(() => {
    // 调起键盘
    setTimeout(() => (searchInput.current as TextInput&{focus:()=>void})?.focus(), 200);
    // 获取数据
    searchDataBase.current = [];
    setSearchLoading(true);
    Promise.all([ajax.get('/v1/market/follow'), ajax.get('/v1/market/trade_pair')]).then(([data1, data2]) => {
      const followData = data1.data;
      const allData = data2.data;
      if (data1.status === 200 && data2.status === 200) {
        Object.keys(allData).forEach((key: string) => {
          allData[key].forEach((coin: string) => {
            searchDataBase.current.push({
              name: coin.replace(/^(.+)USDT$/, '$1/USDT'),
              symbol: coin,
              id: EnumCoinType[key as any],
              isFollow: false,
            });
          });
        });
        searchDataBase.current = searchDataBase.current.map(item => {
          const result = {
            ...item,
          };
          const hasFollow = followData.filter((follow: any) => {
            if (Number(follow.type) === item.id && item.symbol === follow.symbol) {
              return true;
            }
            return false;
          });
          if (hasFollow.length) {
            result.isFollow = true;
          }
          return result;
        });
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
    // 搜索历史
    storage.get('searchData').then(data => {
      if (data) {
        setHistoryList(data);
      }
    }).catch(err => {
      console.log(err);
    });
  }, []);

  // 储存币种搜索历史
  useEffect(() => {
    storage.save('searchData', historyList);
  }, [historyList]);
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
            onChange={e => setSearch(e.nativeEvent.text)}
            onSubmitEditing={e => addEvent.submitSearch(e.nativeEvent.text)} />
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
                <View style={style.searchContentScrollViewLogs}>
                  {
                    historyList.map((item, index) => (
                      <TouchableNativeFeedback
                        key={index}
                        onPress={() => setSearch(item)}>
                        <View style={style.logsView}>
                          <Text style={style.logsViewText}>
                            {item}
                          </Text>
                        </View>
                      </TouchableNativeFeedback>
                    ))
                  }
                </View>
              </ScrollView>
            </View>
          ) : (
            // 当前搜索列表
            <ScrollView style={style.searchContentView}>
              {
                searchList.map((item, index) => (
                  <MarketSearchList
                    {...item}
                    key={index}
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
  inListView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeBlack,
    lineHeight: 40,
    paddingRight: 10,
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
  // 搜索历史
  searchContentScrollViewLogs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  logsView: {
    backgroundColor: themeWhite,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 3,
    margin: 5,
  },
  logsViewText: {
    fontSize: 18,
    color: themeTextGray,
  },
});

export default MarketSearchScreen;
