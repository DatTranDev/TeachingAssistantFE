import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useContext } from 'react'
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { AuthContext } from '@/context/AuthContext';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
type Props = {}

export default function Tetting({}: Props) {
  const { code,name,subjectId } = useLocalSearchParams();
  const authContext = useContext(AuthContext);
  if (!authContext) {
    Alert.alert('Thông báo', 'Đã xảy ra lỗi');
    return;
  }
  const { accessToken, user } = authContext;
  return (
    <SafeAreaView>
      <View className=' shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center '>
        <TouchableOpacity onPress={router.back}>
          <Ionicons name='chevron-back-sharp' size={24} color='white' />
        </TouchableOpacity>
        <View className='mx-auto items-center pr-1'>
          <Text className='text-[18px] font-msemibold uppercase text-white'>
            {code}
          </Text>
          <Text className='mt-[-3px] text-white font-mmedium'>Cài đặt</Text>
        </View>
        <TouchableOpacity>
          <FontAwesome5 name='pencil-alt' size={20} color='white' />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}