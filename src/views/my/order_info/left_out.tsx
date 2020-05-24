import React, { FC, useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Button } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import ComFormButton from '../../../components/form/button';
import { themeWhite, themeGray, defaultThemeBgColor } from '../../../config/theme';

type TypeComMyOrderInfoLeftOutProp = {
  close: React.MutableRefObject<{
    close: () => void;
  } | undefined>;
};
const ComMyOrderInfoLeftOut: FC<TypeComMyOrderInfoLeftOutProp> = ({ close }) => {
  type TypeList = {
    title: string;
    list: ({name: string; id: number;}|number)[];
  };
  const [list, setList] = useState<TypeList[]>([]);
  const [select, setSelect] = useState<string[]>([]);
  const [selectId, setSelectId] = useState<number[]>([]);


  const addEvent = {
    changeSelect: (name: string, id: number, index: number) => {
      setSelectId(state => {
        const result = [...state];
        result[index] = id;
        return result;
      });
      setSelect(state => {
        const result = [...state];
        result[index] = name;
        return result;
      });
      console.log(select);
    },
  };

  useEffect(() => {
    setList([
      { title: '时间', list: [{ name: '最近七天', id: 1 }, { name: '七天以前', id: 2 }, Math.random()] },
      { title: '币种', list: [{ name: '全部', id: 3 }, { name: 'USDT', id: 4 }, Math.random()] },
      {
        title: '类型',
        list: [
          { name: '全部', id: 5 }, { name: '充值', id: 6 }, { name: '提现', id: 7 },
          { name: '转入', id: 8 }, { name: '转出', id: 9 }, { name: '手续费', id: 2 },
        ],
      },
    ]);
  }, []);
  useEffect(() => {
    setSelect(() => list.filter(item => typeof item !== 'number').map((item) => (item.list[0] as {name: string; id: number;}).name));
    setSelectId(() => list.filter(item => typeof item !== 'number').map((item) => (item.list[0] as {name: string; id: number;}).id));
  }, [list]);
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{
        flex: 1,
      }}>
        {
          list.map((item, index) => (
            <View
              key={index}
              style={{
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 10,
                paddingBottom: 10,
              }}>
              <Text style={{
                fontSize: 18,
                paddingBottom: 5,
              }}>
                {item.title}
              </Text>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}>
                {
                  item.list.map(btn => (
                    typeof btn !== 'number' && btn
                      ? (
                        <ComFormButton
                          key={btn.id}
                          title={btn.name}
                          gray={btn.id !== selectId[index]}
                          onPress={() => addEvent.changeSelect(btn.name, btn.id, index)}
                          containerStyle={{
                            width: '33%',
                            marginTop: 5,
                            marginBottom: 5,
                          }}
                          style={{
                            height: 40,
                          }}
                          fontStyle={{
                            fontSize: 12,
                          }} />
                      )
                      : (
                        <View
                          key={btn}
                          style={{
                            width: '33%',
                            height: 40,
                          }} />
                      )
                  ))
                }
              </View>
            </View>
          ))
        }
      </ScrollView>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
        <Button
          containerStyle={{
            flex: 1,
            borderRadius: 0,
          }}
          buttonStyle={{
            height: 60,
            borderRadius: 0,
            backgroundColor: themeWhite,
            borderTopColor: defaultThemeBgColor,
            borderTopWidth: 1,
            borderBottomColor: defaultThemeBgColor,
            borderBottomWidth: 1,
          }}
          titleStyle={{
            color: themeGray,
          }}
          onPress={close.current?.close}
          title="取消" />
        <ComFormButton
          containerStyle={{
            flex: 1,
            borderRadius: 0,
          }}
          style={{
            height: 60,
            width: '100%',
            borderRadius: 0,
          }}
          onPress={close.current?.close}
          title="确认" />
      </View>
    </View>
  );
};

export default ComMyOrderInfoLeftOut;
