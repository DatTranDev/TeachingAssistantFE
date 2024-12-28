import React, { useContext, useEffect, useState } from "react";
import {
   View,
   Text,
   TouchableOpacity,
   SafeAreaView,
   ScrollView,
   Alert
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Foundation from "@expo/vector-icons/Foundation";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { formatNoWeekday } from "@/utils/formatDate";
import get from "@/utils/get";
import { localHost } from "@/utils/localhost";
import { AuthContext } from "@/context/AuthContext";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from "@expo/vector-icons/AntDesign";
import post from "@/utils/post";
import deleteApi from "@/utils/delete";


type Props = {};

export default function TeachFeature({}: Props) {
   const authContext = useContext(AuthContext);
   if (!authContext) {
      Alert.alert("Thông báo", "Đã xảy ra lỗi");
      return;
   }
   const { accessToken, user } = authContext;
   const router = useRouter();
   const { subjectId, name, code, attendId, date, sessionNumber } = useLocalSearchParams();
   const [questionResolved, setQuestionResolved] = useState<number>(0);
   const getQuestionResolved = async () => {
      const res = await get({
         url: `${localHost}/api/v1/discussion/findByCAttend/${attendId}?limit=100&page=1`,
         token: accessToken
      });
      if (res && res.status == 200) {
         const num = res.data.discussions.reduce(
            (acc: number, curr: any) => (curr.isResolved ? acc : acc + 1),
            0
         );
         setQuestionResolved(num);
      }
   };
   useEffect(() => {
      getQuestionResolved();
   }, []);
   const rollCall = async () => {
      router.push({
         pathname: "/classDetail/teachFeature/rollCall",
         params: {
            subjectId: subjectId,
            name: name,
            code: code,
            date: date,
            sessionNumber: sessionNumber,
            attendId: attendId,
         }
      });
   };
   const review = async () => {
      router.push({
         pathname: "/classDetail/teachFeature/review",
         params: {
            subjectId: subjectId,
            name: name,
            code: code,
            attendId:attendId,
            date:date
         }
      });
   };
   const chat = async () => {
      router.push({
         pathname: "/classDetail/teachFeature/chat",
         params: {
            subjectId: subjectId,
            name: name,
            code: code
         }
      });
   };
   const document = async () => {
      router.push({
         pathname: "/classDetail/teachFeature/document",
         params: {
            subjectId: subjectId,
            name: name,
            code: code,
            attendId: attendId,
            date: date
         }
      });
   };
   const question = async () => {
      router.push({
         pathname: "/classDetail/teachFeature/discussion",
         params: {
            subjectId: subjectId,
            name: name,
            code: code,
            cAttendId: attendId,
            date: date
         }
      });
   };
   const studentList = async () => {
      router.push({
         pathname: "/classDetail/teachFeature/studentList",
         params: {
            subjectId: subjectId,
            name: name,
            code: code,
            attendId: attendId,
            date: date
         }
      });
   };
   const deleteAttend = async () => {
      Alert.alert("Thông báo", "Bạn có chắc chắn muốn xóa buổi học này không?", [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Xóa",
          onPress: async () => {
            const res = await deleteApi({
              url: `${localHost}/api/v1/cAttend/delete/${attendId}`,
              token: accessToken,
            });
            if (res ) {
               console.log(res);
               if (res.status == 200) {
                  Alert.alert("Thông báo", "Xóa buổi học thành công");
                  router.back();
               } else {
                  Alert.alert("Thông báo", "Xóa buổi học thất bại");
               }
            }
          }
        }
      ]);
   }
   return (
     <SafeAreaView>
       <View className=" shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center ">
         <TouchableOpacity onPress={router.back}>
           <Ionicons name="chevron-back-sharp" size={24} color="white" />
         </TouchableOpacity>
         <View className="mx-auto items-center">
           <Text className="text-[18px] font-msemibold uppercase text-white">
             {code}
           </Text>
           <Text className="mt-[-3px] text-white font-mmedium">
             {formatNoWeekday(date)}
           </Text>
         </View>
            <TouchableOpacity onPress={deleteAttend}>
            <AntDesign name="delete" size={24} color="white" />
         </TouchableOpacity>
       </View>
       <View>
         <TouchableOpacity
           onPress={studentList}
           className="flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-[10%]   "
         >
           <FontAwesome name="list-alt" size={24} color="black" />
           <Text className="text-base font-msemibold ml-4 mr-auto">
             Danh sách sinh viên
           </Text>
         </TouchableOpacity>
         <TouchableOpacity
           onPress={rollCall}
           className="flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-3   "
         >
           <FontAwesome6 name="calendar-check" size={24} color="black" />
           <Text className="text-base font-msemibold ml-4 mr-auto">
             Điểm danh
           </Text>
         </TouchableOpacity>
         <TouchableOpacity
           onPress={chat}
           className="flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-3"
         >
           <Ionicons
             name="chatbubble-ellipses-outline"
             size={24}
             color="black"
           />
           <Text className="text-base font-msemibold ml-4 mr-auto">
             Thảo luận
           </Text>
         </TouchableOpacity>
         <TouchableOpacity
           onPress={question}
           className="flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-3 "
         >
           <View className="ml-1">
             <FontAwesome6 name="question" size={24} color="black" />
           </View>
           <Text className="text-base font-msemibold ml-5 mr-auto">
             Câu hỏi
           </Text>
           <Text className="ml-auto text-red text-base font-medium">
             ({questionResolved})
           </Text>
         </TouchableOpacity>
         <TouchableOpacity
           onPress={review}
           className="flex-row items-center bg-white w-[94%] mx-auto px-[7%] py-4 rounded-2xl mt-3"
         >
           <Foundation name="clipboard-pencil" size={24} color="black" />
           <Text className="text-base font-msemibold ml-4 mr-auto">
             Đánh giá
           </Text>
         </TouchableOpacity>
         <TouchableOpacity
           onPress={document}
           className="flex-row items-center bg-white w-[94%] mx-auto px-[7%] py-4 rounded-2xl mt-3"
         >
           <MaterialCommunityIcons
             name="file-document-outline"
             size={24}
             color="black"
           />
           <Text className="text-base font-msemibold ml-4 mr-auto">
             Tài liệu
           </Text>
         </TouchableOpacity>
       </View>
     </SafeAreaView>
   );
}
