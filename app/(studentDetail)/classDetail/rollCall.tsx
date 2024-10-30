import React from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';
type Props = {}

export default function RollCall({ }: Props) {
    const router=useRouter()
    const clickRollCall=()=>{

    }

    return (
        <View>
            <View className=' pb-[1.5%]  border-b-[1px] border-gray-200 flex-row  pt-[12%] px-[4%] items-center mr-6 '>
                <TouchableOpacity onPress={router.back}>
                    <Ionicons name="chevron-back-sharp" size={24} color="black" />
                </TouchableOpacity>
                <View className='mx-auto items-center'>
                    <Text className='text-[18px] font-msemibold uppercase'>SE310.P12</Text>
                    <Text className='mt-[-3px]'>Điểm danh</Text>
                </View>
            </View>
            <Text className='font-msemibold text-blue_primary mt-[5%] ml-[5%]'>Đã vắng 1/5 buổi</Text>
            <ScrollView className='mt-3'>
                <TouchableOpacity className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                    <View className='mx-auto items-center justify-center'>
                        <Text>Thứ 6, 18/05/2024</Text>
                        <Text className='text-[#FE3535] text-base font-mmedium mt-1'>Chưa điểm danh</Text>
                    </View>
                    <FontAwesome6 name="exclamation" size={22} color="#FE3535" />
                </TouchableOpacity>

                <View className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                    <View className='mx-auto items-center justify-center'>
                        <Text>Thứ 6, 18/05/2024</Text>
                        <Text className='text-green text-base font-mmedium mt-1'>Đã điểm danh</Text>
                    </View>
                </View>
                <View className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                    <View className='mx-auto items-center justify-center'>
                        <Text>Thứ 6, 18/05/2024</Text>
                        <Text className='text-orange text-base font-mmedium mt-1'>Hết hạn điểm danh</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    )
}