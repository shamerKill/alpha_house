// 选择栏
import React, { FC } from 'react';
import { View } from 'react-native';
import { Button, ListItem } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import { ScrollView } from 'react-native-gesture-handler';
import { modalOutBg } from './outBg';
import isIphoneX from '../../tools/isPhoneX';
import { defaultThemeColor, themeBlack } from '../../config/theme';

export type TypeShowSelector<T> = {
  title?: string;
  data: T[],
  selected: string
  onPress: ((value: T) => void),
};

const closeSelector = () => {
  modalOutBg.outBgsetShow(false);
  modalOutBg.outBgsetChildren(null);
};

const ComModalSelector: FC<TypeShowSelector<string|{data: string; before?: string; after?: string;}>> = ({
  data, selected, onPress, title,
}) => {
  const bottomHeight = isIphoneX() ? 30 : 0;
  const getData = data.map(item => {
    if (typeof item === 'string') return item;
    return `${item.before || ''}${item.data}${item.after || ''}`;
  });
  const showColor: boolean[] = data.map(item => {
    if (typeof item === 'string') return item === selected;
    return item.data === selected;
  });
  return (
    <View style={{
      position: 'absolute',
      bottom: bottomHeight,
      left: 0,
      width: '100%',
    }}>
      <View style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, overflow: 'hidden' }}>
        {
          title && (
            <ListItem
              title={title}
              titleStyle={{
                textAlign: 'center',
                fontSize: 18,
                color: themeBlack,
              }}
              bottomDivider />
          )
        }
        <ScrollView style={{
          maxHeight: 250,
        }}>
          {
          getData.map((item, index) => (
            <ListItem
              key={index}
              title={item}
              onPress={() => onPress(data[index])}
              titleStyle={{
                textAlign: 'center',
                fontSize: 16,
                color: showColor[index] ? defaultThemeColor : themeBlack,
              }}
              bottomDivider />
          ))
        }
        </ScrollView>
      </View>
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

const showSelector = (data: TypeShowSelector<string|{data: string; before?: string; after?: string;}>) => {
  modalOutBg.outBgsetChildren(<ComModalSelector {...data} />);
  modalOutBg.outBgsetShow(true);
  return closeSelector;
};

export default showSelector;
