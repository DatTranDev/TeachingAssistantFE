import React, { useContext, useState } from 'react'
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Foundation from '@expo/vector-icons/Foundation';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import post from '@/utils/post';
import { localHost } from '@/utils/localhost';
import { AuthContext } from '@/context/AuthContext';
import Loading from '@/components/ui/Loading';
type Props = {}

export default function Feature({ }: Props) {
  const authContext = useContext(AuthContext);
   if (!authContext) {
      return;
   }
   const { user, accessToken } = authContext;
  const router = useRouter()
  const { subjectId,name,code } = useLocalSearchParams();
  const [loading, setLoading] = useState(false)
  const rollCall=async()=>{
    router.push({
      pathname: '/classDetail/rollCall', 
      params: {
        subjectId:subjectId,
        name:name,
        code:code
      },
    });
  }
  const review=async()=>{
    router.push({
      pathname: '/classDetail/review', 
      params: {
        subjectId:subjectId,
        name:name,
        code:code
      },
    });
  }
  const chat= async()=>{
    router.push({
      pathname: '/classDetail/listRoom', 
      params: {
        subjectId:subjectId,
        name:name,
        code:code
      },
    });
  }
  const document=async()=>{
    router.push({
      pathname: '/classDetail/document', 
      params: {
        subjectId:subjectId,
        name:name,
        code:code
      },
    });
  }
  const exitClass= async ()=>{
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn rời khỏi lớp học này không?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Đồng ý",
          onPress: async () => {
            setLoading(true)
            const res = await post({
              url: `${localHost}/api/v1/subject/leave`,
              data: { studentId: user?.id, subjectId: subjectId },
              token: accessToken
            });
            if (res) {
              console.log(res)
              if (res.status == 200) {
                router.back();
              } else {
                Alert.alert('Lỗi', "Đã xảy ra lỗi");
              }
            }
            setLoading(false)
          }
        }
      ]
    );
  }
  return (
    <SafeAreaView>
      <Loading loading={loading}/>
      <View className=' pb-[3.5%]  border-b-[1px] border-gray-200 flex-row  pt-[13%] px-[4%] items-center bg-blue_primary '>
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="chevron-back-sharp" size={24} color="white" />
        </TouchableOpacity>

        <Text className='mx-auto text-[18px] font-msemibold uppercase text-white'>{code}</Text>
        <TouchableOpacity onPress={exitClass}>
          <MaterialIcons name="exit-to-app" size={24} color="white" />
        </TouchableOpacity>

      </View>
      <View>
        <TouchableOpacity onPress={rollCall} className='flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-[10%]   '>
          <FontAwesome6 name="calendar-check" size={24} color="black" />
          <Text className='text-base font-msemibold ml-4 mr-auto'>Điểm danh</Text>
          {/* <FontAwesome6 name="exclamation" size={22} color="#FE3535" /> */}
        </TouchableOpacity>
        <TouchableOpacity onPress={chat}  className='flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-3'>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="black" />
          <Text className='text-base font-msemibold ml-4 mr-auto'>Trao đổi</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={review} className='flex-row items-center bg-white w-[94%] mx-auto px-[7%] py-4 rounded-2xl mt-3'>
          <Foundation name="clipboard-pencil" size={24} color="black" />
          <Text className='text-base font-msemibold ml-4 mr-auto'>Đánh giá</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={document} className='flex-row items-center bg-white w-[94%] mx-auto px-[7%] py-4 rounded-2xl mt-3'>
        <MaterialCommunityIcons name="file-document-outline" size={24} color="black" />
          <Text className='text-base font-msemibold ml-4 mr-auto'>Tài liệu</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  )
}