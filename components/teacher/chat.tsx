import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  Pressable
} from 'react-native';
import { registerRootComponent } from 'expo';
import { icons } from '@/constants/icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AntDesign, Feather, Octicons } from '@expo/vector-icons';

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

import {
  useNavigation,
  useIsFocused,
  useFocusEffect
} from '@react-navigation/native';
import { images } from '@/constants/image';
import { colors } from '@/constants/colors';
import { downloadImage } from '@/utils/downloadImage';
import deleteApi from '@/utils/delete';
import { localHost } from '@/utils/localhost';
import { AuthContext } from '@/context/AuthContext';
import patch from '@/utils/patch';

type props = {
  Id: string;
  Content: string;
  User: string;
  Avatar: string;
  Time: string;
  Type: string;
  IsRecall: boolean;
  Sender: {
    name: string;
    userCode: string;
    role: string;
    avatar: string;
    id: string;
    email: string;
    school: string;
  };
  handleDeleteChat: (Id: string) => void;
  handleKickStudent: (studentId: string) => void;
};
export const ChatContainer = ({ Id, Content, User, Avatar, Time, Type, Sender, handleDeleteChat, handleKickStudent, IsRecall }: props) => {
   const authContext = useContext(AuthContext);
   if (!authContext) {
     return;
   }
   const { user, accessToken } = authContext;
  const [modalVisible, setModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [featureModalVisible, setFeatureModalVisible] = useState(false);
  const [modalRecallVisible, setModalRecallVisible] = useState(false);
  const [urlModal, setUrlModal] = useState();

  const isFocused = useIsFocused();

  let contentType;
  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };
  const modalImage = () => {
    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={closeModal}>
        <View
          className='relative p-0 m-0 w-full h-full'
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <View className='flex-row absolute top-2 right-3 z-50'>
            <TouchableOpacity
              className='ml-auto mr-[6px] bg-gray-300/60 rounded-full w-[32px] h-[32px] items-center justify-center'
              onPress={() => downloadImage(Content)}>
              <Octicons name='download' size={23} color={colors.blue_primary} />
            </TouchableOpacity>
            <TouchableOpacity
              className='ml-auto bg-gray-300/60 rounded-full w-[32px] h-[32px] items-center justify-center'
              onPress={closeModal}>
              <AntDesign name='close' size={23} color='red' />
            </TouchableOpacity>
          </View>
          <View className='w-full h-[85%] my-auto'>
            <Image
              className='w-full h-full'
              source={{ uri: Content }}
              style={{ resizeMode: 'contain' }}
            />
          </View>
        </View>
      </Modal>
    );
  };
  const modalInfo = () => {
    return (
         <Modal
            animationType="fade"
            transparent={true}
            visible={infoModalVisible}
            onRequestClose={() => setInfoModalVisible(false)}>
            <TouchableOpacity
               className="flex-1 justify-center items-center"
               style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
               onPress={() => setInfoModalVisible(false)}>
               <View className="bg-white mt-[25%]  py-5 rounded-2xl mx-3 w-[90%]">
                  <View className="items-center justify-center ">
                     <View className=" border-blue_primary border-[2px] rounded-full p-[1px]">
                        <Image
                           className="overflow-hidden w-20 h-20 rounded-full "
                           resizeMode="cover"
                           source={
                              Sender.avatar
                                 ? {
                                      uri: Sender.avatar
                                   }
                                 : images.avatarDefault
                           }
                        />
                     </View>
                     <Text className="text-[16px] font-medium mt-1">{Sender.name}</Text>
                     <Text className="text-sm">
                        {Sender.userCode} | {Sender.role == "student" ? "Sinh viên" : "Giảng viên"}
                     </Text>
                  </View>
                  <View className="mt-4">
                     <View className="flex-row items-center pl-[5%] border-b-[1px] mx-4 pb-1 border-gray_line">
                        <MaterialCommunityIcons name="email-outline" size={24} color="black" />
                        <Text numberOfLines={1} ellipsizeMode="tail" className="text-base ml-[5%] pr-3">
                           {Sender.email}
                        </Text>
                     </View>
                     <View className="flex-row items-center pl-[5%] border-b-[1px] mx-4 pb-1 mt-3 border-gray_line">
                        <MaterialCommunityIcons name="school-outline" size={25} color="black" />
                        <Text className="text-base ml-[5%]">{Sender.school}</Text>
                     </View>
                  </View>
                  <TouchableOpacity onPress={()=>handleKickStudent(Sender.id)} className="flex-row mt-5 items-center mx-auto pr-2">
                     <MaterialCommunityIcons name="logout" size={24} color="rgb(254 53 53)" />
                     <Text className="text-xl ml-2 text-red">Mời khỏi lớp</Text>
                  </TouchableOpacity>
               </View>
            </TouchableOpacity>
         </Modal>
    )
  }
  const modalFeature = () => {
    return (
         <Modal
            animationType="fade"
            transparent={true}
            visible={featureModalVisible}
            onRequestClose={() => setFeatureModalVisible(false)}>
            <TouchableOpacity
               className="flex-1 justify-center items-center"
               style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
               onPress={() => setFeatureModalVisible(false)}>
               <View className="mt-2 bg-white items-center py-2 rounded-lg flex-row px-1">
                  <TouchableOpacity
                     onPress={() => {
                        setInfoModalVisible(true);
                        setFeatureModalVisible(false);
                     }}
                     className="items-center mx-3">
                     <MaterialCommunityIcons name="card-account-details-outline" size={24} color="orange" />
                     <Text className="text-[14px] mt-[2px] text-gray_primary">Hiển thị</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={deleteChat} className="items-center mx-3">
                     <Feather name="trash" size={24} color="red" />
                     <Text className="text-[14px] mt-[2px] text-gray_primary">Xóa tin nhắn</Text>
                  </TouchableOpacity>
               </View>
            </TouchableOpacity>
         </Modal>
    )
  }
  const deleteChat = async () => {
     const res = await deleteApi({
       url: `${localHost}/api/v1/question/delete/${Id}`,
       token: accessToken
     });
     if (res) {
       if (res.status == 200) {
         setFeatureModalVisible(false);
         Alert.alert('Thành công', 'Đã xóa tin nhắn');
         handleDeleteChat(Id);
       }
     } else {
       Alert.alert('Thất bại', 'Không thể xóa bài đăng');
     }
  }

  //Self-messages
  if (User == 'My message') {
    if(IsRecall){
      contentType = <Text className="bg-blue_primary rounded-tl-[15px]
           rounded-tr-[15px] rounded-bl-[15px] rounded-br-[2px] p-2.5 max-w-[200px] font-mregular 
           text-[15px] mt-[4px] mr-[5px] text-gray-500">Tin nhắn đã thu hồi</Text>;
  }
  else{
      switch (Type) {
          case 'text':
          //     contentType = <Text style={styles.Message}> {Content}</Text>;
              contentType = <Text className="bg-blue_primary rounded-tl-[15px]
               rounded-tr-[15px] rounded-bl-[15px] rounded-br-[2px] p-2.5 max-w-[200px] font-mregular 
               text-[15px] mt-[4px] mr-[5px] text-white"> {Content}</Text>;
              break;
          case 'image':
              contentType =
                  <View style={{ marginTop: 3, marginRight: 5 }}>
                      <Pressable className="w-[150px] h-[200px] overflow-hidden rounded-xl border border-blue_primary" onPress={openModal} >
                          <Image style={{ width: '100%', height: '100%', resizeMode: "cover" }} source={{ uri: Content }} />
                      </Pressable>
                  </View>;
              break;    
      }
  }
    return (
      <Pressable className='mr-[2%]' onPress={() => setFeatureModalVisible(true)}>
        {modalImage()}
        {modalInfo()}
        {modalFeature()}     
        <View className='flex-row mt-0 w-[70%]'>{contentType}</View>
        {Time != '' ? (
          <Text className='ml-0 mt-[1px] text-[12px]'>{Time}</Text>
        ) : (
          <View />
        )}
      </Pressable>
    );
  }
  //not Self-messages
  else {
    if(IsRecall){
      contentType = <Text className="bg-[#D9D4D4] rounded-tl-[15px] rounded-tr-[15px] rounded-bl-[2px] rounded-br-[15px] p-2.5 
            text-[15px] mt-[5px] ml-[5px] text-gray-500 font-mregular">Tin nhắn đã thu hồi</Text>;
  }else{
      switch (Type) {
          case 'text':
              contentType = <Text className="bg-[#D9D4D4] rounded-tl-[15px] rounded-tr-[15px] rounded-bl-[2px] rounded-br-[15px] p-2.5 
               font-mregular text-[15px] mt-[5px] ml-[5px]"> {Content}</Text>;
              break;
          case 'image':
              contentType =
                  <View style={{ marginTop: 3, marginLeft: 5 }}>
                      <Pressable style={{ width: 150, height: 200, overflow: 'hidden', borderRadius: 15, borderColor: colors.blue_primary, borderWidth: 1 }} onPress={openModal}>
                          <Image style={{ width: '100%', height: '100%', resizeMode: "cover" }} source={{ uri: Content }} />
                      </Pressable>
                  </View>;
              break;               
      }
  }
    return (
      <Pressable className='mr-auto ml-[2%]' onLongPress={() => setFeatureModalVisible(true)}>
        {modalImage()}
        {modalInfo()}
        {modalFeature()}
        <View className='flex-row mt-0 w-[70%]'>
          <View className='rounded-[30px] ml-0 w-[25px] h-[25px] overflow-hidden mt-auto'>
            {Avatar != 'no' && (
              <Image
                resizeMode='cover'
                source={
                  Avatar == '' || !Avatar
                    ? images.avatarDefault
                    : { uri: Avatar }
                }
                className='w-full h-full'
              />
            )}
          </View>
          {contentType}
        </View>
        {Time != '' ? (
          <Text className='ml-auto mt-[1px] text-[12px]'>{Time}</Text>
        ) : (
          <View />
        )}
      </Pressable>
    );
  }
};
