import React, { useState } from 'react'
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity } from 'react-native'
import InputLayout from '@/components/ui/inputLayout';
import ButtonCustom from '@/components/ui/ButtonCustom';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/constants/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, Link,useLocalSearchParams } from 'expo-router'

type Props = {}

export default function ChangePassword({ }: Props) {
    const [password, setPassword] = useState('');
    const[confirm,setConfirm]=useState('')
    const{email}= useLocalSearchParams();
    const router = useRouter();
    const changePassword = async () => {

    }

    return (
        <SafeAreaView>
            <ScrollView className="h-[100vh] relative">
                <View>
                    <View className="mt-[30%] ml-[7%] flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back-sharp" size={30} color={colors.blue_primary} />
                        </TouchableOpacity>

                        <Text className="text-blue_primary text-[28px] font-msemibold ml-3 mb-1">Tạo mật khẩu mới</Text>
                    </View>


                     <InputLayout style='w-[85%] mt-[7%]'
                        title='Mật khẩu mới'
                        placeHorder='example@gmail.com'
                        value={password}
                        handle={(e) => { setPassword(e) }} />
                       
                           
                        <InputLayout style='w-[85%] mt-[7%]'
                        title='Xác nhận mật khẩu mới'
                        placeHorder='example@gmail.com'
                        value={confirm}
                        handle={(e) => { setConfirm(e) }} />




                    <ButtonCustom content="Gửi mã xác nhận" handle={changePassword} otherStyle="w-[85%] mt-[10%]" />
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