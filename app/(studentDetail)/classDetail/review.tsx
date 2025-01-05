import React, { useCallback, useContext, useEffect, useState } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';
import { localHost } from '@/utils/localhost';
import { useLocalSearchParams } from 'expo-router';
import get from '@/utils/get';
import { formatNoWeekday } from '@/utils/formatDate';
import { useFocusEffect } from '@react-navigation/native';
type Props = {}
export type Review = {
  attendId: string,
  date: string,
  reviewed: boolean,
  sessionNumber: number
}
export default function Review({ }: Props) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    Alert.alert("Thông báo", "Đã xảy ra lỗi")
    return;
  }
  const { accessToken, user } = authContext;
  const [listReview, setListReview] = useState<Review[]>([])
  const router = useRouter()
  const { subjectId, name, code } = useLocalSearchParams()
  async function getData() {
    const url = `${localHost}/api/v1/cAttend/findBySubject/${subjectId}`;
    const res = await get({ url: url, token: accessToken });
    const url2 = `${localHost}/api/v1/subject/${subjectId}/user/${user?.id}/reviews`;
    const res2 = await get({ url: url2, token: accessToken });
    console.log(res2);
    if (res && res.status == 200 && res2 && res2.status == 200) {
      const listAttend = res.data.cAttends;
      const listReview = res2.data.reviews;
      const data = listAttend
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sắp xếp giảm dần theo ngày
        .map((item: any) => ({
          attendId: item.id,
          date: item.date,
          reviewed: listReview.find(
            (review: any) => review.cAttendId.id == item.id
          ),
          sessionNumber: item.sessionNumber
        }));
      setListReview(data);
    }
  }
  useFocusEffect(
    useCallback(() => {
      getData()
    }, [])
  )
  const clickReview = (attendId: string, date: string) => {
    router.push({
      pathname: '/(studentDetail)/classDetail/detailReview',
      params: {
        attendId: attendId,
        date: date
      },
    });
  }

  return (
    <SafeAreaView className='flex-1'>
      <View className=' shadow-md  pb-[1.8%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center '>
        <TouchableOpacity onPress={router.back}>
          <Ionicons name='chevron-back-sharp' size={24} color='white' />
        </TouchableOpacity>
        <View className='mx-auto items-center pr-6'>
          <Text className='text-[18px] font-msemibold uppercase text-white'>
            {code}
          </Text>
          <Text className='mt-[-3px] text-white font-mmedium'>
            Đánh giá
          </Text>
        </View>
      </View>
      <Text className=' text-center text-base font-semibold mt-3'>Danh sách các buổi học</Text>
      <ScrollView className='mt-3'>
        {listReview.length == 0 ? <View className='flex-1 items-center justify-center h-full'>
          <Text className='text-gray-500'>Không tìm thấy</Text>
          </View> 
          :
          listReview.map((item, index) => {
            return !item.reviewed ? (
              <TouchableOpacity
                key={index}
                onPress={() => clickReview(item.attendId, item.date)}
                className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                <View className='mx-auto items-center justify-center'>
                  <Text> Buổi {item.sessionNumber} - {formatNoWeekday(item.date)}</Text>
                  <Text className='text-[#FE3535] text-base font-mmedium mt-1'>
                    Chưa đánh giá
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={index}
                onPress={() => clickReview(item.attendId, item.date)}
                className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                <View className='mx-auto items-center justify-center'>
                  <Text> Buổi {item.sessionNumber} - {formatNoWeekday(item.date)}</Text>
                  <Text className='text-green text-base font-mmedium mt-1'>
                    Đã đánh giá
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
}