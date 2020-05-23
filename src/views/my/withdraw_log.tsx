// 充值记录
import React, { FC, useState, useEffect } from 'react';
import { ListItem } from 'react-native-elements';
import ComLayoutHead from '../../components/layout/head';
import {
  themeWhite, themeGray, themeBlack, themeRed,
} from '../../config/theme';

const MyWithdrawLogScreen: FC = () => {
  const statusArr = ['审核中', '已通过', '已驳回'];
  const [logs, setLogs] = useState<{type: string; num: string; time: string; status: 0|1|2;}[]>([]);
  useEffect(() => {
    setLogs([
      {
        type: '充值', num: '600.00', time: '2019-04-03 23:23:23', status: 0,
      },
      {
        type: '充值', num: '600.00', time: '2019-04-03 23:23:23', status: 1,
      },
      {
        type: '充值', num: '600.00', time: '2019-04-03 23:23:23', status: 2,
      },
      {
        type: '充值', num: '600.00', time: '2019-04-03 23:23:23', status: 2,
      },
      {
        type: '充值', num: '600.00', time: '2019-04-03 23:23:23', status: 1,
      },
    ]);
  }, []);
  return (
    <ComLayoutHead
      line
      title="提币记录"
      scrollStyle={{ backgroundColor: themeWhite }}>
      {
        logs.map((item, index) => (
          <ListItem
            key={index}
            title={item.type}
            subtitle={item.time}
            subtitleStyle={{ color: themeGray, paddingTop: 5 }}
            rightTitle={`${item.num}USDT`}
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
