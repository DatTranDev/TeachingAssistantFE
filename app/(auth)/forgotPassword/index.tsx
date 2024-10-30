import React,{useState} from 'react'
import { SafeAreaView,View,Text,ScrollView,TouchableOpacity, Alert } from 'react-native'
import InputLayout from '@/components/ui/inputLayout';
import ButtonCustom from '@/components/ui/ButtonCustom';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/constants/Colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router'
import postNoAuth from '@/utils/postNoAuth';
import Loading from '@/components/ui/Loading';
import { localHost } from '@/utils/localhost';
type Props = {}
export default function ForgotPassword({}: Props) {
  const [email,setEmail]=useState('');
  const[loading,setLoading]=useState(false)
  const router = useRouter();
  const sendMail=async()=>{
        if(email=='')
        {
          Alert.alert("Thông báo","Vui lòng nhập email")
        }
        else{
          const url =`${localHost}/api/v1/service/sendEmail`
          
          const data={
            email
          }
          console.log(data)
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
                  setLoading(false)
                  return;
                }else{
                  Alert.alert('Thông báo','Đã xảy ra lỗi, vui lòng thử lại sau')
                  setLoading(false)
                  return;
                }
              }
              if(response.status==404)
              {
               
                Alert.alert("Thông báo","Email chưa được tạo tài khoản")
                setLoading(false)
                return;
              }
              if(response.status==200)
              {
                const result = await response.data;
                router.push({
                  pathname: '/(auth)/forgotPassword/verify', // Chuyển sang màn hình success
                  params: {
                   email,
                   userCode:result.userCode,
                  },
                });
              }
            }
          }catch{
            Alert.alert('Thông báo','Đã xảy ra lỗi, vui lòng thử lại sau')
            setLoading(false)
            return;
          }
          finally{
            setLoading(false)
          }
        }

    
  }
  return (
    <SafeAreaView className='bg-white flex-1'>
      <Loading loading={loading}/>
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