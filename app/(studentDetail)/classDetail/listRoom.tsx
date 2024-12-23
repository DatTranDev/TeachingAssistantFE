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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { formatNoWeekday } from '@/utils/formatDate';
export type Attend={
      id:string,
      sessionNumber:number,
      date:string,
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
      const [listAttend,setListAttend]= useState<Attend[]>([])
      const getChannel= async()=>{
            setLoading(true)
            const url=`${localHost}/api/v1/cAttend/findBySubject/${subjectId}`
            const res= await get({url,token:accessToken})
            if(res && res.status==200)
            {
                  setListAttend(res.data.cAttends.reverse())
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
                        code:`${code}`
                      },
            });
      }
      const goToChannel = (attend:Attend) => {
            router.push({
                  pathname: '/classDetail/discussionRoom',
                  params: {
                        cAttendId: attend.id,
                        sessionNumber:attend.sessionNumber,
                        date:attend.date,
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
                        <Text className='text-base font-semibold mt-[4%] ml-[5%]'>Thảo luận</Text>
                        <TouchableOpacity onPress={goToGeneral} className='flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-2   '>
                        <Ionicons name="chatbubble-ellipses-outline" size={24} color="black" />
                              <Text className='text-base font-msemibold ml-4 mr-auto'>Kênh chung</Text>
                        </TouchableOpacity>
                        {listAttend.length>0&&<Text className='text-base font-semibold mt-[4%] ml-[5%]'>Đặt câu hỏi</Text>}
                        <ScrollView className='mt-2'>                        
                        {listAttend.length>0&&listAttend.map((channel,index)=>{
                              return(
                                    <TouchableOpacity key={index} onPress={()=>goToChannel(channel)} className='flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mb-3'>
                                          <Feather name="book" size={24} color="black" />
                                          <Text className='text-base font-msemibold ml-4 mr-auto'>Buổi {channel.sessionNumber} - {formatNoWeekday(channel.date)}</Text>
                                    </TouchableOpacity>
                              )
                        })}
                        </ScrollView>
                        
                  </View>
            </SafeAreaView>
      )
}