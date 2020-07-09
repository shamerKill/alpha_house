import React, { FC, useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Button } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import ComFormButton from '../../../components/form/button';
import { themeWhite, themeGray, defaultThemeBgColor } from '../../../config/theme';

export type TypeList = {
  title: string;
  list: ({name: string; id: number;}|number)[];
};
type TypeComMyOrderInfoLeftOutProp = {
  close: React.MutableRefObject<{
    close: () => void;
  } | undefined>;
  searchList: TypeList[];
  selectType: (types: string[]) => void;
  defaultSelect: string[];
};
const ComMyOrderInfoLeftOut: FC<TypeComMyOrderInfoLeftOutProp> = ({
  close, searchList, selectType, defaultSelect,
}) => {
  const [list] = useState<TypeList[]>(searchList || []);
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
    },
    selectType: () => {
      selectType(select);
      close.current?.close();
    },
  };

  useEffect(() => {
    setSelect(list.map((item, index) => {
      if (defaultSelect[index]) return defaultSelect[index];
      if (typeof item.list[0] === 'number') return '';
      return item.list[0].name;
    }));
    setSelectId(list.map((item, index) => {
      let showId = 0;
      item.list.forEach((li) => {
        if (!showId && typeof li !== 'number') showId = li.id;
        if (typeof li !== 'number' && li.name === defaultSelect[index]) {
          showId = li.id;
        }
      });
      return showId;
    }));
  }, []);
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
                            width: '33.33%',
                            marginTop: 5,
                            marginBottom: 5,
                          }}
                          style={{
                            height: 40,
                            width: '90%',
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
          onPress={addEvent.selectType}
          title="确认" />
      </View>
    </View>
  );
};

export default ComMyOrderInfoLeftOut;
