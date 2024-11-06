import React from 'react'
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Foundation from '@expo/vector-icons/Foundation';
import { useRouter } from 'expo-router';

type Props = {}

export default function Feature({ }: Props) {
  const router = useRouter()
  const rollCall=async()=>{
    router.push({
      pathname: '/(studentDetail)/classDetail/rollCall', 
      params: {
      
      },
    });
  }
  const review=async()=>{
    router.push({
      pathname: '/(studentDetail)/classDetail/review', 
      params: {
        
      },
    });
  }
  const chat= async()=>{
    router.push({
      pathname: '/classDetail/listRoom', 
      params: {
        subjectId:'67286dfc54d8d07d039c19b8'
      },
    });
  }
  return (
    <SafeAreaView>
      <View className=' pb-[3.5%]  border-b-[1px] border-gray-200 flex-row  pt-[13%] px-[4%] items-center '>
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="chevron-back-sharp" size={24} color="black" />
        </TouchableOpacity>

        <Text className='mx-auto text-[18px] font-msemibold uppercase'>SE310.P12</Text>
        <TouchableOpacity>
          <MaterialIcons name="exit-to-app" size={24} color="#FE3535" />
        </TouchableOpacity>

      </View>
      <View>
        <TouchableOpacity onPress={rollCall} className='flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-[10%]   '>
          <FontAwesome6 name="calendar-check" size={24} color="black" />
          <Text className='text-base font-msemibold ml-4 mr-auto'>Điểm danh</Text>
          <FontAwesome6 name="exclamation" size={22} color="#FE3535" />
        </TouchableOpacity>
        <TouchableOpacity onPress={chat}  className='flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-3'>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="black" />
          <Text className='text-base font-msemibold ml-4 mr-auto'>Trao đổi</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={review} className='flex-row items-center bg-white w-[94%] mx-auto px-[7%] py-4 rounded-2xl mt-3'>
          <Foundation name="clipboard-pencil" size={24} color="black" />
          <Text className='text-base font-msemibold ml-4 mr-auto'>Đánh giá</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  )
}