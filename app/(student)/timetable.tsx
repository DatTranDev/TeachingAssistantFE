import React, { useContext, useEffect, useState } from 'react'
import { Text, View, Alert, TouchableOpacity,ScrollView,SafeAreaView } from 'react-native'
import post from '@/utils/post';
import { localHost } from '@/utils/localhost';
import { AuthContext } from '@/context/AuthContext';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import get from '@/utils/get';
import Ionicons from '@expo/vector-icons/Ionicons';
import Loading from '@/components/ui/Loading';
import { useFocusEffect } from '@react-navigation/native';

type Props = {}
export type ClassSession = {
  idSubject:string,
  code:string,
  name:string,
  startDay:string,
  endDay:string,
  room:string,
  hostName:string,
  start:string,
  end:string,
  dayOfWeek:number
}
export default function Timetable({}: Props) {
  const authContext = useContext(AuthContext);
  const [data,setData]= useState<ClassSession[]>([])
  const [listSub,setListSub]= useState<ClassSession[]>([])
  if (!authContext) {
    Alert.alert("Thông báo", "Đã xảy ra lỗi")
    return;
  }
  const [loading,setLoading]= useState(false)
  const {user,accessToken}= authContext;
  const currentDay = new Date().getDay();
  const currentDate = new Date().getDate();
  const [daySelect, setDaySelect] = useState(currentDay)
  const dayOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const getDateWithOffset = (offset: number) => {
    const date = new Date(); 
    date.setDate(currentDate + offset);
    return date.getDate();
  };
  const handleDay = (day: any) => {

    const num = Number(day)
    setDaySelect(num);
  }

  const month = new Date().getMonth() + 1;
  const getSub = async () => {
    setLoading(true)
    const url = `${localHost}/api/v1/classSession/findByUser/${user?.id}`
    const response = await get({url, token:accessToken})
    if(response && response.status == 200) {
      const formattedData: ClassSession[] = response.data.classSessions.map((item: any) => ({
        idSubject: item.subjectId,
        code: item.subject.code,
        name: item.subject.name,
        startDay: item.subject.startDay,
        endDay: item.subject.endDay,
        room: item.room,
        hostName: item.subject.host.name,
        start: item.start,
        end: item.end,
        dayOfWeek: item.dayOfWeek
      }));
      setData(formattedData);
      setListSub(formattedData.filter(item=>item.dayOfWeek==daySelect))
    } else {
      Alert.alert('Thông báo','Đã xảy ra lỗi, vui lòng quay lại sau')
    }
    setLoading(false)
  }
  useFocusEffect(
    React.useCallback(() => {
      getSub();
    }, [])
  );
  useEffect(()=>{
    setListSub(data.filter(item=>item.dayOfWeek==daySelect))
  },[daySelect])
  
  return (
    <SafeAreaView className='flex-1'>
       <Loading loading={loading}/>
      <View className='bg-blue_primary pb-[3.5%]  border-b-[1px] border-gray-200 '>
        <Text className='mx-auto mt-[13%] text-[18px] font-msemibold text-white'>THỜI KHÓA BIỂU</Text>

      </View>
      <View className='mb-2 mt-4'>
        <TouchableOpacity onPress={getSub}>
          <Text className='text-xl font-msemibold'>Tháng {month}</Text>
        </TouchableOpacity>

        <View className='bg-white flex-row justify-around px-2 pt-1 pb-1 mt-1'>
          {dayOfWeek.map((day, index) => {
            const date = getDateWithOffset(index - currentDay)
            return (
              <View key={index} className='items-center'>
                <Text className='text-sm font-mmedium'>{day}</Text>
                {index == daySelect ? (
                  <TouchableOpacity onPress={() => handleDay(index)}>
                    <View className=' bg-blue_primary rounded-[100px] mt-2 w-7 h-7 items-center justify-center'>
                      <Text className='text-sm font-mmedium text-white '>{date}</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => handleDay(index)}>
                    <View className='  rounded-[100px] mt-2 w-7 h-7 items-center justify-center'>
                      <Text className='text-sm font-mregular'>{date}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )
          })}
        </View>
      </View>
     
      <ScrollView className='mt-2'>
     
         {listSub.map((item: ClassSession, index: number) => (
          <View key={index} className='border-y-[1px] border-slate-200 mb-2 pl-[5%] pr-2 py-2 bg-white'>
            <View className='flex-row items-center ml-[2px] w-[65%]'>
              <FontAwesome5 name="book" size={22} color="black" />
              <Text className='text-base ml-3 font-msemibold'>{item.code} </Text>
              <Text numberOfLines={1} ellipsizeMode='tail' className=' font-mregular'>({item.name}</Text>
              <Text>)</Text>
            </View>
            <View className='flex-row items-center mt-[4px]'>
              <MaterialCommunityIcons name="clock-time-eight-outline" size={22} color="black" />
              <Text className='text-base ml-3 font-mregular'>Thứ {item.dayOfWeek==7?'CN':item.dayOfWeek+1}, {item.start} - {item.end}</Text>
            </View>
            <View className='flex-row items-center mt-[2px]  ml-[1px]'>
              <MaterialIcons name="meeting-room" size={22} color="black" />
              <Text className='text-base ml-[14px] mt-1 font-mregular'>Phòng {item.room}</Text>
            </View>
            <View className='flex-row items-center mt-[3px] ml-[1px]'>
              <Ionicons name="person-circle-outline" size={22} color="black" />
              <Text className='text-base ml-[14px] font-mregular '>{item.hostName}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      </SafeAreaView>
  )
}