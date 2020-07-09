import React, { FC, useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableNativeFeedback, Dimensions, NativeScrollEvent, NativeSyntheticEvent,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { ListItem } from 'react-native-elements';
import ComLayoutHead from '../../../components/layout/head';
import {
  defaultThemeColor, themeWhite, themeGray, themeBlack,
} from '../../../config/theme';
import ComLine from '../../../components/line';
import ComFormButton from '../../../components/form/button';
import showComDrawer from '../../../components/modal/drawer';
import ComMyOrderInfoLeftOut, { TypeList } from './left_out';
import { showMessage } from 'react-native-flash-message';
import ajax from '../../../data/fetch';

const oneSearchList: TypeList[] = [
  { title: '时间', list: [{ name: '最近七天', id: 1 }, { name: '七天以前', id: 2 }, Math.random()] },
];
const twoSearchList: TypeList[] = [
  { title: '时间', list: [{ name: '最近七天', id: 1 }, { name: '七天以前', id: 2 }, Math.random()] },
  {
    title: '类型',
    list: [
      { name: '全部', id: 5 }, { name: '充值', id: 6 }, { name: '提现', id: 7 },
      { name: '转入', id: 8 }, { name: '转出', id: 9 }, { name: '手续费', id: 10 },
    ],
  },
];
const threeSearchList: TypeList[] = [
  { title: '时间', list: [{ name: '最近七天', id: 1 }, { name: '七天以前', id: 2 }, Math.random()] },
  {
    title: '类型',
    list: [
      { name: '全部', id: 5 }, { name: '充值', id: 6 }, { name: '提现', id: 7 },
      { name: '转入', id: 8 }, { name: '转出', id: 9 }, { name: '手续费', id: 10 },
    ],
  },
  {
    title: '币种',
    list: [
      { name: '全部', id: 3 }, { name: 'ETH', id: 4 }, { name: 'BCH', id: 5 },
      { name: 'BTC', id: 6 }, { name: 'LTC', id: 7 }, { name: 'USDT', id: 8 }
    ]
  },
];

const MyOrderInfo: FC = () => {
  // 屏幕宽度
  const screenWith = Math.round(Dimensions.get('window').width);
  const typeBtns:{name: string, id: number}[] = [
    { name: '充值提现', id: 0 },
    { name: 'USDT合约', id: 1 },
    // { name: '混合合约', id: 2 },
    // { name: '币本位合约', id: 3 },
    { name: '币币账户', id: 4 },
  ];
  // 处理空行
  const supplyTypeBtns: string[] = [];
  for (let i = 1, len = typeBtns.length % 3; i < len; i++) {
    supplyTypeBtns.push('');
  }
  const outBoxClose = useRef<{close: () => void;}>();
  const isLoading = useRef<boolean>(false);

  const page = useRef(1);
  const canLoadingPage = useRef(true);


  // 筛选类型
  const [selectType, setSelectType] = useState<string[]>([]);
  // 订单类型
  const [orderType, setOrderType] = useState<typeof typeBtns[0]['id']>(0);
  // 按钮是否可选
  const [btnDisabled] = useState(false);
  // 订单列表
  type TypeOrderList = {
    title: string;
    time: string;
    number: string;
    id: string;
  };
  const [orderList, setOrderList] = useState<TypeOrderList[]>([]);


  const addEvent = {
    // 筛选按钮
    screen: () => {
      if (isLoading.current) return;
      let searchList: TypeList[] = [];
      if (orderType === 0) searchList = oneSearchList;
      if (orderType === 1) searchList = twoSearchList;
      if (orderType === 4) searchList = threeSearchList;
      const drawer = showComDrawer({
        noClose: true,
        width: '80%',
        context: <ComMyOrderInfoLeftOut close={outBoxClose} searchList={searchList} selectType={addEvent.showType} defaultSelect={selectType} />,
      });
      outBoxClose.current = drawer;
    },
    // 选择账单类型
    changeOrderType: (id: typeof orderType) => {
      if (isLoading.current) return;
      setOrderType(id);
    },
    // 选择筛选方式
    showType: (types: string[]) => {
      setSelectType(types);
    },
    // 滚动至底部
    onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y; //滑动距离
      const contentSizeHeight = event.nativeEvent.contentSize.height; //scrollView contentSize高度
      const oriageScrollHeight = event.nativeEvent.layoutMeasurement.height; //scrollView高度
      if (offsetY + oriageScrollHeight >= contentSizeHeight){
        console.log('加载数据');
        addEvent.getPageData();
      }else if(offsetY + oriageScrollHeight <= 1){
        //这个是没有数据了然后给了false  得时候还在往上拉
      }else if(offsetY === 0){
       //这个地方是下拉刷新，意思是到顶了还在指行，可以在这个地方进行处理需要刷新得数据
      }
    },
    // 获取数据
    getDataOrderType: () => {
      if (orderType === 0) {
        setSelectType([
          (oneSearchList[0].list[0] as any).name,
        ]);
      } else if (orderType === 1) {
        setSelectType([
          (twoSearchList[0].list[0] as any).name,
          (twoSearchList[1].list[0] as any).name,
        ]);
      } else if (orderType === 4) {
        setSelectType([
          (threeSearchList[0].list[0] as any).name,
          (threeSearchList[1].list[0] as any).name,
          (threeSearchList[2].list[0] as any).name,
        ]);
      }
    },
    getDataSelectType: () => {
      if (isLoading.current) return;
      if (selectType.length === 0) return;
      canLoadingPage.current = true;
      page.current = 1;
      isLoading.current = true;
      addEvent.getData();
    },
    getPageData: () => {
      if (!canLoadingPage.current) return;
      addEvent.getData();
    },
    getData: () => {
      let fm: {[key: string]: string|number} = {};
      if (orderType === 0) {
        fm.sort = '1';
        fm.time = selectType[0] === '最近七天' ? '1' : '2';
        fm.currency = 'all';
        fm.type = '1';
        fm.offset = page.current;
      }
      if (orderType === 1) {
        fm.sort = '2';
        fm.time = selectType[0] === '最近七天' ? '1' : '2';
        fm.currency = 'all';
        // @ts-ignore
        fm.type = {'全部': 1, '充值': 2, '提现': 3, '转入': 4, '转出': 5, '手续费': 6}[selectType[1]];
        fm.offset = page.current;
      }
      if (orderType === 4) {
        fm.sort = '3';
        fm.time = selectType[0] === '最近七天' ? '1' : '2';
        fm.currency = selectType[2] === '全部' ? 'all' : selectType[2];
        // @ts-ignore
        fm.type = {'全部': 1, '充值': 2, '提现': 3, '转入': 4, '转出': 5, '手续费': 6}[selectType[1]];
        fm.offset = page.current;
      }
      ajax.post('/v1/currency/billdetails', fm).then(data => {
        if (data.status === 200) {
          setOrderList(state => {
            return state.concat(data?.data?.map((item: any) => ({
              title: item.msg,
              time: item.create_time,
              number: item.num,
              id: item.id,
            })) || []);
          });
          page.current++;
          if (data.data.length === 0) canLoadingPage.current = false;
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        isLoading.current = false;
      });
    }
  };

  useEffect(addEvent.getDataOrderType, [orderType]);
  useEffect(addEvent.getDataSelectType, [selectType]);

  useEffect(() => {
    setOrderList([
      {
        title: '充值', time: '2018-03-25  08:57:25', number: '1000.00', id: '0',
      },
    ]);
    return () => {
      outBoxClose.current && outBoxClose.current.close();
    };
  }, []);
  return (
    <ComLayoutHead
      overScroll
      title="账单明细"
      rightComponent={(
        <TouchableNativeFeedback onPress={addEvent.screen}>
          <Text style={{ color: defaultThemeColor, fontSize: 15 }}>筛选</Text>
        </TouchableNativeFeedback>
      )}>
      <View style={{
        backgroundColor: themeWhite,
        padding: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}>
        {
          typeBtns.map(item => (
            <ComFormButton
              onPress={() => addEvent.changeOrderType(item.id)}
              disabled={btnDisabled}
              gray={item.id !== orderType}
              key={item.id}
              title={item.name}
              containerStyle={{
                width: screenWith * 0.3,
                marginTop: 5,
                marginBottom: 5,
              }}
              fontStyle={{
                fontSize: 14,
              }} />
          ))
        }
        {
          supplyTypeBtns.map((_item, index) => (
            <View
              key={index}
              style={{ width: screenWith * 0.3 }} />
          ))
        }
      </View>
      <ComLine />
      <ScrollView style={{
        backgroundColor: themeWhite,
        flex: 1,
      }}
      onMomentumScrollEnd={addEvent.onMomentumScrollEnd}>
        {
          orderList.map((item, index) => (
            <ListItem
              key={index}
              title={item.title}
              subtitle={item.time}
              rightTitle={`${item.number} USDT`}
              subtitleStyle={{ color: themeGray, paddingTop: 5 }}
              rightTitleStyle={{ color: themeBlack, fontSize: 14 }}
              bottomDivider />
          ))
        }
      </ScrollView>
    </ComLayoutHead>
  );
};

export default MyOrderInfo;
