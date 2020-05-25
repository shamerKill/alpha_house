import React, { FC, useState } from 'react';
import { View, Text, StyleSheet, Keyboard } from 'react-native';
import { Input, Icon, Button } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import {
  defaultThemeSmallColor, themeTextGray, defaultThemeColor, defaultThemeBgColor, themeGray,
} from '../../../config/theme';

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
const MyRecommendListScreen: FC<{ input: TypeMyRecommendList }> = ({ input }) => {
  const [searchInput, setSearchInput] = useState('');
  let prevInput = '';

  const addEvent = {
    search: () => {
      if (!searchInput) return;
      if (searchInput === prevInput) return;
      prevInput = searchInput;
      input.searchFunc && input.searchFunc(searchInput);
      Keyboard.dismiss();
    },
  };

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
          {input.allNum}人
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
            ['推荐账户', '注册日期', '实名状态', '推荐关系'].map((item, index) => (
              <Text
                key={index}
                style={{
                  flex: 2,
                  textAlign: 'center',
                  color: themeGray,
                  fontSize: 15,
                }}>
                {item}
              </Text>
            ))
          }
        </View>
        <ScrollView style={{
          flex: 1,
        }}>
          {
            input.listArr.map(item => {
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
                  <Text style={listStyle.list}>{item.upAccount}</Text>
                  <Text style={listStyle.list}>{item.time}</Text>
                  <Text style={listStyle.list}>{item.status ? '已实名' : '未实名'}</Text>
                  <Text style={listStyle.list}>{item.selfChildren ? '直推' : '间推'}</Text>
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
