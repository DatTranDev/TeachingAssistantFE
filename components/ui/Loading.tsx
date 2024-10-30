import React from 'react'
import {View, ActivityIndicator} from 'react-native'
import { colors } from '@/constants/Colors'
import { Modal } from 'react-native'
type Props = {
    loading:boolean
}

export default function Loading({loading}: Props) {
  return (
    <Modal visible={loading} transparent={true} animationType="fade">
      <View className="flex-1 justify-center items-center z-50 " style={{backgroundColor:'rgba(0, 0, 0, 0.5)'}}>
        <ActivityIndicator size={50} color={colors.blue_primary} />
      </View>
    </Modal>
  )
}