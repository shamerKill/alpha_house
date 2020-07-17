import React, { FC, useState, useEffect } from 'react';
import {
  SafeAreaView, Text, YellowBox,
} from 'react-native';
import {
  GiftedChat, IMessage, Send,
} from 'react-native-gifted-chat';
import ComLayoutHead from '../../../components/layout/head';
import onlyData from '../../../tools/onlyId';
import { defaultThemeColor } from '../../../config/theme';
import useGetDispatch from '../../../data/redux/dispatch';
import { InState } from '../../../data/redux/state';

const MyChatScreen: FC = () => {
  // react-native-gifted-chat引用的 react-native-lightbox包有动画问题，无法处理，需要隐藏
  YellowBox.ignoreWarnings(['Animated']);
  const [userInfo] = useGetDispatch<InState['userState']['userInfo']>('userState', 'userInfo');

  const [messages, setMessages] = useState<IMessage[]>([]);
  const onLinePeople: IMessage['user'] = {
    avatar: 'https://placeimg.com/150/150/any',
    _id: 2,
    name: 'React Native',
  };

  const addEvent = {
    onSend: (addMessages: IMessage[]) => {
      setMessages(prev => GiftedChat.append(prev, addMessages.map(item => {
        const result = { ...item };
        result.user.avatar = userInfo.avatar as string;
        result.user.name = '用户';
        return result;
      })));
      setMessages(prev => {
        return (
          GiftedChat.append(prev, [
            {
              _id: onlyData.getOnlyData(),
              text: '我正在升级中，您可以添加客服小姐姐微信联系😁',
              createdAt: new Date(),
              user: onLinePeople,
            },
          ])
        );
      });
    },
  };

  useEffect(() => {
    setMessages([
      {
        _id: onlyData.getOnlyData(),
        text: '我正在升级中，您可以添加客服小姐姐微信联系😁(点击可以放大)',
        createdAt: new Date(),
        user: onLinePeople,
        image: 'https://serve.alfaex.pro/static/kefu1.png',
      },
    ]);
  }, []);
  return (
    <ComLayoutHead
      overScroll
      title="在线客服">
      <SafeAreaView style={{ flex: 1 }}>
        <GiftedChat
          messages={messages}
          onSend={addMessages => addEvent.onSend(addMessages)}
          user={{
            _id: 1,
          }}
          placeholder="请输入内容"
          showUserAvatar
          timeFormat="LT"
          dateFormat="L"
          isKeyboardInternallyHandled={false}
          renderSend={prop => (
            <Send {...prop}>
              <Text style={{
                lineHeight: 40,
                fontSize: 18,
                color: defaultThemeColor,
                paddingLeft: 5,
                paddingRight: 5,
              }}>
                发送
              </Text>
            </Send>
          )} />
      </SafeAreaView>
    </ComLayoutHead>
  );
};

export default MyChatScreen;
