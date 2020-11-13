import { RouteProp, useRoute } from '@react-navigation/native';
import React, { FC, useEffect, useState } from 'react';
import ComLayoutHead from '../../../components/layout/head';
import ajax from '../../../data/fetch';
import { TypeHistoryLog } from '../index/type';
import { ComContractIndexListHistory } from './list';

const ContractLogsOrderDetailsScreen: FC = () => {
  const route = useRoute<RouteProp<{logsIndex: { id: string }}, 'logsIndex'>>();
  // 历史成交记录
  const [historyLogsData, setHistoryLogsData] = useState<TypeHistoryLog[]>([]);
  // 获取订单详情
  useEffect(() => {
    ajax.get(`/contract/api/v1/bian/dealorder_log?orderID=${route.params.id}`).then(data => {
      if (data.status === 200) {
        setHistoryLogsData(data?.data?.map((item: any) => ({
          id: item.id,
          type: item.direction - 1,
          coinType: item.symbol,
          successPrice: item.price,
          successNumber: item.num,
          successTime: item.create_time,
          serviceFee: item.fee,
          changeValue: item.profit,
        })));
      }
    }).catch(err => {
      console.log(err);
    });
  }, []);
  return (
    <ComLayoutHead border title="订单详情">
      {
        historyLogsData.map((item, index) => (
          <ComContractIndexListHistory
            key={`${item.id}${index}`}
            data={item} />
        ))
      }
    </ComLayoutHead>
  );
};

export default ContractLogsOrderDetailsScreen;
