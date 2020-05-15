import React, { FC, useState, useEffect } from 'react';
import { Image } from 'react-native';
import { ListItem } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import ComLayoutHead from '../../components/layout/head';

const HomeHelpList: FC = () => {
  const navigation = useNavigation();
  const [helpList, setHelpList] = useState<{title: string; id: string;}[]>([]);
  useEffect(() => {
    setHelpList([
      { title: '收不到短信怎么办？', id: '1' },
      { title: '收不到注册确认邮件怎么办？', id: '2' },
      { title: '忘记登录密码怎么办？', id: '3' },
      { title: '实名认证后是否可以修改？', id: '4' },
      { title: '多次输错密码导致账户锁定怎么办？', id: '5' },
    ]);
  }, []);
  return (
    <ComLayoutHead border title="帮助中心">
      {
        helpList.map(item => (
          <ListItem
            onPress={() => navigation.navigate('HomeHelpDetails', { id: item.id })}
            key={item.id}
            leftAvatar={(
              <Image
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
                source={require('../../assets/images/icons/help_icon.png')} />
            )}
            title={item.title}
            titleStyle={{ fontSize: 15 }}
            contentContainerStyle={{ paddingTop: 5, paddingBottom: 5 }}
            rightAvatar={(
              <Image
                style={{ width: 14, height: 14 }}
                resizeMode="contain"
                source={require('../../assets/images/icons/list_more.png')} />
            )}
            bottomDivider />
        ))
      }
    </ComLayoutHead>
  );
};

export default HomeHelpList;
