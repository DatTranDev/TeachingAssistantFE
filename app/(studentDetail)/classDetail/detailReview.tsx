import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Modal, TextInput } from 'react-native'
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import RatingLayout from '@/components/ui/ratingLayout';
import ButtonCustom from '@/components/ui/ButtonCustom';
import Loading from '@/components/ui/Loading';

import FontAwesome from '@expo/vector-icons/FontAwesome';
type Props = {}

export default function DetailReview({ }: Props) {
  const [understand, setUnderstand] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [visible,setVisible]= useState(false)
  // useEffect(()=>{
  //   console.log(star)
  // },[star])
  const router = useRouter()
  return (

    <SafeAreaView className='flex-1'>

      <Modal visible={visible} className='flex-1' transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center z-50 relative" style={{ backgroundColor: 'rgba(170, 170, 170, 0.8)' }}>
          <TouchableOpacity onPress={()=>setVisible(false)} className='ml-auto mr-[3%] mt-[-8px] mb-1'>
          <FontAwesome name="close" size={28} color="black" />
          </TouchableOpacity>
          <View className='bg-white w-[90%] items-center pt-3 pb-4'>
            <Text className='text-base font-msemibold mb-2'>Đánh giá buổi học 18/05/2004</Text>
            <Text className='text-base font-mmedium'>Mức độ hiểu bài</Text>
            <RatingLayout size={30} style={"gap-[6px] mt-1"} changeRating={(e) => setUnderstand(e)} readOnly={false} />
            <Text className='text-base font-mmedium  mt-2'>Chất lượng buổi học</Text>
            <RatingLayout size={30} style={"gap-[6px] mt-1"} changeRating={(e) => setQuantity(e)} readOnly={false} />
            <Text className='text-base font-mmedium  mt-2'>Góp ý</Text>
            <View className='w-[80%]  bg-[#F5F5F5] mt-3 py-2 px-3'>
              <TextInput className='text-base leading-[22px] h-[80px]' multiline={true} textAlignVertical="top" numberOfLines={4} />
            </View>
            <ButtonCustom content='Gửi đánh giá' otherStyle='mt-4 w-[60%]' />
          </View>
        </View>

      </Modal>
      <View className=' pb-[1.5%]  border-b-[1px] border-gray-200 flex-row  pt-[12%] px-[4%] items-center mr-6 '>
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="chevron-back-sharp" size={24} color="black" />
        </TouchableOpacity>
        <View className='mx-auto items-center'>
          <Text className='text-[18px] font-msemibold uppercase'>Đánh giá</Text>
          <Text className='mt-[-3px]'>18/05/2024</Text>
        </View>
      </View>

      <View className='mt-[5%] bg-white w-[84%] items-center mx-auto rounded-2xl py-3'>
        <Text className='mt-[-6px] mb-[2px] text-blue_primary'>50 đánh giá</Text>
        <Text className='text-base font-mmedium'>Mức độ hiểu bài</Text>
        <RatingLayout rating={4.5} size={30} style={"gap-[6px] mt-1"} changeRating={(e) => setStar(e)} readOnly={true} />
        <Text className='text-base font-mmedium  mt-2'>Chất lượng buổi học</Text>
        <RatingLayout rating={3.52} size={30} style={"gap-[6px] mt-1"} changeRating={(e) => setStar(e)} readOnly={true} />

      </View>
      <Text className='ml-[8%] text-base font-msemibold mt-2'>Góp ý</Text>
      <ScrollView className='mt-4'>
        <View className='bg-white w-[84%] mx-auto px-4 py-2 rounded-[10px] border-[1px] border-gray_line mb-2 rounded-tl-[4px] rounded-br-[4px]'>
          <Text className='text-base'>Nay thầy dạy rất hay và đầy đủ ạ</Text>
        </View>

        <View className='bg-white w-[84%] mx-auto px-4 py-2 rounded-[10px] border-[1px] border-gray_line mb-2 rounded-tl-[4px] rounded-br-[4px]'>
          <Text className='text-base'>Thầy dạy làm sao mà em không biệt được override và overload</Text>
        </View>
        <View className='bg-white w-[84%] mx-auto px-4 py-2 rounded-[10px] border-[1px] border-gray_line mb-2 rounded-tl-[4px] rounded-br-[4px]'>
          <Text className='text-base'>Nay thầy dạy rất hay và đầy đủ ạ</Text>
        </View>
        <View className='bg-white w-[84%] mx-auto px-4 py-2 rounded-[10px] border-[1px] border-gray_line mb-2 rounded-tl-[4px] rounded-br-[4px]'>
          <Text className='text-base'>Thầy dạy làm sao mà em không biệt được override và overload</Text>
        </View>
        <View className='bg-white w-[84%] mx-auto px-4 py-2 rounded-[10px] border-[1px] border-gray_line mb-2 rounded-tl-[4px] rounded-br-[4px]'>
          <Text className='text-base'>Nay thầy dạy rất hay và đầy đủ ạ</Text>
        </View>

        <View className='bg-white w-[84%] mx-auto px-4 py-2 rounded-[10px] border-[1px] border-gray_line mb-2 rounded-tl-[4px] rounded-br-[4px]'>
          <Text className='text-base'>Thầy dạy làm sao mà em không biệt được override và overload</Text>
        </View>
        <View className='bg-white w-[84%] mx-auto px-4 py-2 rounded-[10px] border-[1px] border-gray_line mb-2 rounded-tl-[4px] rounded-br-[4px]'>
          <Text className='text-base'>Nay thầy dạy rất hay và đầy đủ ạ</Text>
        </View>
        <View className='bg-white w-[84%] mx-auto px-4 py-2 rounded-[10px] border-[1px] border-gray_line mb-2 rounded-tl-[4px] rounded-br-[4px]'>
          <Text className='text-base'>Thầy dạy làm sao mà em không biệt được override và overload</Text>
        </View>


      </ScrollView>
      <ButtonCustom content='Đánh giá buổi học' otherStyle='my-3 w-[84%]' handle={()=>setVisible(true)} />
    </SafeAreaView>
  )
}