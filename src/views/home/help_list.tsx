import React, { FC, useState, useEffect } from 'react';
import { Image } from 'react-native';
import { ListItem } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import ComLayoutHead from '../../components/layout/head';
import ajax from '../../data/fetch';

const HomeHelpList: FC = () => {
  const navigation = useNavigation();
  const [helpList, setHelpList] = useState<{title: string; id: string;}[]>([]);
  useEffect(() => {
    ajax.get('/v1/help/help_list?page=sdf').then(data => {
      if (data.status === 200) {
        setHelpList(data.data.map((item: any) => ({
          title: item.title,
          id: item.id,
        })));
      }
    }).catch(err => {
      console.log(err);
    });
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
