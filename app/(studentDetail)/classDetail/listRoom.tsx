import React, { useContext, useState,useEffect } from 'react'
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Foundation from '@expo/vector-icons/Foundation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { localHost } from '@/utils/localhost';
import { AuthContext } from '@/context/AuthContext';
import get from '@/utils/get';
import Loading from '@/components/ui/Loading';
export type Channel={
      id:string,
      name:string,
      subjectId:string
}
type Props = {}

export default function listRoom({ }: Props) {
      const authContext = useContext(AuthContext);
  if (!authContext) {
    Alert.alert("Thông báo", "Đã xảy ra lỗi")
    return;
  }
      const router = useRouter()
      const {user,accessToken}= authContext;
      const { subjectId,code,name } = useLocalSearchParams();
      const [loading,setLoading]= useState(false)
      const [listChannel,setListChannel]= useState<Channel[]>([])
      const getChannel= async()=>{
            setLoading(true)
            const url=`${localHost}/api/v1/channel/findBySubject/${subjectId}`
            const res= await get({url,token:accessToken})
            if(res && res.status===200)
            {
                  setListChannel(res.data.channels)
            }
            else
            {
                  Alert.alert("Thông báo","Đã xảy ra lỗi")
            }
            setLoading(false)
      }
      useEffect(()=>{
            getChannel()
      },[])
      const goToGeneral = () => {
            router.push({
                  pathname: '/classDetail/generalRoom',
                  params: {
                        subjectId:`${subjectId}`,
                        name:`${name}`,
                      },
            });
      }
      const goToChannel = (channel:Channel) => {
            router.push({
                  pathname: '/classDetail/channelRoom',
                  params: {
                        channelId: channel.id,
                        name:channel.name,
                        subjectName: `${name}`,
                        subjectId:`${subjectId}`
                      },
            });
      }
      return (
            <SafeAreaView>
                  <Loading loading={loading}/>
                  <View className=' shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center '>
                <TouchableOpacity onPress={router.back}>
                    <Ionicons name="chevron-back-sharp" size={24} color="white" />
                </TouchableOpacity>
                <View className='mx-auto items-center pr-6'>
                    <Text className='text-[18px] font-msemibold uppercase text-white'>{code}</Text>
                    <Text className='mt-[-3px] text-white font-mmedium'>Trao đổi</Text>
                </View>
            </View>
                  <View>
                        <TouchableOpacity onPress={goToGeneral} className='flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-[10%]   '>
                        <Ionicons name="chatbubble-ellipses-outline" size={24} color="black" />
                              <Text className='text-base font-msemibold ml-4 mr-auto'>Kênh chung</Text>
                        </TouchableOpacity>
                        {listChannel.map((channel,index)=>{
                              return(
                                    <TouchableOpacity key={index} onPress={()=>goToChannel(channel)} className='flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-3'>
                                          <Ionicons name="people-outline" size={25} color="black" />
                                          <Text className='text-base font-msemibold ml-4 mr-auto'>{channel.name}</Text>
                                    </TouchableOpacity>
                              )
                        })}
                  </View>
            </SafeAreaView>
      )
}