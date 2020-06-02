import React, { FC } from 'react';
import {
  View,
} from 'react-native';
import { TypeMarketListLine } from './type';
import ComMarketLine from './com_line';

const MarketGlobalView: FC<{data: TypeMarketListLine[]}> = ({ data }) => {
  return (
    <View>
      {
        data.map((item, index) => (
          <ComMarketLine key={index} data={item} />
        ))
      }
    </View>
  );
};

export default MarketGlobalView;
