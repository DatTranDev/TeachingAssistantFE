import React, { useContext, useEffect, useState } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';
import { localHost } from '@/utils/localhost';
import { useLocalSearchParams } from 'expo-router';
import get from '@/utils/get';
import { formatNoWeekday, formatDate } from '@/utils/formatDate';
import ButtonCustom from '@/components/ui/ButtonCustom';
import Entypo from '@expo/vector-icons/Entypo';
import post from '@/utils/post';
type Props = {}
export type Session = {
  attendId: string,
  date: string,
  sessionNumber: number
}
type ClassSession = {
  idSubject: string,
  id: string,
  dayOfWeek: number
}
export default function Sessions({ }: Props) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    Alert.alert("Thông báo", "Đã xảy ra lỗi")
    return;
  }
  const { accessToken, user } = authContext;
  const [listSession, setListSession] = useState<Session[]>([])
  const router = useRouter()
  const { subjectId, code } = useLocalSearchParams()
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const getClassSessionId = async () => {
    const today = new Date().getDay();
    const url = `${localHost}/api/v1/classSession/findByUser/${user?.id}`;
    const response = await get({ url, token: accessToken });
    if (response) {
      if (response.status == 200) {
        const formattedData: ClassSession[] = response.data.classSessions.map((item: any) => item.subjectId == subjectId ? ({
          idSubject: item.subjectId,
          id: item.id,
          dayOfWeek: item.dayOfWeek
        }) : null).filter((item: ClassSession | null) => item !== null);
        // Tìm classSession có dayOfWeek gần với hôm nay nhất
        const closestSession = formattedData.reduce((prev, curr) => {
          return Math.abs(curr.dayOfWeek - today) < Math.abs(prev.dayOfWeek - today) ? curr : prev;
        });
        if (closestSession) {
          return closestSession.id
        }
        else {
          Alert.alert('Thông báo', 'Đã xảy ra lỗi, vui lòng quay lại sau');
          return null
        }
      }
      else {
        Alert.alert('Thông báo', 'Đã xảy ra lỗi, vui lòng quay lại sau');
        return null
      }
    }
    Alert.alert('Thông báo', 'Đã xảy ra lỗi, vui lòng quay lại sau');
    return null
  }
    useEffect(() => {
      async function getData() {
        const url = `${localHost}/api/v1/cAttend/findBySubject/${subjectId}`
        const res = await get({ url: url, token: accessToken })
        if (res && res.status == 200) {
          const listAttend = res.data.cAttends;
          const data = listAttend.map((item: any) => ({
            attendId: item.id,
            date: item.date,
            sessionNumber: item.sessionNumber
          }))
          setCurrentSession(data.reduce((prev: Session |null, curr: Session) => {
            return Math.abs(curr.sessionNumber) > Math.abs(prev?.sessionNumber || 0) ? curr : prev;
          }, null))
          setListSession(data.reverse())
        }
      }
      getData()
    }, [])
    const clickReview = (attendId: string, date: string) => {
      router.push({
        pathname: '/(teacherDetail)/classDetail/teachFeature',
        params: {
          attendId: attendId,
          date: date,
          subjectId: subjectId,
          code: code
        },
      });
    }
    function getWeekDay(dateString: string | string[]) {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long', // Thứ trong tuần
      };
      const date = new Date(String(dateString));
      const formattedDate = `${date.toLocaleDateString('vi-VN', options)}`;
      return formattedDate;
    }
    const addAttend = async () => {
      const classSessionId = await getClassSessionId()
      if (classSessionId) {
        const url = `${localHost}/api/v1/cAttend/add`
        const res = await post({ url: url, token: accessToken, data: {
          classSessionId: classSessionId,
          date: formatNoWeekday(new Date().toISOString()),
          sessionNumber: currentSession ? currentSession.sessionNumber + 1 : 1,
          teacherLatitude: 0,
          teacherLongitude: 0,
          isActive: true,
          timeExpired: 0
        }})
        if(res)
        {
          console.log(res.data)
          if (res.status == 201) {
            setListSession([...listSession, {
              attendId: res.data.cAttend.id,
              date: res.data.cAttend.date,
              sessionNumber: res.data.cAttend.sessionNumber
            }])
            Alert.alert('Thông báo', 'Thêm buổi học thành công')
          }
          else {
            Alert.alert('Thông báo', 'Đã xảy ra lỗi, vui lòng quay lại sau')
          }
        }
      }
    }
    const handleAddAttend = async () => {
      Alert.alert('Thông báo', 'Bạn có chắc chắn muốn bắt đầu buổi học mới không?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đồng ý', onPress: addAttend }
      ])
    }

    return (
      <SafeAreaView className='flex-1'>
        <View className=" shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center ">
          <TouchableOpacity onPress={router.back}>
            <Ionicons name="chevron-back-sharp" size={24} color="white" />
          </TouchableOpacity>
          <View className="mx-auto items-center pr-6">
            <Text className="text-[18px] font-msemibold uppercase text-white">
              {code}
            </Text>
            <Text className="mt-[-3px] text-white font-mmedium">Danh sách buổi học</Text>
          </View>
        </View>
        <TouchableOpacity className={`bg-blue_primary rounded-2xl ml-[3%] mr-auto  px-2 py-2 mt-[5%] `} onPress={handleAddAttend} >
          <View className={`items-center rounded-3xl flex-row`}>
            <Entypo name="plus" size={22} color="white" />
            <Text className="text-[16px] text-white font-semibold ml-1">Bắt đầu buổi mới</Text>
          </View>
        </TouchableOpacity>
        <ScrollView className='mt-4'>
          {listSession.map((item, index) => {
            return (
              <TouchableOpacity key={index} onPress={() => clickReview(item.attendId, item.date)} className='flex-row bg-white w-[100%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                <View className='mx-auto items-center justify-center'>
                  <Text className='text-black text-sm font-mmedium '>Buổi {item.sessionNumber}</Text>
                  <Text className='text-black text-base font-msemibold mt-1'>{formatDate(item.date)}</Text>
                </View>
              </TouchableOpacity>
            )
          })}

        </ScrollView>
      </SafeAreaView>
    )
  }