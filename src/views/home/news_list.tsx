import React, { FC, useState, useEffect } from 'react';
import {
  Text, View, Image, TouchableNativeFeedback, GestureResponderEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ComLayoutHead from '../../components/layout/head';
import { themeGray } from '../../config/theme';

interface InHomeNewsCard {
  time: string;
  title: string;
  desc: string;
  readed: boolean;
  id: string;
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
  const [newsList, setNewsList] = useState<InHomeNewsCard[]>([]);
  // 点击进入详情事件
  const goToDetails = (id: string) => {
    navigation.navigate('HomeNewsDetails', {
      newsId: id,
    });
  };
  useEffect(() => {
    setNewsList([
      {
        title: '关于季度合约停服升级的说明',
        time: '2020-05-10 20:23:12',
        desc: '季度合约将于5月7日17季度合约将于5月7日17季度合约将于5月7日17:00停服升级，预计半小',
        readed: false,
        id: '1',
      },
      {
        title: '关于季度合约停服升级的说明',
        time: '2020-05-10 20:23:12',
        desc: '季度合约将于5月7日17季度合约将于5月7日17季度合约将于5月7日17:00停服升级，预计半小',
        readed: true,
        id: '2',
      },
      {
        title: '关于季度合约停服升级的说明',
        time: '2020-05-10 20:23:12',
        desc: '季度合约将于5月7日17季度合约将于5月7日17季度合约将于5月7日17:00停服升级，预计半小',
        readed: true,
        id: '3',
      },
      {
        title: '关于季度合约停服升级的说明',
        time: '2020-05-10 20:23:12',
        desc: '季度合约将于5月7日17季度合约将于5月7日17季度合约将于5月7日17:00停服升级，预计半小',
        readed: true,
        id: '4',
      },
      {
        title: '关于季度合约停服升级的说明',
        time: '2020-05-10 20:23:12',
        desc: '季度合约将于5月7日17季度合约将于5月7日17季度合约将于5月7日17:00停服升级，预计半小',
        readed: true,
        id: '5',
      },
    ]);
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
