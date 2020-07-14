// 充值记录
import React, { FC, useState, useEffect } from 'react';
import { ListItem } from 'react-native-elements';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../../components/layout/head';
import { themeWhite, themeGray, themeBlack } from '../../../config/theme';
import ajax from '../../../data/fetch';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

const MyReachargeLogScreen: FC = () => {
  const [logs, setLogs] = useState<{type: string; num: string; time: string;}[]>([]);
  const [page, setPage] = useState(1);
  const [canLoad, setCanLoad] = useState(true);

  const addEvent = {
    // 滚动至底部
    onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y; //滑动距离
      const contentSizeHeight = event.nativeEvent.contentSize.height; //scrollView contentSize高度
      const oriageScrollHeight = event.nativeEvent.layoutMeasurement.height; //scrollView高度
      if (offsetY + oriageScrollHeight >= contentSizeHeight) {
        if (canLoad) setPage(state => state + 1);
      } else if (offsetY + oriageScrollHeight <= 1) {
        //这个是没有数据了然后给了false  得时候还在往上拉
      } else if (offsetY === 0) {
        //这个地方是下拉刷新，意思是到顶了还在指行，可以在这个地方进行处理需要刷新得数据
      }
    },
  };

  useEffect(() => {
    ajax.get(`/v1/recharge/log?offset=${page}`).then(data => {
      if (data.status === 200) {
        if (data.data.length === 0) setCanLoad(false);
        setLogs(state => {
          return state.concat(data?.data?.map((item: any) => {
            return {
              type: item.account,
              num: item.num,
              item: item.create_time,
            };
          }) || []);
        });
      } else {
        showMessage({
          message: data.message,
          type: 'warning',
        });
      }
    }).catch(err => {
      console.log(err);
    });
  }, [page]);
  return (
    <ComLayoutHead
      line
      title="充值记录"
      scrollStyle={{ backgroundColor: themeWhite }}
      onMomentumScrollEnd={addEvent.onMomentumScrollEnd}>
      {
        logs.map((item, index) => (
          <ListItem
            key={index}
            title={item.type}
            subtitle={item.time}
            subtitleStyle={{ color: themeGray, paddingTop: 5 }}
            rightTitle={`${item.num}USDT`}
            rightTitleStyle={{ color: themeBlack }}
            bottomDivider />
        ))
      }
    </ComLayoutHead>
  );
};

export default MyReachargeLogScreen;
