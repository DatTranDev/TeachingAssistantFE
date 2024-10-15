import React from 'react'
import { View,SafeAreaView,Text } from 'react-native'

type Props = {}

export default function EditProfile({}: Props) {
  return (
   <SafeAreaView>
    <View>
    <View className='bg-blue_primary pb-[3.5%]  border-b-[1px] border-gray-200 '>
          <Text className='mx-auto mt-[13%] text-[18px] font-msemibold text-white uppercase'>Cập nhật thông tin</Text>

        </View>
    </View>
   </SafeAreaView>
  )
}