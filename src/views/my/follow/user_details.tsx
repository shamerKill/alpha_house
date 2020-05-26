import React, { FC } from 'react';
import { View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import ComLayoutHead from '../../../components/layout/head';

const MyFollowUserDetails: FC = () => {
  const route = useRoute<RouteProp<{followUserDetails: {id: string|number}}, 'followUserDetails'>>();
  console.log(route.params.id);
  return (
    <ComLayoutHead title="跟单说明"></ComLayoutHead>
  );
};

export default MyFollowUserDetails;
