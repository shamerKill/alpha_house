import React, { FC } from 'react';
import { View, Text } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import ComLayoutHead from '../../../components/layout/head';

const ContractAllPositionScreen: FC = () => {
  const route = useRoute<RouteProp<{position: { coins: string[] }}, 'position'>>();
  const { coins } = route.params;
  return (
    <ComLayoutHead title="用户总持仓">
      {
        coins.map((item, index) => {
          return (
            <View key={index}>
              <Text>{item}</Text>
            </View>
          );
        })
      }
    </ComLayoutHead>
  );
};

export default ContractAllPositionScreen;
