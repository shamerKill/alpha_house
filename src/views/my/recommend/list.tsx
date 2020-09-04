import React, {
  FC, useState, useEffect, useRef,
} from 'react';
import {
  View, Text, StyleSheet, Keyboard, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { Input, Icon, Button } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import {
  defaultThemeSmallColor, themeTextGray, defaultThemeColor, defaultThemeBgColor, themeGray,
} from '../../../config/theme';
import ajax from '../../../data/fetch';
import { encryptionAccount } from '../../../tools/string';

export type TypeMyRecommendList = {
  searchFunc?: (search: string) => void;
  allNum: string;
  listArr: {
    upAccount: string;
    time: string;
    status: boolean; // true已实名，false未实名
    selfChildren: boolean; // true直推，false间推
    id: string;
  }[]
};
const listStyle = StyleSheet.create({
  list: {
    flex: 2,
    textAlign: 'center',
    lineHeight: 30,
    fontSize: 13,
  },
});
const MyRecommendListScreen: FC = () => {
  const prevInput = useRef('');
  const havePage = useRef(true);
  const loading = useRef(false);
  const [page, setPage] = useState(1); // 分页数量
  const [searchInput, setSearchInput] = useState(''); // 推荐列表数据
  const [listValue, setListValue] = useState<TypeMyRecommendList>({ allNum: '-', listArr: [] });

  const addEvent = {
    search: () => {
      if (searchInput === prevInput.current) return;
      prevInput.current = searchInput;
      loading.current = false;
      havePage.current = true;
      if (page === 1) {
        addEvent.getData();
      } else {
        setPage(1);
      }
      Keyboard.dismiss();
    },
    // 滚动至底部
    onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y; //滑动距离
      const contentSizeHeight = event.nativeEvent.contentSize.height; //scrollView contentSize高度
      const oriageScrollHeight = event.nativeEvent.layoutMeasurement.height; //scrollView高度
      if (offsetY + oriageScrollHeight >= contentSizeHeight) {
        if (havePage.current) setPage(state => state + 1);
      } else if (offsetY + oriageScrollHeight <= 1) {
        //这个是没有数据了然后给了false  得时候还在往上拉
      } else if (offsetY === 0) {
        //这个地方是下拉刷新，意思是到顶了还在指行，可以在这个地方进行处理需要刷新得数据
      }
    },
    getData: () => {
      if (loading.current) return;
      loading.current = true;
      ajax.get(`/v1/user/invite_list?search=${searchInput}&page=${page}`).then(data => {
        if (page === 1) setListValue(state => ({ ...state, listArr: [] }));
        if (data.status === 200) {
          if (data.data.data && data.data.data.length) {
            const result: TypeMyRecommendList['listArr'] = data.data.data.map((item: any) => {
              return {
                upAccount: encryptionAccount(item.data.mobile || item.data.email),
                time: item.data.create_time.split(' ')[0],
                status: item.data.realname_status === '4', // true已实名，false未实名
                selfChildren: item.relation === '直推', // true直推，false间推
                id: item.data.unique_id,
              };
            });
            setListValue(state => {
              return {
                allNum: data.data.all_number,
                listArr: state.listArr.concat(result),
              };
            });
          } else {
            havePage.current = false;
          }
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        loading.current = false;
      });
    },
  };

  useEffect(() => {
    addEvent.getData();
  }, [page]);

  return (
    <View style={{
      flex: 1,
    }}>
      <View style={{
        backgroundColor: defaultThemeSmallColor,
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 10,
      }}>
        <Text style={{
          lineHeight: 30,
          fontSize: 16,
          color: themeTextGray,
        }}>
          总人数:
        </Text>
        <Text style={{
          lineHeight: 30,
          fontSize: 16,
        }}>
          {listValue.allNum}人
        </Text>
      </View>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: defaultThemeBgColor,
        marginTop: 20,
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 5,
      }}>
        <Input
          placeholder="推荐账户/姓名"
          value={searchInput}
          onChangeText={setSearchInput}
          containerStyle={{
            flex: 5,
            height: 40,
          }}
          errorStyle={{
            height: 0,
          }}
          inputContainerStyle={{
            borderBottomWidth: 0,
            height: 40,
          }}
          inputStyle={{
            fontSize: 14,
          }}
          leftIcon={(
            <Icon
              name="search"
              size={24}
              color={themeGray} />
          )} />
        <Button
          containerStyle={{
            flex: 2,
          }}
          buttonStyle={{
            backgroundColor: defaultThemeColor,
          }}
          onPress={() => addEvent.search()}
          title="搜索" />
      </View>
      <View style={{
        flex: 1,
        paddingLeft: 10,
        paddingRight: 10,
      }}>
        <View style={{
          marginTop: 30,
          flexDirection: 'row',
          paddingBottom: 10,
        }}>
          {
            ['登录账户', '注册日期', '实名状态', '邀请关系'].map((item, index) => (
              <Text
                key={index}
                style={[
                  {
                    flex: 2,
                    textAlign: 'center',
                    color: themeGray,
                    fontSize: 15,
                  },
                  item === '登录账户' && { flex: 3 },
                ]}>
                {item}
              </Text>
            ))
          }
        </View>
        <ScrollView
          style={{
            flex: 1,
          }}
          onMomentumScrollEnd={addEvent.onMomentumScrollEnd}>
          {
            listValue.listArr.map(item => {
              return (
                <View
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    borderBottomColor: defaultThemeBgColor,
                    borderBottomWidth: 1,
                    paddingTop: 10,
                    paddingBottom: 10,
                  }}>
                  <Text style={[
                    listStyle.list,
                    { flex: 3 },
                  ]}>{item.upAccount}
                  </Text>
                  <Text style={listStyle.list}>{item.time}</Text>
                  <Text style={listStyle.list}>{item.status ? '已实名' : '未实名'}</Text>
                  <Text style={listStyle.list}>{item.selfChildren ? '直接' : '社区'}</Text>
                </View>
              );
            })
          }
        </ScrollView>
      </View>
    </View>
  );
};

export default MyRecommendListScreen;
