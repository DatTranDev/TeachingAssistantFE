import React,{createContext,useState,useEffect,ReactNode} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { User,createUserFromApi } from '@/utils/userInterface';
import { useRouter } from 'expo-router';
import { authEventEmitter } from '@/utils/authEventEmitter';
import { Alert } from 'react-native';
import { localHost } from '@/utils/localhost';
import  get  from '@/utils/get';
import post  from '@/utils/post';
import messaging from '@react-native-firebase/messaging';
type Props = {
    children: ReactNode;
}

  
  interface AuthContextType {
    user: User | null;
    login: (userData: any,accessTokenData:string, refreshTokenData:string) => Promise<void>;
    logout: () => Promise<void>;
    accessToken:string|null;
    refreshToken:string|null;
    FCMToken:string|null;
    addFCMToken: (token:string) => Promise<void>;
  }
  export const AuthContext= createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }:Props) => {
  const router= useRouter()
  const [user,setUser]= useState<User | null>(null)
  const [accessToken, setAccessToken]= useState<string|null>(null)
  const [refreshToken, setRefreshToken]= useState<string|null>(null)
  const [FCMToken, setFCMToken]= useState<string|null>(null)
  useEffect(()=>{
      const loadUser=async()=>{
          try {
            const userData = await AsyncStorage.getItem('user');
            const accessTokenData= await AsyncStorage.getItem('accessToken');
            const refreshTokenData= await AsyncStorage.getItem('refreshToken');
            const FCMTokenData= await AsyncStorage.getItem('FCMToken');
            if (userData && accessTokenData) {
              setUser(JSON.parse(userData));
              setAccessToken(accessTokenData);
              setRefreshToken(refreshTokenData)
              setFCMToken(FCMTokenData)
            }
          } catch (e) {
            console.log(e);
          }
        };
        loadUser();
        // Lắng nghe sự kiện cập nhật accessToken từ bên ngoài
  

  authEventEmitter.on('updateAccessToken', updateAccessTokenListener);
  authEventEmitter.on('logoutEndSession', logoutEndSession);

  return () => {
    authEventEmitter.off('updateAccessToken', updateAccessTokenListener);
    authEventEmitter.off('logoutEndSession', logoutEndSession);
  };
        
  },[])
  const updateAccessTokenListener = async(token: string) => {
    setAccessToken(token);
    await AsyncStorage.setItem('accessToken', token);
  };
  const unsubscribeFromTopics = async (acessToken: string|null, userId: string|undefined) => {
    const urlGetSubject = `${localHost}/api/v1/subject/findByUserId/${userId}`;
    const response = await get({ url: urlGetSubject, token: acessToken });
    let topics = [];
    if (response) {
        if (response.status == 200) {
            const result = await response.data;
            const subjects = result.subjects;
            topics = subjects.map((subject: any) => {
                return subject._id;
            })
        }
        else {
            Alert.alert('Thông báo', 'Đã xảy ra lỗi khi hủy thông báo, vui lòng thử lại sau !')
            return false
        }
    }
    const url = `${localHost}/api/v1/firebase/unsubscribeFromTopics`;
    let token = '';
    try{
        token = await messaging().getToken();
        const data = {
            token: token,
            topics: topics
        }
        const response = await post({ url, data, token: acessToken });
        if (response) {
            if (response.status == 200) {
                console.log('Unsubscribe from topics successfully')
            }
            else {
                Alert.alert('Thông báo', 'Đã xảy ra lỗi hủy đăng ký dịch vụ thông báo')
                return false
            }
        }
    }catch(e){
        Alert.alert('Thông báo','Đã xảy ra lỗi, vui lòng thử lại sau !');
        return false;
    }
    return true;
  }
  const login = async (userData: any, accessTokenData:string,refreshTokenData:string) => {
    
    const userTranfer= createUserFromApi(userData)
      setUser(userTranfer);
      setAccessToken(accessTokenData);
      setRefreshToken(refreshTokenData)
      
      await AsyncStorage.setItem('user', JSON.stringify(userTranfer));

      await AsyncStorage.setItem('accessToken', accessTokenData)
      
      await AsyncStorage.setItem('refreshToken', refreshTokenData)
      
      
    };
  const addFCMToken = async (token:string)=>{
    setFCMToken(token);
    await AsyncStorage.setItem('FCMToken', token);
  }
  
  const logout = async () => {
    const result = await unsubscribeFromTopics(accessToken,user?.id)
    if(!result){
      return;
    }
    setUser(null);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    router.replace('/(auth)/sign-in')
  };
  const logoutEndSession = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    router.replace('/(auth)/sign-in')
  }
  return(
    <AuthContext.Provider value={{user,login,logout,accessToken,refreshToken,FCMToken,addFCMToken}}>
        {children}
    </AuthContext.Provider>
    )

}