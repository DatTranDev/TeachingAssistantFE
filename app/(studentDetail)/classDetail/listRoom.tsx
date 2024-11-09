import React from 'react'
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Foundation from '@expo/vector-icons/Foundation';
import { useLocalSearchParams, useRouter } from 'expo-router';

type Props = {}

export default function listRoom({ }: Props) {
      const router = useRouter()
      const { subjectId } = useLocalSearchParams();
      const goToGeneral = () => {
            router.push({
                  pathname: '/classDetail/generalRoom',
                  params: {
                        subjectId:`${subjectId}`
                      },
            });
      }
      const goToChannel = () => {
            router.push({
                  pathname: '/classDetail/channelRoom',
                  params: {
                        channelId: "672b182036089adb06b8e4c3",
                        name:"Nhóm 1",
                        subjectId:`${subjectId}`
                      }, // Chuyển sang màn hình success
            });
      }
      return (
            <SafeAreaView>
                  <View className=' pb-[1.5%]  border-b-[1px] border-gray-200 flex-row  pt-[12%] px-[4%] items-center mr-6 '>
                <TouchableOpacity onPress={router.back}>
                    <Ionicons name="chevron-back-sharp" size={24} color="black" />
                </TouchableOpacity>
                <View className='mx-auto items-center'>
                    <Text className='text-[18px] font-msemibold uppercase'>SE310.P12</Text>
                    <Text className='mt-[-3px]'>Trao đổi</Text>
                </View>
            </View>
                  <View>
                        <TouchableOpacity onPress={goToGeneral} className='flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-[10%]   '>
                        <Ionicons name="chatbubble-ellipses-outline" size={24} color="black" />
                              <Text className='text-base font-msemibold ml-4 mr-auto'>Kênh chung</Text>
                             
                        </TouchableOpacity>
                        <TouchableOpacity onPress={goToChannel} className='flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-3'>
                        <Ionicons name="people-outline" size={25} color="black" />
                              <Text className='text-base font-msemibold ml-4 mr-auto'>Nhóm 1</Text>
                        </TouchableOpacity>
                       
                        {/* <TouchableOpacity onPress={review} className='flex-row items-center bg-white w-[94%] mx-auto px-[7%] py-4 rounded-2xl mt-3'>
                              <Foundation name="clipboard-pencil" size={24} color="black" />
                              <Text className='text-base font-msemibold ml-4 mr-auto'>Đánh giá</Text>
                        </TouchableOpacity> */}

                  </View>
            </SafeAreaView>
      )
}