import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { formatNoWeekday } from '@/utils/formatDate';

type Props = {}

export default function StudentList({}: Props) {

  const router = useRouter()
  const {date,attendId} = useLocalSearchParams()
  return (
    <View>
        <View className=' shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center '>
           <TouchableOpacity onPress={router.back}>
             <Ionicons name='chevron-back-sharp' size={24} color='white' />
           </TouchableOpacity>
           <View className='mx-auto items-center pr-6'>
             <Text className='text-[18px] font-msemibold uppercase text-white'>
               Danh sách sinh viên  
             </Text>
             <Text className='mt-[-3px] text-white font-mmedium'>
               {formatNoWeekday(date)}
             </Text>
           </View>
         </View>
    </View>
  )
}