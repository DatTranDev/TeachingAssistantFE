import React, { useContext } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import get from './get'
import { localHost } from './localhost'
import { updateAccessToken, logoutEndSession } from './authEventEmitter'
import { Alert } from 'react-native'
import axios from 'axios'
import { AuthContext } from '@/context/AuthContext'
import { router } from 'expo-router'

type Props = {}

export default async function refreshAccessToken() {
      const logout = async () => {
            
           
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            router.replace('/(auth)/sign-in')
          };

      const refreshAcccess = async () => {
            console.log("ok67")
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            const url = `${localHost}/api/v1/token/refresh-token`
            try {
                  const response = await axios.get(url, {
                        headers: {
                              Authorization: `Bearer ${refreshToken}`,
                        }
                  },)
                  if (response) {
                        if (response.status == 200) {
                              const data = await response.data
                              updateAccessToken(data.access_token);
                              return data.access_token;
                        }
                        else {
                              // await logoutEndSession();
                              console.log("logout")
                              // await logout();
                              Alert.alert("Thông báo", "Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại")
                              return null;
                        }
                  } else {
                        console.log("logout")
                        // await logout();
                        Alert.alert("Thông báo", "Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại")
                        return null;
                  }
            } catch {
                  console.log("logout")
                  await logoutEndSession();
                  // await logout();
                  Alert.alert("Thông báo", "Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại")
                  return null;
            }


      }
      return (
            await refreshAcccess()
      )
}