import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image,  TextInput, Modal, Alert } from 'react-native';
import { registerRootComponent } from 'expo';
import { icons } from '@/constants/icons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AntDesign } from '@expo/vector-icons';

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
                <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(217, 217, 217, 0.95)' }}>
                    <View style={{flexDirection:'row', marginLeft: 'auto',marginRight:"2%",marginTop:"1%"}}>
                    <TouchableOpacity className='ml-auto mr-[6px] mt-[1px]'  onPress={downloadImage}>
                    <MaterialCommunityIcons name="download-outline" size={31} color="black"  />
                        {/* <Image source={icons.download} style={{ width: 28, height: 28, marginLeft: 'auto', marginRight:5,marginTop:"12%" }} /> */}
                    </TouchableOpacity>
                        <TouchableOpacity className="ml-auto"  onPress={closeModal}>
                        <AntDesign name="close" size={32} color="black"  />
                        {/* <Image source={icons.close} style={{ width: 35, height: 35, marginLeft: 'auto' }} /> */}
                    </TouchableOpacity>
                    </View>
                    
                    <View style={{ width: '90%', height: '90%', marginLeft: '5%', marginTop: '3%' }}>

                        <Image source={{ uri: Content }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
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