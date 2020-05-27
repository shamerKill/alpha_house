import React, { FC } from 'react';
import {
  TouchableNativeFeedback, Text, StyleSheet,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import ComLayoutHead from '../../../components/layout/head';
import { defaultThemeColor } from '../../../config/theme';
import ComLine from '../../../components/line';

const MyFollowEditScreen: FC = () => {
  const { params: { id: orderId } } = useRoute<RouteProp<{followEdit: { id: string|number }}, 'followEdit'>>();
  console.log(orderId);
  return (
    <ComLayoutHead
      title="编辑订单"
      rightComponent={(
        <TouchableNativeFeedback>
          <Text style={style.titleRight}>取消跟随</Text>
        </TouchableNativeFeedback>
      )}>
      <ComLine />
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  titleRight: {
    color: defaultThemeColor,
    textAlign: 'right',
    lineHeight: 50,
  },
});

export default MyFollowEditScreen;
