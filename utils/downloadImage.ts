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
    export const downloadImage = async (imageUrl: string) => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Unable to access media library');
          return;
        }
        //?????
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