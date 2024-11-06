import React from 'react'
import { View, Image,Text } from 'react-native'
import { images } from '@/constants/image'

type Props = {
  Avatar: string,
  Name: String,
  UserCode: string,
  Title: string,
  Content: string,
  Time:string
}

export default function Post({ Avatar, Name, UserCode, Content, Title,Time }: Props) {
  return (
    <View className='w-[95%] bg-white mx-auto px-3 py-4 mt-4 rounded-md shadow-lg'>
      <View className="flex-row mt-0 items-center">
        <View className="rounded-[30px] ml-0 w-[25px] h-[25px] overflow-hidden mt-auto">
          <Image resizeMode='cover' source={(Avatar == "" || !Avatar) ? (images.avatarDefault) : { uri: Avatar }}
            className="w-full h-full" />
        </View>
        <Text className='text-blue_primary ml-2 text-[15px]'>{Name}-{UserCode}</Text>
        <Text className="ml-2 text-[12px] text-center font-mregular mt-[1px] text-gray_primary">{Time}</Text>
      </View>
      <Text className='text-xl font-msemibold mt-2 ml-1'>{Title}</Text>
      <Text className='mt-1 ml-1 text-[15px] font-mregular'>{Content}</Text>
      </View>
    )
}