import React, { useState } from 'react'
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Alert,TextInput } from 'react-native'
import InputLayout from '@/components/ui/inputLayout';
import ButtonCustom from '@/components/ui/ButtonCustom';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/constants/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, Link, useLocalSearchParams } from 'expo-router'
import postNoAuth from '@/utils/postNoAuth';
import { localHost } from '@/utils/localhost';
import Feather from '@expo/vector-icons/Feather';
import Loading from '@/components/ui/Loading';
import patch from '@/utils/patch';
type Props = {}

export default function ChangePassword({ }: Props) {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('')
    const { email } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(true)
    const changePassword = async () => {
        if (password != confirm) {
            Alert.alert("Thông báo", "Xác nhận mật khẩu sai")
        }
        else {
            const url = `${localHost}/api/v1/user/changepassword`
            const data ={
                email,
                password
            }
            console.log(data)
            setLoading(true);
            const response = await patch({ url, data })
            console.log(response);
            try {
                if (response) {
                    if (response.status == 200) {
                        Alert.alert('Thông báo', 'Thay đổi mật khẩu thành công')
                        router.replace('/(auth)/sign-in')
                    } 
                    else {
                        Alert.alert('Thông báo', 'Đã xảy ra lỗi, vui lòng thử lại sau')
                        router.replace('/(auth)/forgotPassword')
                    }
                }
            }
            catch {
                setLoading(false);
                Alert.alert("Thông báo", "Đã xảy ra lỗi vui lòng thử lại sau !")
            }
            finally {
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
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back-sharp" size={30} color={colors.blue_primary} />
                        </TouchableOpacity>

                        <Text className="text-blue_primary text-[28px] font-msemibold ml-3 mb-1">Tạo mật khẩu mới</Text>
                    </View>


                    <View className={` ml-auto mr-auto w-[85%] mt-4 pb-1`}>
                        <Text className="text-[16px] font-msemibold text-gray_primary mb-2">Mật khẩu mới</Text>
                        <View className="border-[1.2px] rounded-2xl border-gray-400 px-2 py-[6px] flex-row justify-center items-center">
                            <TextInput className="text-[14px] font-mmedium text-gray-800 flex-1"
                                secureTextEntry={visible}
                                autoCorrect={false}
                                value={password}
                                placeholder='.................'
                                onChangeText={(p) => setPassword(p)} />
                            <TouchableOpacity className="inline-block ml-1 mr-[2px]" onPress={() => setVisible(!visible)}>
                                <Feather name={visible ? 'eye' : 'eye-off'} size={18} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>


                    <View className={` ml-auto mr-auto w-[85%] mt-4 pb-1`}>
                        <Text className="text-[16px] font-msemibold text-gray_primary mb-2">Xác nhận mật khẩu mới</Text>
                        <View className="border-[1.2px] rounded-2xl border-gray-400 px-2 py-[6px] flex-row justify-center items-center">
                            <TextInput className="text-[14px] font-mmedium text-gray-800 flex-1"
                                secureTextEntry={visible}
                                autoCorrect={false}
                                value={confirm}
                                placeholder='.................'
                                onChangeText={(p) => setConfirm(p)} />
                            <TouchableOpacity className="inline-block ml-1 mr-[2px]" onPress={() => setVisible(!visible)}>
                                <Feather name={visible ? 'eye' : 'eye-off'} size={18} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>




                    <ButtonCustom content="Đổi mật khẩu" handle={changePassword} otherStyle="w-[85%] mt-[10%]" />
                    {/* <View className="flex-row mx-auto mt-[5%]">
                        <Text>Bạn chưa nhận được mail ?</Text>
                        <TouchableOpacity >
                            <Text className="ml-1 text-sm font-mbold first-letter">Gửi lại</Text>
                        </TouchableOpacity>
                    </View> */}
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}