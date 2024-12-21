import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useContext } from 'react'
import { Alert, Modal, SafeAreaView, Text, TouchableOpacity, View, Image } from 'react-native'
import { AuthContext } from '@/context/AuthContext';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '@/constants/colors';
import { AntDesign, Octicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {downloadImage} from '@/utils/downloadImage'
import get from '@/utils/get';
import { localHost } from '@/utils/localhost';

type Props = {}
type Subject = {
  id: string;
  code: string;
  name: string;
  hostId: string;
}

type Session = {
id?: string;
dayOfWeek: number;
room: string;
start: string;
end: string;
};

export default function Tetting({}: Props) {
  const { code,name,subjectId, joinCode } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [toogle, setToogle] = React.useState(false);

  const authContext = useContext(AuthContext);
  if (!authContext) {
    Alert.alert('Thông báo', 'Đã xảy ra lỗi');
    return;
  }
  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
      setModalVisible(false);
  };
  const { accessToken, user } = authContext;
  const modalImage = () => {
    return (
        <Modal
            visible={modalVisible}
            transparent={true}
            onRequestClose={closeModal}
        >
            <View className='relative p-0 m-0 w-full h-full' style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <View className='flex-row absolute top-2 right-3 z-50'>

                <TouchableOpacity className="ml-auto bg-gray-300/60 rounded-full w-[32px] h-[32px] items-center justify-center"  onPress={closeModal}>
                    <AntDesign name="close" size={23} color="red"  />
                </TouchableOpacity>
                </View>
                <View className='w-full h-[85%] my-auto' >
                    <Image className='w-[90%] h-[90%] mx-auto' source={{ uri: `http://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${joinCode}` }} style={{ resizeMode: 'contain' }} />
                    <Text className='mx-auto text-white text-2xl'>{joinCode}</Text>
                </View>
            </View>

        </Modal>
    )
  }
  const goToUpdate = async () => {
    const response = await get({url:`${localHost}/api/v1/subject/${subjectId}`,token:accessToken});
    if(response && response.status == 200) { 
      const data = response.data;
      const dataString = JSON.stringify(data)
      console.log(dataString)
      router.push({ 
        pathname: '(teacherDetail)/classDetail/editClass',
        params: {
          data: dataString
        }
      });
    }
  }
  return (
    <SafeAreaView>
      <View className=' shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center '>
        <TouchableOpacity onPress={router.back}>
          <Ionicons name='chevron-back-sharp' size={24} color='white' />
        </TouchableOpacity>
        <View className='mx-auto items-center pr-1'>
          <Text className='text-[18px] font-msemibold uppercase text-white'>
            {code}
          </Text>
          <Text className='mt-[-3px] text-white font-mmedium'>Cài đặt</Text>
        </View>
        <TouchableOpacity>
          <FontAwesome5 name='pencil-alt' size={20} color='white' />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={() => openModal()}
        className='flex-row items-center bg-white w-[94%] mx-auto px-[7%] py-4 rounded-2xl mt-3'>
        <MaterialCommunityIcons name="monitor-share" size={24} color="black" />
        <Text className='text-base font-msemibold ml-4 mr-auto'>
          Chia sẽ mã tham gia
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => goToUpdate()}
        className='flex-row items-center bg-white w-[94%] mx-auto px-[7%] py-4 rounded-2xl mt-3'>
        <MaterialCommunityIcons name="pencil" size={24} color="black" />
        <Text className='text-base font-msemibold ml-4 mr-auto'>
          Chỉnh sửa thông tin
        </Text>
      </TouchableOpacity>
      {modalImage()}
    </SafeAreaView>
  );
}