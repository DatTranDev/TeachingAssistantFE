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
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import post from '@/utils/post';
import { localHost } from '@/utils/localhost';
import { AuthContext } from '@/context/AuthContext';
import Loading from '@/components/ui/Loading';
import deleteApi from '@/utils/delete';
import Feather from '@expo/vector-icons/Feather';

type Props = {}

export default function Feature({ }: Props) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    Alert.alert('Thông báo', 'Đã xảy ra lỗi');
    return;
  }
  const { user, accessToken } = authContext;
  const router = useRouter()
  const { subjectId, name, code, joinCode } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const sessions = async () => {
    router.push({
      pathname: '/(teacherDetail)/classDetail/sessions',
      params: {
        subjectId: subjectId,
        name: name,
        code: code
      },
    });
  }
  const setting = async () => {
    router.push({
      pathname: '/(teacherDetail)/classDetail/setting',
      params: {
        subjectId: subjectId,
        name: name,
        code: code,
        joinCode: joinCode
      },
    });
  }
  const chat = async () => {
    router.push({
      pathname: '/classDetail/listRoom',
      params: {
        subjectId: subjectId,
        name: name,
        code: code
      },
    });
  }
  const statistical  = async () => {
    router.push({
      pathname: '/(teacherDetail)/classDetail/statistical',
      params: {
        subjectId: subjectId,
        name: name,
        code: code
      },
    });
  }
  const handleDelete = async () => {
    setLoading(true);
    const res= await deleteApi({
      url: `${localHost}/api/v1/subject/delete/${subjectId}`,
      token: accessToken
    })
    if(res)
    {
      if(res.status===200)
      {
        Alert.alert('Thông báo', 'Xóa lớp học thành công');
        router.back();
      }
      else
      {
        Alert.alert('Thông báo', 'Xóa lớp học thất bại');
      }
    }
    setLoading(false);
  }
  const deleteClass = async () => {
    Alert.alert(
      'Thông báo',
      'Bạn có chắc chắn muốn xóa lớp học này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => Alert.alert(
            'Thông báo',
            'Bạn có sẽ mất hết dữ liệu và không thể khôi phục lại được, bạn có chắc chắn muốn xóa lớp học này?',
            [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: handleDelete,
        },
      ],
      { cancelable: false }
        ),
        },
      ],
      { cancelable: false }
    );
  }
  return (
    <SafeAreaView>
      <Loading loading={loading} />
      <View className=' pb-[3.5%]  border-b-[1px] border-gray-200 flex-row  pt-[13%] px-[4%] items-center bg-blue_primary '>
        <TouchableOpacity onPress={router.back}>
          <Ionicons name='chevron-back-sharp' size={24} color='white' />
        </TouchableOpacity>

        <Text className='mx-auto text-[18px] font-msemibold uppercase text-white'>
          {code}
        </Text>
        <TouchableOpacity onPress={deleteClass}>
          <MaterialIcons name='exit-to-app' size={24} color='white' />
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity
          onPress={sessions}
          className='flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-[10%]   '>
          <FontAwesome5 name='chalkboard-teacher' size={20} color='black' />
          <Text className='text-base font-msemibold ml-4 mr-auto'>
            Giảng dạy
          </Text>
          {/* <FontAwesome6 name="exclamation" size={22} color="#FE3535" /> */}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={statistical}
          className='flex-row items-center bg-white w-[94%] mx-auto px-[7%] py-4 rounded-2xl mt-3'>
          <MaterialCommunityIcons
            name='clipboard-text-multiple-outline'
            size={24}
            color='black'
            style={{marginLeft:-2}}
          />
          <Text className='text-base font-msemibold ml-4 mr-auto'>
            Thống kê
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={setting}
          className='flex-row items-center bg-white w-[94%] mx-auto px-[7%] py-4 rounded-2xl mt-3'>
          <Feather name='settings' size={24} color='black' />
          <Text className='text-base font-msemibold ml-4 mr-auto'>Cài đặt</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}