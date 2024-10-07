import React,{useState} from 'react'
import { SafeAreaView,View,Text,ScrollView,TouchableOpacity } from 'react-native'
import InputLayout from '@/components/ui/inputLayout';
import ButtonCustom from '@/components/ui/ButtonCustom';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/constants/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router'
type Props = {}

export default function ForgotPassword({}: Props) {
  const [email,setEmail]=useState('');
  const router = useRouter();
  const sendMail=async()=>{
    router.push({
      pathname: '/(auth)/forgotPassword/verify', // Chuyển sang màn hình success
      params: {
       email
      },
    });
  }
  return (
    <SafeAreaView>
      <ScrollView className="h-[100vh] relative">
                <View>
                  <View className="mt-[30%] ml-[7%] flex-row items-center">
                 <TouchableOpacity onPress={()=>router.replace("/(auth)/sign-in")}>
                   <Ionicons name="arrow-back-sharp" size={30} color={colors.blue_primary} />
                 </TouchableOpacity>
                 
                    <Text className="text-blue_primary text-[28px] font-msemibold ml-3 mb-1">Quên mật khẩu</Text>
                  </View>
                    
                   
                    <Text className="ml-[8%] font-mmedium mt-[2%] text-gray-500">Nhập email đã đăng kí để đặt lại mật khẩu</Text>
                    <InputLayout style='w-[85%] mt-[7%]'
                        title='Email'
                        placeHorder='example@gmail.com'
                        value={email}
                        handle={(e) => { setEmail(e) }} />
                    
                   

                    <ButtonCustom content="Đổi mật khẩu" handle={sendMail} otherStyle="w-[85%] mt-[10%]" />
                </View>
               
            </ScrollView>
    </SafeAreaView>
  )
}