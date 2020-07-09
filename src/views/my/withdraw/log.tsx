// 充值记录
import React, {
  FC, useState, useEffect, useRef,
} from 'react';
import { ListItem } from 'react-native-elements';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import ComLayoutHead from '../../../components/layout/head';
import {
  themeWhite, themeGray, themeBlack, themeRed,
} from '../../../config/theme';
import ajax from '../../../data/fetch';

const MyWithdrawLogScreen: FC = () => {
  const statusArr = ['审核中', '已通过', '已驳回'];
  const canLoading = useRef(true);
  const [page, setPage] = useState(1);

  const [logs, setLogs] = useState<{type: string; num: string; time: string; status: 0|1|2; coin: string}[]>([]);

  const addEvent = {
    getData: () => {
      ajax.get(`/v1/withdraw/log?page=${page}`).then(data => {
        if (data.status === 200) {
          if (data.data.length) {
            setLogs(state => {
              return state.concat(data.data.map((item: any) => {
                return {
                  type: `提至:${item.to}`,
                  num: item.num,
                  time: item.create_time,
                  status: Number(item.status) - 1,
                  coin: item.symbol,
                };
              }));
            });
          } else {
            canLoading.current = false;
          }
        }
      }).catch(err => {
        console.log(err);
      });
    },
    // 滚动至底部
    onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y; //滑动距离
      const contentSizeHeight = event.nativeEvent.contentSize.height; //scrollView contentSize高度
      const oriageScrollHeight = event.nativeEvent.layoutMeasurement.height; //scrollView高度
      if (offsetY + oriageScrollHeight >= contentSizeHeight) {
        if (canLoading.current) setPage(state => state + 1);
      } else if (offsetY + oriageScrollHeight <= 1) {
        //这个是没有数据了然后给了false  得时候还在往上拉
      } else if (offsetY === 0) {
        //这个地方是下拉刷新，意思是到顶了还在指行，可以在这个地方进行处理需要刷新得数据
      }
    },
  };

  useEffect(() => {
    addEvent.getData();
  }, [page]);
  return (
    <ComLayoutHead
      line
      title="提币记录"
      scrollStyle={{ backgroundColor: themeWhite }}
      onMomentumScrollEnd={addEvent.onMomentumScrollEnd}>
      {
        logs.map((item, index) => (
          <ListItem
            key={index}
            title={item.type}
            subtitle={item.time}
            subtitleStyle={{ color: themeGray, paddingTop: 5 }}
            rightTitle={`${item.num}${item.coin}`}
            rightTitleStyle={{ color: themeBlack }}
            rightSubtitle={statusArr[item.status]}
            rightSubtitleStyle={{
              paddingTop: 5,
              fontSize: 14,
              color: item.status === 0 ? themeRed : themeGray,
            }}
            bottomDivider />
        ))
      }
    </ComLayoutHead>
  );
};

export default MyWithdrawLogScreen;
