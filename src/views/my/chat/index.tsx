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

const MyChatScreen: FC = () => {
  // react-native-gifted-chat引用的 react-native-lightbox包有动画问题，无法处理，需要隐藏
  YellowBox.ignoreWarnings(['Animated']);

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
        result.user.avatar = 'https://placeimg.com/140/140/any';
        result.user.name = '用户';
        return result;
      })));
      setMessages(prev => (
        GiftedChat.append(prev, [
          {
            _id: onlyData.getOnlyData(),
            text: '请问你有什么问题么😋',
            createdAt: new Date(),
            user: onLinePeople,
            image: 'https://placeimg.com/1400/1000/any',
          },
        ])
      ));
    },
  };

  useEffect(() => {
    setMessages([
      {
        _id: onlyData.getOnlyData(),
        text: '请问你有什么问题么😋',
        createdAt: new Date(),
        user: onLinePeople,
        image: 'https://placeimg.com/1400/1000/any',
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
