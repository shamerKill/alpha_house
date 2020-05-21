// 选择栏
import React, { FC } from 'react';
import { View } from 'react-native';
import { Button, ListItem } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import { ScrollView } from 'react-native-gesture-handler';
import { modalOutBg } from './outBg';
import isIphoneX from '../../tools/isPhoneX';
import { defaultThemeColor, themeBlack } from '../../config/theme';

type TypeShowSelector = {
  data: string[],
  selected: string,
  onPress: (value: string) => void,
};

const closeSelector = () => {
  modalOutBg.outBgsetShow(false);
  modalOutBg.outBgsetChildren(undefined);
};


const ComModalSelector: (data: TypeShowSelector) => FC<TypeShowSelector> = ({ data, selected, onPress }) => () => {
  console.log(data, selected, onPress);
  const bottomHeight = isIphoneX() ? 30 : 0;
  return (
    <View style={{
      position: 'absolute',
      bottom: bottomHeight,
      left: 0,
      width: '100%',
    }}>
      <ScrollView style={{
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        backgroundColor: '#fff',
        maxHeight: 250,
      }}>
        {
          data.map((item, index) => (
            <ListItem
              key={index}
              title={item}
              onPress={() => onPress(item)}
              titleStyle={{
                textAlign: 'center',
                fontSize: 16,
                color: item === selected ? defaultThemeColor : themeBlack,
              }}
              bottomDivider />
          ))
        }
      </ScrollView>
      <Button
        ViewComponent={LinearGradient}
        buttonStyle={{ height: 50 }}
        titleStyle={{ fontSize: 16 }}
        linearGradientProps={{
          colors: ['#8570fe', '#4c33ff'],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
        }}
        onPress={closeSelector}
        title="取消" />
    </View>
  );
};

const showSelector = (data: TypeShowSelector) => {
  modalOutBg.outBgsetChildren(ComModalSelector(data));
  modalOutBg.outBgsetShow(true);
  return closeSelector;
};

export default showSelector;
