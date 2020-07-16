import React, { FC, useState, useEffect } from 'react';
import {
  Text, View, Image, TouchableNativeFeedback, GestureResponderEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ComLayoutHead from '../../components/layout/head';
import { themeGray } from '../../config/theme';
import ajax from '../../data/fetch';
import useGetDispatch from '../../data/redux/dispatch';
import { InState, ActionsType } from '../../data/redux/state';
import { TypeNewsList } from '../../data/@types/baseList';

interface InHomeNewsCard extends TypeNewsList {
  onPress?: (event: GestureResponderEvent) => void;
}
const HomeNewsCard: FC<InHomeNewsCard> = ({
  time, title, desc, readed, onPress,
}) => {
  return (
    <View style={{ paddingLeft: 10, paddingRight: 10 }}>
      <Text style={{
        textAlign: 'center',
        lineHeight: 40,
        color: themeGray,
      }}>
        {time}
      </Text>
      <TouchableNativeFeedback onPress={onPress}>
        <View style={{
          height: 120,
          position: 'relative',
        }}>
          <Image
            style={{
              width: '100%', height: '100%', position: 'absolute', zIndex: -1,
            }}
            resizeMode="stretch"
            source={require('../../assets/images/pic/news_card_bg.png')} />
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 20,
            paddingLeft: 30,
            paddingRight: 40,
            height: 40,
          }}>
            { !readed && (
              <Image
                style={{
                  width: 30,
                  height: 30,
                  marginLeft: -10,
                  marginRight: -5,
                }}
                source={require('../../assets/images/icons/news_info.png')} />
            ) }
            <Text style={{
              fontSize: 16,
              lineHeight: 40,
              height: 40,
            }}>
              {title}
            </Text>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 30,
            paddingLeft: 30,
            paddingRight: 40,
          }}>
            <Text
              style={{
                color: themeGray,
              }}
              numberOfLines={1}>{desc}
            </Text>
            <Image
              style={{
                width: 18,
                height: 18,
              }}
              resizeMode="contain"
              source={require('../../assets/images/icons/list_more.png')} />
          </View>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
};

const HomeNewsList: FC = () => {
  const navigation = useNavigation();
  const [newsListState, dispatchNewsList] = useGetDispatch<InState['listState']['newsList']>('listState', 'newsList');
  const [newsList, setNewsList] = useState<InState['listState']['newsList']>([]);
  // 点击进入详情事件
  const goToDetails = (id: string|number) => {
    navigation.navigate('HomeNewsDetails', {
      newsId: id,
    });
  };
  useEffect(() => {
    ajax.get('/v1/article/article_list?types=1').then(data => {
      if (data.status === 200 && data.data) {
        const result: InState['listState']['newsList'] = Object.values(data.data).map((item: any) => ({
          readed: item.isRead,
          title: item.list.title,
          time: item.list.create_time,
          desc: item.list.content,
          id: item.list.id,
        }));
        setNewsList(result);
        dispatchNewsList({
          type: ActionsType.CHANGE_NEWS_LIST,
          data: result,
        });
      }
    }).catch(err => {
      console.log(err);
    });
    setNewsList(newsListState);
  }, []);
  return (
    <ComLayoutHead
      title="消息">
      {
        newsList.map(item => (
          <HomeNewsCard onPress={() => goToDetails(item.id)} key={item.id} {...item} />
        ))
      }
    </ComLayoutHead>
  );
};

export default HomeNewsList;
