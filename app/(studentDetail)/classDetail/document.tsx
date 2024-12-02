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
export type Document={
      attendId:string,
      date:string,
  }

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
      console.log(`${localHost}/api/v1/cAttend/findBySubject/${subjectId}`)
      const res = await get({
        url:`${localHost}/api/v1/cAttend/findBySubject/${subjectId}`,
        token:accessToken
      })
      if(res && res.status == 200){
        setListDocument(res.data.cAttends.reverse())
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
    function clickDocument(attendId:string,date:string){
      router.push({
            pathname: '/(studentDetail)/classDetail/detailDocument', 
            params: {
                attendId:attendId,
                date:date
            },
          });
    }

  return (
    <SafeAreaView className="h-full">
      <View className=" shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center ">
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="chevron-back-sharp" size={24} color="white" />
        </TouchableOpacity>
        <View className="mx-auto items-center pr-6">
          <Text className="text-[18px] font-msemibold uppercase text-white">
            {code}
          </Text>
          <Text className="mt-[-3px] text-white font-mmedium">Tài liệu</Text>
        </View>
      </View>
      <ScrollView className="h-full">
        <View className="mt-4"></View>
        {listDocument.map((item,index)=>(
                <TouchableOpacity key={index} onPress={()=>{clickDocument(item.attendId,item.date)}} className='flex-row bg-white w-[92%] mx-auto py-3 rounded-xl shadow-md items-center justify-end px-5 mb-3'>
                                <View className='mx-auto items-center justify-center'>
                                {/* <Text>{item.quantity} tài liệu</Text> */}
                              <Text className='text-base font-msemibold text-blue_primary'>{formatDate(item.date)}</Text>
                                </View>
                </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
