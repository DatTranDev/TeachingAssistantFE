import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { Link, Redirect } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import ButtonCustom from '@/components/ui/ButtonCustom';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import get from '@/utils/get';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ClassSession } from './timetable';
import { localHost } from '@/utils/localhost';
import { AuthContext } from '@/context/AuthContext';
import { useFocusEffect } from 'expo-router';
import { colors } from '@/constants/colors';

type Props = {};
export type Time = {
  numberOfWeek: number;
  start: string;
  end: string;
};
export type Subject = {
  id: string;
  name: string;
  times: Time[];
  hostName: string;
  code: string;
};
export default function Classes(props: Props) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    Alert.alert('Thông báo', 'Đã xảy ra lỗi');
    return;
  }
  const [data, setData] = useState<ClassSession[]>([]);
  const { user, accessToken } = authContext;
  const router = useRouter();
  const [listSub, setListSub] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const addClass = () => {
    router.push('/(studentDetail)/classDetail/addClass');
  };
  const clickClass = (sub: Subject) => {
    router.push({
      pathname: '/classDetail/feature',
      params: {
        subjectId: sub.id,
        name: sub.name,
        code: sub.code
      }
    });
  };
  const checkTime = (times: Time[]) => {
    const currentTime = new Date();
    const currentDay = currentTime.getDay();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    // Chuyển đổi thời gian hiện tại sang định dạng phút
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    for (const time of times) {
      // Chuyển đổi chuỗi thời gian (vd: "7:30") sang phút
      const [startHour, startMinute] = time.start.split(':').map(Number);
      const startTimeInMinutes = startHour * 60 + startMinute;

      const [endHour, endMinute] = time.end.split(':').map(Number);
      const endTimeInMinutes = endHour * 60 + endMinute;

      // Kiểm tra nếu là cùng ngày và trong khoảng thời gian
      if (
        time.numberOfWeek === currentDay &&
        currentTimeInMinutes >= startTimeInMinutes &&
        currentTimeInMinutes <= endTimeInMinutes
      ) {
        return true;
      }
    }
    return false;
  };
  const getSub = async () => {
    setLoading(true);
    const url = `${localHost}/api/v1/classSession/findByUser/${user?.id}`;
    const response = await get({ url, token: accessToken });

    if (response ) {
      if (response.status == 200) {
        const formattedData: ClassSession[] = response.data.classSessions.map(
          (item: any) => ({
            idSubject: item.subjectId,
            code: item.subject.code,
            name: item.subject.name,
            startDay: item.subject.startDay,
            endDay: item.subject.endDay,
            room: item.room,
            hostName: item.subject.host.name,
            start: item.start,
            end: item.end,
            dayOfWeek: item.dayOfWeek,
          })
        );
        setData(formattedData);
        const listSubject = formattedData.reduce(
          (acc: Subject[], item: ClassSession) => {
            const existingSubject = acc.find((s) => s.id === item.idSubject);
            if (existingSubject) {
              existingSubject.times.push({
                numberOfWeek: item.dayOfWeek,
                start: item.start,
                end: item.end,
              });
            } else {
              acc.push({
                id: item.idSubject,
                name: item.name,
                code: item.code,
                hostName: item.hostName,
                times: [
                  {
                    numberOfWeek: item.dayOfWeek,
                    start: item.start,
                    end: item.end,
                  },
                ],
              });
            }
            return acc;
          },
          [] as Subject[]
        );
        setListSub(listSubject);
      } else {
        Alert.alert("Thông báo", "Đã xảy ra lỗi, vui lòng quay lại sau");
      }
    } 
    setLoading(false);
  };
  useFocusEffect(
    React.useCallback(() => {
      getSub();
    }, [])
  );
  return (
    <SafeAreaView className='flex-1'>
      <View className='bg-blue_primary pb-[3.5%]  border-b-[1px] border-gray-200 '>
        <Text className='mx-auto mt-[13%] text-[18px] font-msemibold text-white uppercase'>
          Danh sách lớp học
        </Text>
      </View>
      <View>
        <TouchableOpacity
          className={`bg-blue_primary rounded-2xl ml-[3%] mr-auto  px-2 py-2 mt-[5%] `}
          onPress={addClass}>
          <View className={`items-center rounded-3xl flex-row`}>
            <Entypo name='plus' size={22} color='white' />
            <Text className='text-[16px] text-white font-semibold ml-1'>
              Tham gia lớp học
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      {/* list */}
      <ScrollView className='mt-4'>
        {loading ? (
          <ActivityIndicator className='mt-[50%]' size="large" color={colors.blue_primary} />
        ) : (
          listSub.length > 0 ? (
            listSub.map((item: Subject, index: number) => (
              <TouchableOpacity key={index} onPress={() => clickClass(item)}>
              <View className='border-y-[1px] border-slate-200 mb-2 pl-[5%] pr-2 py-3 bg-white'>
                {checkTime(item.times) ? (
                <Text className='text-green font-medium ml-[2px] mt-[-4px] mb-2'>
                  Đang diễn ra
                </Text>
              ) : (
                ''
              )}
              <View className='flex-row items-center ml-[3px]'>
                <FontAwesome5 name='book' size={22} color='black' />
                <Text className='text-base ml-4 font-msemibold'>
                  {item.code}{' '}
                </Text>
              </View>

              <View className='flex-row items-center mt-[4px] ml-[1px]'>
                <MaterialCommunityIcons
                  name='checkbook'
                  size={24}
                  className='w-5 h-7'
                  color='black'
                />
                <Text
                  numberOfLines={2}
                  ellipsizeMode='tail'
                  className='w-[85%] text-base ml-[14px] font-mregular'>
                  {item.name}
                </Text>
              </View>
              <View className='flex-row items-center mt-[4px]'>
                <Ionicons
                  name='person-circle-outline'
                  size={24}
                  color='black'
                />
                <Text className='text-base ml-[14px] font-mregular'>
                  {item.hostName}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          ))
        ) : (
          <View className='flex-row items-center justify-center mt-4'>
            <Text className='text-gray-600 text-center'>
              Không có lớp học nào
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
