import React, { FC } from 'react';
import {
  View, Image, Text, StyleSheet,
} from 'react-native';
import { Button } from 'react-native-elements';
import { TypeMarketListLine } from './type';
import ComMarketLine from './com_line';
import { themeGray, defaultThemeBgColor, themeBlack } from '../../../config/theme';
import { useGoToWithLogin } from '../../../tools/routeTools';

const MarketSelfView: FC<{data: TypeMarketListLine[]}> = ({ data }) => {
  const goToWidthLogin = useGoToWithLogin();

  const addEvent = {
    addLine: () => {
      goToWidthLogin('MarketSearch');
    },
  };

  return (
    <View>
      {
        data.length === 0
        && (
          <View style={style.noDataView}>
            <Image
              resizeMode="contain"
              style={style.noDataImage}
              source={require('../../../assets/images/pic/market_no_coin.png')} />
            <Text style={style.noDataText}>您还没有收藏记录</Text>
            <Button
              containerStyle={style.noDataButtonContainer}
              buttonStyle={style.noDataButton}
              titleStyle={style.noDataButtonText}
              onPress={addEvent.addLine}
              title="添加自选" />
          </View>
        )
      }
      {
        data.map((item, index) => (
          <ComMarketLine key={index} data={item} />
        ))
      }
    </View>
  );
};

const style = StyleSheet.create({
  noDataView: {
    alignItems: 'center',
    paddingTop: 50,
  },
  noDataImage: {
    width: 200,
    height: 200,
  },
  noDataText: {
    color: themeGray,
    marginTop: -20,
  },
  noDataButtonContainer: {
    marginTop: 30,
    borderColor: themeGray,
    borderWidth: 1,
  },
  noDataButton: {
    backgroundColor: defaultThemeBgColor,
  },
  noDataButtonText: {
    color: themeBlack,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 14,
  },
});

export default MarketSelfView;
