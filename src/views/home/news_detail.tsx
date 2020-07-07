import React, { FC, useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import ComLayoutHead from '../../components/layout/head';
import { defaultThemeColor, themeWhite, themeGray } from '../../config/theme';
import ajax from '../../data/fetch';
import useGetDispatch from '../../data/redux/dispatch';
import { InState, ActionsType } from '../../data/redux/state';

const HomeNewsDetails: FC = () => {
  const route = useRoute<RouteProp<{newsDetails:{newsId:string}}, 'newsDetails'>>();
  const [newsListState, dispatchNewsList] = useGetDispatch<InState['listState']['newsList']>('listState', 'newsList');
  const id = route.params.newsId;
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [desc, setDesc] = useState('');
  useEffect(() => {
    ajax.get(`/v1/article/article_detail?id=${id}`).then(data => {
      if (data.status === 200) {
        setTitle(data.data.title);
        setTime(data.data.create_time);
        setDesc(data.data.content);
      }
    }).catch(err => {
      console.log(err);
    });
    const result = newsListState.map(item => {
      if (item.id === id) {
        const rul = { ...item };
        setTitle(rul.title);
        setTime(rul.time);
        setDesc(rul.desc);
        rul.readed = true;
        return rul;
      }
      return item;
    });
    dispatchNewsList({
      type: ActionsType.CHANGE_NEWS_LIST,
      data: result,
    });
  }, []);
  return (
    <ComLayoutHead title="消息详情">
      <Text style={{
        color: defaultThemeColor,
        fontSize: 16,
        lineHeight: 40,
        backgroundColor: themeWhite,
        marginTop: 10,
        padding: 10,
      }}>
        {title}
      </Text>
      <View style={{
        marginTop: 10,
        backgroundColor: themeWhite,
        padding: 10,
      }}>
        <Text style={{ color: themeGray }}>{time}</Text>
        <Text style={{ lineHeight: 20, paddingTop: 10 }}>{desc}</Text>
      </View>
    </ComLayoutHead>
  );
};

export default HomeNewsDetails;
