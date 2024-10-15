import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import ClassLayout from '@/components/(classroom)/_layout'
import { Link, Redirect } from 'expo-router'
import Entypo from '@expo/vector-icons/Entypo';
import ButtonCustom from '@/components/ui/ButtonCustom';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import get from '@/utils/get';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';


type Props = {}

const classes = (props: Props) => {
  const router= useRouter();
  const addClass = () => {
router.push('/(studentDetail)/classDetail/addClass')
  }
  const clickClass=()=>{
      router.push('/(studentDetail)/classDetail/feature')
  }
  return (
    <SafeAreaView>

      <View className='bg-blue_primary pb-[3.5%]  border-b-[1px] border-gray-200 '>
        <Text className='mx-auto mt-[13%] text-[18px] font-msemibold text-white uppercase'>Danh sách lớp học</Text>
      </View>
      <View>
        <TouchableOpacity className={`bg-blue_primary rounded-2xl ml-[3%] mr-auto  px-2 py-2 mt-[5%] `} onPress={addClass} >
          <View className={`items-center rounded-3xl flex-row`}>
            <Entypo name="plus" size={22} color="white" />
            <Text className="text-[16px] text-white font-semibold ml-1">Tham gia lớp học</Text>
          </View>
        </TouchableOpacity>
        {/* list */}
        <ScrollView className='mt-4'>
          <TouchableOpacity onPress={clickClass}>
          <View className='border-y-[1px] border-slate-200 mb-2 pl-[4%] pr-2 py-2 w-[94%] mx-auto rounded-xl bg-white'>
            <Text className='text-green-500 font-medium ml-[2px] mt-[-4px] mb-1'>Đang diễn ra</Text>
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
          </View>
          </TouchableOpacity>
         

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

          </View>
        </ScrollView>


      </View>
    </SafeAreaView>

  )
}

export default classes

const styles = StyleSheet.create({})