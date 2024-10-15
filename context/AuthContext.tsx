import React,{createContext,useState,useEffect,ReactNode} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { User,createUserFromApi } from '@/utils/userInterface';
import { useRouter } from 'expo-router';

type Props = {
    children: ReactNode;
}

  
  interface AuthContextType {
    user: User | null;
    login: (userData: any,accessTokenData:string, refreshTokenData:string) => Promise<void>;
    logout: () => Promise<void>;
    accessToken:string|null;
    refreshToken:string|null;
  }
  export const AuthContext= createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }:Props) => {
  const router= useRouter()
    const [user,setUser]= useState<User | null>(null)
    const [accessToken, setAccessToken]= useState<string|null>(null)
    const [refreshToken, setRefreshToken]= useState<string|null>(null)
    useEffect(()=>{
      
        const loadUser=async()=>{
            try {
              const userData = await AsyncStorage.getItem('user');
              const accessTokenData= await AsyncStorage.getItem('accessToken');
              const refreshTokenData= await AsyncStorage.getItem('refreshToken');
              
              if (userData && accessTokenData) {
                setUser(JSON.parse(userData));
                setAccessToken(accessTokenData);
                setRefreshToken(refreshTokenData)
              }
            } catch (e) {
              console.log(e);
            }
          };
          loadUser();
         
    },[])
    const login = async (userData: any, accessTokenData:string,refreshTokenData:string) => {
      
      const userTranfer= createUserFromApi(userData)
        setUser(userTranfer);
        setAccessToken(accessTokenData);
        setRefreshToken(refreshTokenData)
       
        await AsyncStorage.setItem('user', JSON.stringify(userTranfer));
  
        await AsyncStorage.setItem('accessToken', accessTokenData)
        
        await AsyncStorage.setItem('refreshToken', refreshTokenData)
       
       
      };
    
      const logout = async () => {
        console.log('a')
        setUser(null);
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        router.replace('/(auth)/sign-in')
      };
      return(
        <AuthContext.Provider value={{user,login,logout,accessToken,refreshToken}}>
            {children}
        </AuthContext.Provider>
      )

}