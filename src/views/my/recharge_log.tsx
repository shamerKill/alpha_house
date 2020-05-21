// 充值记录
import React, { FC, useState, useEffect } from 'react';
import { ListItem } from 'react-native-elements';
import ComLayoutHead from '../../components/layout/head';
import { themeWhite, themeGray, themeBlack } from '../../config/theme';

const MyReachargeLogScreen: FC = () => {
  const [logs, setLogs] = useState<{type: string; num: string; time: string;}[]>([]);
  useEffect(() => {
    setLogs([
      { type: '充值', num: '600.00', time: '2019-04-03 23:23:23' },
      { type: '充值', num: '600.00', time: '2019-04-03 23:23:23' },
      { type: '充值', num: '600.00', time: '2019-04-03 23:23:23' },
      { type: '充值', num: '600.00', time: '2019-04-03 23:23:23' },
      { type: '充值', num: '600.00', time: '2019-04-03 23:23:23' },
    ]);
  }, []);
  return (
    <ComLayoutHead
      line
      title="充值记录"
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
            bottomDivider />
        ))
      }
    </ComLayoutHead>
  );
};

export default MyReachargeLogScreen;
