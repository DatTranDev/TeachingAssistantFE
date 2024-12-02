import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image,  TextInput, Modal, Alert } from 'react-native';
import { registerRootComponent } from 'expo';
import { icons } from '@/constants/icons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AntDesign, Octicons } from '@expo/vector-icons';

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

import { useNavigation,useIsFocused, useFocusEffect } from '@react-navigation/native';
import { images } from '@/constants/image';
import { colors } from '@/constants/colors';

type props={
      Content:string,
      User:string,
      Avatar:string,
      Time:string,
      Type:string

}
export const Question = ({Content,User,Avatar,Time,Type}:props) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [urlModal, setUrlModal] = useState()

  
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
                onRequestClose={closeModal}
            >
                <View className='relative p-0 m-0 w-full h-full' style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
                <View className='flex-row absolute top-2 right-3 z-50'>
                    <TouchableOpacity className='ml-auto mr-[6px] bg-gray-300/60 rounded-full w-[32px] h-[32px] items-center justify-center'  onPress={downloadImage}>
                    <Octicons name="download" size={23} color={colors.blue_primary} />
                    </TouchableOpacity>
                    <TouchableOpacity className="ml-auto bg-gray-300/60 rounded-full w-[32px] h-[32px] items-center justify-center"  onPress={closeModal}>
                        <AntDesign name="close" size={23} color="red"  />
                    </TouchableOpacity>
                    </View>
                    <View className='w-full h-[85%] my-auto' >
                        <Image className='w-full h-full' source={{ uri: Content }} style={{ resizeMode: 'contain' }} />
                    </View>
                </View>

            </Modal>
        )
    }
    const getFileExtensionFromMimeType = (mimeType:string) => {
      switch (mimeType) {
        case 'image/jpeg':
          return 'jpg';
        case 'image/png':
          return 'png';
        case 'image/gif':
          return 'gif';
        default:
          return '';
      }
    };
    const downloadImage = async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Unable to access media library');
          return;
        }
        //?????
        const imageUrl=Content;
        const currentTime = new Date();
        const timestamp = currentTime.getTime();
        const fileName=''+timestamp;
        try {
            // Yêu cầu quyền truy cập thư viện phương tiện
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Unable to access media library');
              return;
            }
        
            // Tải xuống tệp tạm thời để lấy loại MIME
            const downloadResumable = FileSystem.createDownloadResumable(imageUrl, `${FileSystem.documentDirectory}${fileName}`);
        
            const downloadResult = await downloadResumable.downloadAsync();

if (downloadResult) {
  const { uri, headers } = downloadResult;
  // Now you can use uri and headers safely
  const mimeType = headers['content-type'];
            const extension = getFileExtensionFromMimeType(mimeType);
        
            if (!extension) {
                Alert.alert("Lỗi", "Không thể tải ảnh");
                return;
            }
        
            const finalUri = `${FileSystem.documentDirectory}${fileName}.${extension}`;
            await FileSystem.moveAsync({
              from: uri,
              to: finalUri,
            });
        
            // Lưu hình ảnh vào thư viện phương tiện
            const asset = await MediaLibrary.createAssetAsync(finalUri);
            await MediaLibrary.createAlbumAsync('Download', asset, false);
            Alert.alert("Tải thành công", "Đã lưu vào thư viện");
} else {
    Alert.alert("Lỗi", "Không thể tải ảnh");
}
            
          } catch (error) {
            Alert.alert("Lỗi", "Không thể tải ảnh");
          }
      };


    //Self-messages
    if (User == "My message") {
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
                        <TouchableOpacity style={{ width: 150, height: 200, overflow: 'hidden', borderRadius: 15, borderColor: colors.blue_primary, borderWidth: 1 }} onPress={openModal}>
                            <Image style={{ width: '100%', height: '100%', resizeMode: "cover" }} source={{ uri: Content }} />
                        </TouchableOpacity>
                    </View>;
                break;
         
              
           
        }
        return (
            <View className="mr-[2%]" >
                {modalImage()}
                <View className="flex-row mt-0 w-[70%]">
                    {contentType}

                </View>
                {
                    (Time != '') ?
                        (<Text className="ml-0 mt-[1px] text-[12px]">
                            {Time}
                        </Text>) : (<View />)
                }
            </View>
        )
    }
    //not Self-messages
    else {
        switch (Type) {

            case 'text':
                contentType = <Text className="bg-[#D9D4D4] rounded-tl-[15px] rounded-tr-[15px] rounded-bl-[2px] rounded-br-[15px] p-2.5 
                max-w-[70%] font-mregular text-[15px] mt-[5px] ml-[5px]"> {Content}</Text>;
                break;
            case 'image':
                contentType =
                    <View style={{ marginTop: 3, marginLeft: 5 }}>
                        <TouchableOpacity style={{ width: 150, height: 200, overflow: 'hidden', borderRadius: 15, borderColor: colors.blue_primary, borderWidth: 1 }} onPress={openModal}>
                            <Image style={{ width: '100%', height: '100%', resizeMode: "cover" }} source={{ uri: Content }} />
                        </TouchableOpacity>
                    </View>;
                break;
           
               
        }
        return (
            <View className="mr-auto ml-[2%]" >
                {modalImage()}
                <View className="flex-row mt-0 w-[70%]">
                    <View className="rounded-[30px] ml-0 w-[25px] h-[25px] overflow-hidden mt-auto">

                        <Image resizeMode='cover' source={(Avatar == 'no') ? ('') : ((Avatar == "" || !Avatar) ? (images.avatarDefault) : { uri: Avatar })}
                            className="w-full h-full" />
                    </View>
                    {contentType}

                </View>
                {
                    (Time != '') ?
                        (<Text className='ml-auto mt-[1px] text-[12px]'>
                            {Time}
                        </Text>) : (<View />)
                }
            </View>
        )
    }
}