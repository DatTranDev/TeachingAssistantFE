import React, { useContext, useState } from 'react'
import { Text, View, Alert, TouchableOpacity,ScrollView,SafeAreaView } from 'react-native'
import post from '@/utils/post';
import { localHost } from '@/utils/localhost';
import { AuthContext } from '@/context/AuthContext';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import get from '@/utils/get';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = {}

export default function Timetable({ }: Props) {
  const authContext = useContext(AuthContext);
  const [listSub,setListSub]= useState([])

  if (!authContext) {
    Alert.alert("Thông báo", "Đã xảy ra lỗi")
    return;
    // throw new Error('AuthContext is undefined, make sure you are using AuthProvider');      
  }
  const {user,accessToken}= authContext;
  const currentDay = new Date().getDay();
  const currentDate = new Date().getDate();
  const [daySelect, setDaySelect] = useState(currentDay)
  const dayOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const getDateWithOffset = (offset: number) => {
    const date = new Date(); // Tạo một bản sao của ngày hôm nay
    date.setDate(currentDate + offset); // Cộng thêm số ngày để tính ngày trong tuần
    return date.getDate();
  };
  const handleDay = (day: any) => {
    console.log(day)
    const num = Number(day)
    setDaySelect(num);
  }

  const month = new Date().getMonth() + 1;
  const getSub=async()=>{
    const url =`${localHost}/api/v1/subject/findByUserid/${user?.id}`
    const response= await get({url,token:accessToken})
    if(response)
    {
      if(response.status==200)
      {
          setListSub(response.data)
      }else{
        Alert.alert('Thông báo','Đã xảy ra lỗi, vui lòng quay lại sau')
      }
    }else{
      Alert.alert('Thông báo','Đã xảy ra lỗi, vui lòng quay lại sau')
    }

  }
  const postTest = async () => {
    const url = `${localHost}/api/v1/subject/add`
    const data = {
      "code": "SE123.P12",
      "name": "Phương pháp phát triển phần mềm hướng đối tượng",
      "hostId": authContext.user?.id,
      "startDay": "09/04/2024",
      "endDay": "29/12/2024"
    }
    const token = authContext.refreshToken
    const response = await post({ url, data, token })
    console.log(response?.data)

  }
  return (
    <SafeAreaView className='flex-1'>
      <View className='bg-white pb-[3%]  border-b-[1px] border-gray-200 '>
        <Text className='mx-auto mt-[13%] text-[18px] font-msemibold'>THỜI KHÓA BIỂU</Text>
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
         <View className='border-y-[1px] border-slate-200 mb-2 pl-[5%] pr-2 py-2 bg-white'>
        <View className='flex-row items-center ml-[2px]'>
        <FontAwesome5 name="book" size={22} color="black" />
        <Text  className='text-base ml-3 font-msemibold'>SE310.P12 </Text>
        <Text numberOfLines={1} ellipsizeMode='tail' className='w-[60%]'>(Phương pháp phát triển phần mềm hướng đối tượng</Text>
        <Text>)</Text>
        </View>
        <View className='flex-row items-center mt-[4px]'>
        <MaterialCommunityIcons name="clock-time-eight-outline" size={22} color="black" />
        <Text className='text-base ml-3'>Thứ 2, 7:30 - 9:35</Text>
        </View>
        <View className='flex-row items-center mt-[2px] ml-[1px]'>
        <MaterialIcons name="meeting-room" size={22} color="black" />
        <Text className='text-base ml-[14px] pt-1'>Phòng B3.12</Text>
        </View>
        
       
      </View>    
     
      </ScrollView>
     
     

    </SafeAreaView>
  )
}