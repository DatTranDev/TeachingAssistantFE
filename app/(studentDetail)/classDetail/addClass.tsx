import React, { useContext, useState } from 'react'
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import InputLayout from '@/components/ui/inputLayout';
import ButtonCustom from '@/components/ui/ButtonCustom';
import post from '@/utils/post';
import { localHost } from '@/utils/localhost';
import { AuthContext } from '@/context/AuthContext';
import { ClassSession } from '@/app/(student)/timetable';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


type Props = {}

export default function AddClass({ }: Props) {
    const authContext = useContext(AuthContext);
    const router= useRouter();
  if (!authContext) {
    Alert.alert("Thông báo", "Đã xảy ra lỗi")
    return;
  }
  const {user,accessToken}= authContext;
    const [code, setCode] = useState('')
    const search = async () => {
        const url= `${localHost}/api/v1/subject/join`
        if(code)
        {
            const data= {
                "studentId": user?.id,
                "joinCode": code
            }
            const response= await post({url,data,token:accessToken})
            if(response)
            {
                if(response.status==201)
                {
                    Alert.alert("Thông báo", "Tham gia lớp học thành công")
                    setCode('')
                    return;
                }
                if(response.status==404)
                {
                    if(response.data.message=="Subject is not found")
                    {
                        Alert.alert("Thông báo", "Mã lớp không tồn tại")
                        return;
                    }
                }
                Alert.alert("Thông báo", "Đã xảy ra lỗi")
            }
            else
            {
                Alert.alert("Thông báo", "Đã xảy ra lỗi")
            }
        }
        
    }
    return (
      <SafeAreaView className='flex-1'>
        <View className=' pb-[3.5%]  border-b-[1px] border-gray-200 flex-row  pt-[13%] px-[4%] items-center bg-blue_primary '>
          <TouchableOpacity onPress={router.back}>
            <Ionicons name='chevron-back-sharp' size={24} color='white' />
          </TouchableOpacity>
          <Text className='mx-auto text-[18px] font-msemibold uppercase text-white pr-1'>
            Tham gia lớp học
          </Text>
          <TouchableOpacity>
            <MaterialCommunityIcons
              name='qrcode-scan'
              size={22}
              color='white'
            />
          </TouchableOpacity>
        </View>
        <View>
          <InputLayout
            placeHorder='Nhập mã lớp học'
            value={code}
            handle={setCode}
            style='w-[70%] mt-[2%]'
          />
          <ButtonCustom
            content='Tham gia'
            otherStyle='w-[35%] mt-[8%]'
            handle={search}
          />
        </View>
      </SafeAreaView>
    );
}