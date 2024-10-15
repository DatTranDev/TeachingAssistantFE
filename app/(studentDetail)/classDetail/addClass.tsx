import React, { useState } from 'react'
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Foundation from '@expo/vector-icons/Foundation';
import InputLayout from '@/components/ui/inputLayout';
import ButtonCustom from '@/components/ui/ButtonCustom';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


type Props = {}

export default function AddClass({ }: Props) {
    const [code, setCode] = useState('')
    const search = async () => {

    }
    return (
        <SafeAreaView className='flex-1'>
            <View className=' pb-[3.5%]  border-b-[1px] border-gray-200 flex-row  pt-[13%] px-[4%] items-center '>
                <TouchableOpacity>
                    <Ionicons name="chevron-back-sharp" size={24} color="black" />
                </TouchableOpacity>

                <Text className='mx-auto text-[18px] font-msemibold uppercase'>Tham gia lớp học</Text>
                <TouchableOpacity>
                    <MaterialIcons name="exit-to-app" size={24} color="#FE3535" />
                </TouchableOpacity>

            </View>
            <View >
                <InputLayout placeHorder='Nhập mã lớp học' value={code} handle={setCode} style='w-[70%] mt-[2%]' />
                <ButtonCustom content='Tìm kiếm' otherStyle='w-[35%] mt-[8%]' />
            </View>
            <ScrollView className='mt-4'>

                <View className='border-y-[1px] border-slate-200 mb-2 pl-[4%] pr-2 py-2 w-[94%] mx-auto rounded-xl bg-white'>
                    <View className='flex-row items-center ml-[2px]'>
                        <FontAwesome5 name="book" size={22} color="black" />
                        <Text className='text-base ml-3 font-semibold'>SE310.P12 </Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' className='w-[60%]'>(Phương pháp phát triển phần mềm hướng đối tượng</Text>
                        <Text>)</Text>
                    </View>
                    <View className='flex-row items-center mt-[4px]'>
                        <MaterialCommunityIcons name="clock-time-eight-outline" size={22} color="black" />
                        <Text className='text-base ml-3'>Thứ 2, 7:30 - 9:35</Text>
                    </View>
                    <View className='flex-row items-center mt-[2px] ml-[1px]'>
                        <MaterialIcons name="meeting-room" size={22} color="black" />
                        <Text className='text-base ml-[14px] pt-1'>Phòng B3.12</Text>
                    </View>
                    <View className='flex-row items-center mt-[2px] ml-[1px]'>
                        <Ionicons name="person-circle-outline" size={22} color="black" />
                        <Text className='text-base ml-[14px] pt-1'>Lê Thanh Trọng</Text>
                    </View>
                    <TouchableOpacity>
                        <Text className='text-xl text-green-500 mx-auto mt-3'>Tham gia</Text>
                    </TouchableOpacity>
                </View>

                <View className='border-y-[1px] border-slate-200 mb-2 pl-[4%] pr-2 py-2 w-[94%] mx-auto rounded-xl bg-white'>
                    <View className='flex-row items-center ml-[2px]'>
                        <FontAwesome5 name="book" size={22} color="black" />
                        <Text className='text-base ml-3 font-semibold'>SE310.P12 </Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' className='w-[60%]'>(Phương pháp phát triển phần mềm hướng đối tượng</Text>
                        <Text>)</Text>
                    </View>
                    <View className='flex-row items-center mt-[4px]'>
                        <MaterialCommunityIcons name="clock-time-eight-outline" size={22} color="black" />
                        <Text className='text-base ml-3'>Thứ 2, 7:30 - 9:35</Text>
                    </View>
                    <View className='flex-row items-center mt-[2px] ml-[1px]'>
                        <MaterialIcons name="meeting-room" size={22} color="black" />
                        <Text className='text-base ml-[14px] pt-1'>Phòng B3.12</Text>
                    </View>
                    <View className='flex-row items-center mt-[2px] ml-[1px]'>
                        <Ionicons name="person-circle-outline" size={22} color="black" />
                        <Text className='text-base ml-[14px] pt-1'>Lê Thanh Trọng</Text>
                    </View>
                    <TouchableOpacity>
                        <Text className='text-xl text-green-500 mx-auto mt-3'>Tham gia</Text>
                    </TouchableOpacity>
                </View>
                <View className='border-y-[1px] border-slate-200 mb-2 pl-[4%] pr-2 py-2 w-[94%] mx-auto rounded-xl bg-white'>
                    <View className='flex-row items-center ml-[2px]'>
                        <FontAwesome5 name="book" size={22} color="black" />
                        <Text className='text-base ml-3 font-semibold'>SE310.P12 </Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' className='w-[60%]'>(Phương pháp phát triển phần mềm hướng đối tượng</Text>
                        <Text>)</Text>
                    </View>
                    <View className='flex-row items-center mt-[4px]'>
                        <MaterialCommunityIcons name="clock-time-eight-outline" size={22} color="black" />
                        <Text className='text-base ml-3'>Thứ 2, 7:30 - 9:35</Text>
                    </View>
                    <View className='flex-row items-center mt-[2px] ml-[1px]'>
                        <MaterialIcons name="meeting-room" size={22} color="black" />
                        <Text className='text-base ml-[14px] pt-1'>Phòng B3.12</Text>
                    </View>
                    <View className='flex-row items-center mt-[2px] ml-[1px]'>
                        <Ionicons name="person-circle-outline" size={22} color="black" />
                        <Text className='text-base ml-[14px] pt-1'>Lê Thanh Trọng</Text>
                    </View>
                    <TouchableOpacity>
                        <Text className='text-xl text-green-500 mx-auto mt-3'>Tham gia</Text>
                    </TouchableOpacity>
                </View>
                <View className='border-y-[1px] border-slate-200 mb-2 pl-[4%] pr-2 py-2 w-[94%] mx-auto rounded-xl bg-white'>
                    <View className='flex-row items-center ml-[2px]'>
                        <FontAwesome5 name="book" size={22} color="black" />
                        <Text className='text-base ml-3 font-semibold'>SE310.P12 </Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' className='w-[60%]'>(Phương pháp phát triển phần mềm hướng đối tượng</Text>
                        <Text>)</Text>
                    </View>
                    <View className='flex-row items-center mt-[4px]'>
                        <MaterialCommunityIcons name="clock-time-eight-outline" size={22} color="black" />
                        <Text className='text-base ml-3'>Thứ 2, 7:30 - 9:35</Text>
                    </View>
                    <View className='flex-row items-center mt-[2px] ml-[1px]'>
                        <MaterialIcons name="meeting-room" size={22} color="black" />
                        <Text className='text-base ml-[14px] pt-1'>Phòng B3.12</Text>
                    </View>
                    <View className='flex-row items-center mt-[2px] ml-[1px]'>
                        <Ionicons name="person-circle-outline" size={22} color="black" />
                        <Text className='text-base ml-[14px] pt-1'>Lê Thanh Trọng</Text>
                    </View>
                    <TouchableOpacity>
                        <Text className='text-xl text-green-500 mx-auto mt-3'>Tham gia</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>

    )
}