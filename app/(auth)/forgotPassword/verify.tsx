import React, { useState } from 'react'
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity,Alert } from 'react-native'
import InputLayout from '@/components/ui/inputLayout';
import ButtonCustom from '@/components/ui/ButtonCustom';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/constants/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, Link,useLocalSearchParams } from 'expo-router'
import postNoAuth from '@/utils/postNoAuth';
import Loading from '@/components/ui/Loading';
import { localHost } from '@/utils/localhost';

type Props = {}

export default function Verify({ }: Props) {
   
    let{email,userCode}= useLocalSearchParams();
    const [code, setCode] = useState('');
    const [loading,setLoading]= useState(false)
    const router = useRouter();
    const [check,setCheck]= useState(userCode)
    const sendCode = async () => {
        if(code==check)
        {
            router.push({
                pathname: '/(auth)/forgotPassword/changePassword', // Chuyển sang màn hình success
                params: {
                 email
                },
              });
        }
        else{
            Alert.alert("Thông báo","Vui lòng kiểm tra lại mã xác nhận")
        }
       
    }
    const sendMail= async()=>{
        const url =`${localHost}/api/v1/service/sendEmail`
          const data={
            email
          }
          setLoading(true)
          const response= await postNoAuth({url,data})
          try{
            if(response)
            {
              if(response.status==400)
              {
                const message= response.data
                if(message=="Invalid email")
                {
                  Alert.alert('Thông báo','Email không hợp lệ')
                }else{
                  Alert.alert('Thông báo','Đã xảy ra lỗi, vui lòng thử lại sau')
                }
              }
              if(response.status==404)
              {
                Alert.alert("Thông báo","Email chưa được tạo tài khoản")
              }
              if(response.status==200)
              {
                const result = await response.data;
               
                setCheck(result.userCode);
                
                Alert.alert('Thông báo','Đã gửi lại email')
              }
            }
          }catch{
            Alert.alert('Thông báo','Đã xảy ra lỗi, vui lòng thử lại sau')
          }
          finally{
            setLoading(false)
          }
        }
    
    return (
        <SafeAreaView className='bg-white flex-1'>
            <Loading loading={loading}/>
            <ScrollView className="h-[100vh] relative">
                <View>
                    <View className="mt-[30%] ml-[7%] flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back-sharp" size={30} color={colors.blue_primary} />
                        </TouchableOpacity>

                        <Text className="text-blue_primary text-[28px] font-msemibold ml-3 mb-1">Xác nhận</Text>
                    </View>


                    <Text className="ml-[8%] font-mmedium mt-[2%] text-gray-500">Chúng tôi đã gửi mã xác nhận đến email của bạn, hãy kiểm tra và nhập mã xác nhận</Text>
                    <InputLayout style='w-[85%] mt-[7%]'
                        title='Mã xác nhận'
                        placeHorder='ABCD1234'
                        value={code}
                        handle={(e) => { setCode(e) }} />



                    <ButtonCustom content="Gửi mã xác nhận" handle={sendCode} otherStyle="w-[85%] mt-[10%]" />
                    <View className="flex-row mx-auto mt-[5%]">
                        <Text>Bạn chưa nhận được mail ?</Text>
                        <TouchableOpacity onPress={sendMail}>
                            <Text className="ml-1 text-sm font-mbold first-letter">Gửi lại</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}