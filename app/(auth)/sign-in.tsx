import React, { useContext,useEffect } from 'react'
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native'
import InputLayout from '@/components/ui/inputLayout'
import { useState } from 'react'
import { TextInput } from 'react-native'
import Feather from '@expo/vector-icons/Feather';
import ButtonCustom from '@/components/ui/ButtonCustom'
import { icons } from '@/constants/icons'
import { Redirect, Link, router } from 'expo-router'
import { AuthContext } from '@/context/AuthContext'
import Loading from '@/components/ui/Loading'
import postNoAuth from '@/utils/postNoAuth'
import post from '@/utils/post'
import get from '@/utils/get'
import messaging from '@react-native-firebase/messaging';
import { io } from 'socket.io-client'
import { localHost } from '@/utils/localhost';
import { SocketContext, useSocketContext } from '@/context/SocketContext'

type Props = {}

export default function SignIn({ }: Props) {
    const [email, setEmail] = useState('')
    const [pass, setPass] = useState('')
    const [visible, setVisible] = useState(true)
    const [loading, setLoading] = useState(false)
    const authContext = useContext(AuthContext);
    const socketContext = useContext(SocketContext);
    if (!authContext||!socketContext?.socket) {
        Alert.alert("Thông báo", "Đã xảy ra lỗi")
        return;
        // throw new Error('AuthContext&&Socket is undefined, make sure you are using AuthProvider');      
    }
   
    useEffect(()=>{
        if(authContext.user)
        {
            console.log(authContext.user)
            if(authContext.user.role=='student')
            {
                router.replace('/(student)/timetable')
            }else{
                router.replace('/(teacher)/timetable')
            }
        }
    })

    const { login } = authContext;
    const registerFCMToken = async (acessToken: string, userId: string) => {
        const urlGetSubject = `${localHost}/api/v1/subject/findByUserId/${userId}`;
        const response = await get({ url: urlGetSubject, token: acessToken });
        let topics = [];
        if (response) {
            if (response.status == 200) {
                const result = await response.data;
                const subjects = result.subjects;
                topics = subjects.map((subject: any) => {
                    return subject._id;
                })
            }
            else {
                Alert.alert('Thông báo', 'Đã xảy ra lỗi, vui lòng thử lại sau !')
                return false
            }
        }
        const url = `${localHost}/api/v1/firebase/subscribeToTopics`;
        let token = '';
        try{
            token = await messaging().getToken();
            const data = {
                token: token,
                topics: topics
            }
            const response = await post({ url, data, token: acessToken });
            if (response) {
                if (response.status == 200) {
                    console.log(response.data)
                    console.log('Subscribe to topics successfully')
                }
                else {
                    Alert.alert('Thông báo', 'Đã xảy ra lỗi đăng ký dịch vụ thông báo')
                    return false
                }
            }
        }catch(e){
            Alert.alert('Thông báo','Cài đặt thông báo để nhận thông báo từ ứng dụng');
            return false;
        }
        return true;
    }  
    const handleLogin = async () => {
        if (email != '' && pass != '') {
            setLoading(true);
            const data = {
                email: email,
                password: pass

            }
            const url = `${localHost}/api/v1/user/login`;
            const response = await postNoAuth({ url, data });
            try {
                if (response) {
                    if (response.status == 404) {
                        Alert.alert('Thông báo', 'Không tìm thấy người dùng')
                    }
                    if (response.status == 401) {
                        Alert.alert('Thông báo', 'Bạn đã nhập sai mật khẩu')
                    }
                    if (response.status == 200) {
                        const result = await response.data;
                        const FCMregister = await registerFCMToken(result.accessToken, result.data.id);
                        if(!FCMregister){
                            setLoading(false);
                            return;
                        }
                        await login(result.data, result.accessToken, result.refreshToken);
                        if(result.data.role=='student')
                        {
                            router.replace('/(student)/timetable')
                        }else{
                            router.replace('/(teacher)/timetable')
                        }
                    }
                }
            }   
            catch(e) {
                setLoading(false);
                console.log(e)
                Alert.alert("Thông báo", "Đã xảy ra lỗi vui lòng thử lại sau !")
            }
            finally {
                setLoading(false)
            }

        }
        else {
            Alert.alert('Thông báo', 'Nhập email và mật khẩu để đăng nhập')
        }


    }
    const loginGoogle = () => {

    }
    return (
        <SafeAreaView className='bg-white flex-1'>
            <Loading loading={loading} />
            <ScrollView className="h-[100vh] relative">
                <View>
                    <Text className="text-blue_primary text-[28px] font-msemibold mt-[30%] ml-[8%]">Chào mừng trở lại</Text>
                    <InputLayout style='w-[85%] mt-[10%]'
                        title='Email'
                        placeHorder='example@gmail.com'
                        value={email}
                        handle={(e) => { setEmail(e) }} />
                    {/* Mật khẩu */}
                    <View className={` ml-auto mr-auto w-[85%] mt-4 pb-1`}>
                        <Text className="text-[16px] font-msemibold text-gray_primary mb-2">Password</Text>
                        <View className="border-[1.2px] rounded-2xl border-gray-400 px-2 py-[6px] flex-row justify-center items-center">
                            <TextInput className="text-[14px] font-mmedium text-gray-800 flex-1"
                                secureTextEntry={visible}
                                autoCorrect={false}
                                value={pass}
                                placeholder='.................'
                                onChangeText={(p) => setPass(p)} />
                            <TouchableOpacity className="inline-block ml-1 mr-[2px]" onPress={() => setVisible(!visible)}>
                                <Feather name={visible ? 'eye' : 'eye-off'} size={18} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Link href="/forgotPassword" className=' ml-[62%]'>

                        <Text className="font-msemibold text-xs ml-[62%] mt-[2px] ">Quên mật khẩu ?</Text>
                    </Link>

                    <ButtonCustom content="Đăng nhập" handle={handleLogin} otherStyle="w-[85%] mt-[10%]" />
                </View>
                <View className="flex-row items-center w-[85%] mt-[10%] ml-auto mr-auto">
                    <View className="bg-slate-500 flex-1 h-[1px]"></View>
                    <Text className="text-slate-500 mx-1 font-msemibold text-xs" >hoặc đăng nhập với</Text>
                    <View className="bg-slate-500 flex-1 h-[1px]"></View>
                </View>
                <TouchableOpacity className="rounded-md border-slate-500 border-[1px] flex-row px-5 py-[10px] self-start ml-auto mr-auto mt-[5%]"
                    onPress={loginGoogle}>
                    <Image source={icons.google} className="w-5 h-5" ></Image>
                    <Text className="ml-2 font-msemibold text-sm">Google</Text>
                </TouchableOpacity>
                <View className="flex-row mx-auto mt-[5%]">
                    <Text>Chưa có tài khoản ?</Text>
                    <Link href="/sign-up">

                        <Text className="ml-2 text-sm font-mbold first-letter"> Đăng kí</Text>
                    </Link>
                </View>
            </ScrollView>
        </SafeAreaView>

    )
}