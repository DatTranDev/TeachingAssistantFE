import React from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
type Props = {content:string,
  handle:()=>void,
  otherStyle?:string,
  width?:string,
  top?:string
}

export default function ButtonCustom({content, handle,otherStyle}: Props) {
  return (
    <TouchableOpacity className={`bg-blue_primary rounded-3xl ml-auto mr-auto w-[85%] ${otherStyle}`} onPress={handle} >
      <View className={`  p-[10px] items-center rounded-3xl`}>
        <Text className="text-[16px] text-white font-msemibold ">{content}</Text>
      </View>
    </TouchableOpacity>
    
  )
}