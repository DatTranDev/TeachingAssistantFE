import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView, TouchableOpacity, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Attend } from "./listRoom";
import { AuthContext } from "@/context/AuthContext";
import { localHost } from "@/utils/localhost";
import get from "@/utils/get";

type Props = {};
export type Document = {
  attendId: string;
  date: string;
  sessionNumber: number;
};

export default function Document({}: Props) {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return;
  }
  const { accessToken,user } = authContext;
  const { subjectId, name, code } = useLocalSearchParams();
  const [listDocument,setListDocument] = useState<Document[]>([])
  useEffect(()=>{
    async function fetchData(){
      const res = await get({
        url:`${localHost}/api/v1/cAttend/findBySubject/${subjectId}`,
        token:accessToken
      })
      if(res && res.status == 200){
        const data:Document[] = res.data.cAttends.reverse().map((item:any)=>({
          attendId:item.id,
          date:item.date,
          sessionNumber:item.sessionNumber
        }))
        setListDocument(data)
      }
    }
    fetchData()
  },[])
   function formatDate(dateString: string) {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long', // Thứ trong tuần
        day: '2-digit',  // Ngày
        month: '2-digit', // Tháng
        year: 'numeric',  // Năm
      };
      const date = new Date(dateString);
      // const vietnameseWeekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      // const weekday = vietnameseWeekdays[date.getDay()];
      // Chuyển đổi ngày tháng năm sang định dạng yêu cầu
      console.log(date)
      const formattedDate = `${date.toLocaleDateString('vi-VN', options)}`;
      return formattedDate;
    }
    function clickDocument(attendId:string,date:string,sessionNumber:number){
      router.push({
            pathname: '/(studentDetail)/classDetail/detailDocument', 
            params: {
                attendId:attendId,
                date:date,
                sessionNumber:sessionNumber
            },
          });
    }

  return (
    <SafeAreaView className='h-full'>
      <View className=' shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center '>
        <TouchableOpacity onPress={router.back}>
          <Ionicons name='chevron-back-sharp' size={24} color='white' />
        </TouchableOpacity>
        <View className='mx-auto items-center pr-6'>
          <Text className='text-[18px] font-msemibold uppercase text-white'>
            {code}
          </Text>
          <Text className='mt-[-3px] text-white font-mmedium'>Tài liệu</Text>
        </View>
      </View>
      <Text className=' text-center text-base font-semibold mt-[4%]'>Danh sách các buổi học</Text>
      <ScrollView className='h-full'>
        <View className='mt-3'></View>
        {listDocument.length==0?<View className='flex-1 items-center justify-center h-full'>
          <Text className='text-gray-500'>Không tìm thấy</Text>
          </View> 
          :
          listDocument.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => clickDocument(item.attendId, item.date,item.sessionNumber)}
            className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
            <View className='mx-auto items-center justify-center'>
              <Text className='text-black text-sm font-mmedium '>
                Buổi {item.sessionNumber}
              </Text>
              <Text className='text-black text-base font-msemibold mt-1'>
                {formatDate(item.date)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
