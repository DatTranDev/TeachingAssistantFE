import React,{createContext,useState,useEffect,ReactNode} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Props = {
    children: ReactNode;
}
interface User {
    // Define the shape of the user object (customize this according to your user data)
    id: string;
    name: string;
    email: string;
    image:string;
    password:string;
    school:string;
    ms:string
  }
  
  interface AuthContextType {
    user: User | null;
    login: (userData: User,accessTokenData:string, refreshTokenData:string) => Promise<void>;
    logout: () => Promise<void>;
    accessToken:string|null;
    refreshToken:string|null;
  }
  export const AuthContext= createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }:Props) => {
    const [user,setUser]= useState<User | null>(null)
    const [accessToken, setAccessToken]= useState<string|null>(null)
    const [refreshToken, setRefreshToken]= useState<string|null>(null)
    useEffect(()=>{
        const loadUser=async()=>{
            try {
              const userData = await AsyncStorage.getItem('user');
              const accessTokenData= await AsyncStorage.getItem('accessToken');
              const refreshTokenData= await AsyncStorage.getItem('refreshToken');
              
              if (userData && accessToken) {
                setUser(JSON.parse(userData));
                setAccessToken(accessTokenData);
                setRefreshToken(refreshTokenData)
              }
            } catch (e) {
              console.log(e);
            }
          };
          loadUser();
    })
    const login = async (userData: User, accessTokenData:string,refreshTokenData:string) => {
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('accessToken', accessTokenData)
        await AsyncStorage.setItem('refreshToken', refreshTokenData)
      };
    
      const logout = async () => {
        setUser(null);
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('token')
      };
      return(
        <AuthContext.Provider value={{user,login,logout,accessToken,refreshToken}}>
            {children}
        </AuthContext.Provider>
      )

}