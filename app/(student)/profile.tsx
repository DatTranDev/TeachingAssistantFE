import React, { useContext, useState } from 'react'
import { View, Text, TouchableOpacity, SafeAreaView, Image, ScrollView } from 'react-native'
import { AuthContext } from '@/context/AuthContext'
import { images } from '@/constants/image'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ButtonCustom from '@/components/ui/ButtonCustom';
import { useRouter,Redirect } from 'expo-router';
import Loading from '@/components/ui/Loading';


type Props = {}

export default function Profile({ }: Props) {
  const authContext = useContext(AuthContext);
  const router= useRouter()
  if (!authContext) {
    return;
  }
  const { logout, user } = authContext;
  const [loading, setLoading] = useState(false);
  const image = user?.avatar
  const edit=()=>{
      router.push('/(studentDetail)/profileDetail/editProfile')
  }
  const handleLogout=async()=>{
    setLoading(true);
    await logout();
    setLoading(false);
  }
  return (
    <SafeAreaView className="flex-1">
      <Loading loading={loading} />
      <View>
        <View className="bg-blue_primary pb-[3.5%]  border-b-[1px] border-gray-200 ">
          <Text className="mx-auto mt-[13%] text-[18px] font-msemibold text-white uppercase">
            Thông tin cá nhân
          </Text>
        </View>
        <View className="bg-white mt-[25%]  py-5 rounded-2xl mx-3">
          <View className="items-center justify-center ">
            <View className=" border-blue_primary border-[2px] rounded-full p-[1px]">
              <Image
                className="overflow-hidden w-20 h-20 rounded-full "
                resizeMode="cover"
                source={image ? { uri: image } : images.avatarDefault}
              />
            </View>
            <Text className="text-[16px] font-medium mt-1">{user?.name}</Text>
            <Text className="text-sm">
              {user?.userCode} |{" "}
              {user?.role == "student" ? "Sinh viên" : "Giảng viên"}
            </Text>
          </View>
          <ButtonCustom
            content="Chỉnh sửa"
            otherStyle="min-w-fit max-w-[40%] p-[7px] mt-3"
            handle={edit}
          />

          <View className="mt-4">
            <View className="flex-row items-center pl-[5%] border-b-[1px] mx-4 pb-1 border-gray_line">
              <MaterialCommunityIcons
                name="email-outline"
                size={24}
                color="black"
              />
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-base ml-[5%] pr-3"
              >
                {user?.email}
              </Text>
            </View>
            <View className="flex-row items-center pl-[5%] border-b-[1px] mx-4 pb-1 mt-3 border-gray_line">
              <MaterialCommunityIcons
                name="school-outline"
                size={25}
                color="black"
              />
              <Text className="text-base ml-[5%]">{user?.school}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row mt-5 items-center mx-auto pr-2"
          >
            <MaterialCommunityIcons
              name="logout"
              size={24}
              color="rgb(254 53 53)"
            />
            <Text className="text-xl ml-2 text-red">Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}