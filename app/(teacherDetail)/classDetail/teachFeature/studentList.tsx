import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { formatNoWeekday } from "@/utils/formatDate";
import { AuthContext } from "@/context/AuthContext";
import get from "@/utils/get";
import { localHost } from "@/utils/localhost";
import { colors } from "@/constants/colors";
import ButtonCustom from "@/components/ui/ButtonCustom";
import { LinearGradient } from "expo-linear-gradient";

type Props = {};
type Student = {
  id: string;
  name: string;
  userCode: string;
};

export default function StudentList({}: Props) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return;
  }
  const { user, accessToken } = authContext;
  const router = useRouter();
  const { date, attendId, subjectId } = useLocalSearchParams();
  const [tabAll, setTabAll] = useState<boolean>(true);
  const [allStudent, setAllStudent] = useState<Student[]>([]);
  const [presentStudent, setPresentStudent] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const random= () => {
    
    let randomStudent: Student | null = null;
    if(tabAll){
      if(allStudent.length > 0){
        const randomIndex = Math.floor(Math.random() * allStudent.length);
      randomStudent = allStudent[randomIndex];
      }
    }else{
      if(presentStudent.length > 0){
        const randomIndex = Math.floor(Math.random() * presentStudent.length);
      randomStudent = presentStudent[randomIndex];
      }
    }
    if(randomStudent){
      Alert.alert("Thông báo", `Sinh viên được chọn ngẫu nhiên là: ${randomStudent.userCode} - ${randomStudent.name}`);
    }
  }
  useEffect(() => {
    async function getAttend() {
      setLoading(true);
      const res = await get({
        url: localHost + `/api/v1/cAttend/${attendId}`,
        token: accessToken,
      });
      if (res) {
        if (res.status == 200) {
          setIsActive(res.data.cAttend.isActive);
          if (res.data.cAttend.isActive) {
            const url2 = `${localHost}/api/v1/cAttend/attendStudents/${attendId}`;
            const res2 = await get({ url: url2, token: accessToken });
            if (res2) {
              if (res2.status === 200) {
                setPresentStudent(res2.data.students.filter((student: any) => student.status=="CM"));
              } else {
                setLoading(false);
                Alert.alert(
                  "Thông báo",
                  "Đã xảy ra lỗi khi lấy danh sách sinh viên có mặt"
                );
              }
            }
          } else {
            setLoading(false);
            return;
          }
        } else {
          setLoading(false);
          Alert.alert(
            "Thông báo",
            "Đã xảy ra lỗi khi lấy danh sách sinh viên có mặt"
          );
        }
      } else {
        setLoading(false);
      }
      setLoading(false);
    }
    const getStudent = async () => {
      setLoading(true);
      const url = `${localHost}/api/v1/subject/${subjectId}/students`;
      const res = await get({ url, token: accessToken });
      if (res) {
        if (res.status === 200) {
          setAllStudent(res.data.students);
        } else {
          Alert.alert("Thông báo", "Đã xảy ra lỗi khi lấy danh sách sinh viên");
        }
      }
      setLoading(false);
    };
    getStudent();
    getAttend();
  }, []);
  return (
    <SafeAreaView className="flex-1">
      <View className=" shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center ">
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="chevron-back-sharp" size={24} color="white" />
        </TouchableOpacity>
        <View className="mx-auto items-center pr-6">
          <Text className="text-[18px] font-msemibold uppercase text-white">
            Danh sách sinh viên
          </Text>
          <Text className="mt-[-3px] text-white font-mmedium">
            {formatNoWeekday(date)}
          </Text>
        </View>
      </View>

      <View className="flex-row mx-auto mt-[4%] border-b-[1px] border-gray-300 mb-1">
        <TouchableOpacity onPress={() => setTabAll(true)}>
          <Text
            className={`text-base font-mmedium px-2 ${
              tabAll
                ? "text-black font-msemibold border-b-[2px] border-black -mb-[1.5px]  "
                : "text-gray_primary"
            }`}
          >
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTabAll(false)}>
          <Text
            className={`text-base font-mmedium px-2 ${
              tabAll
                ? "text-gray_primary"
                : "text-black font-msemibold border-b-[2px] border-black -mb-[1px] "
            }`}
          >
            Có đi học
          </Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.blue_primary} />
        </View>
      ) : (
        <ScrollView className="flex-1 w-[92%] mx-auto px-2">
          {tabAll ? (
            allStudent.length == 0 ? (
              <Text className="text-base text-gray-500 text-center mt-[30%]">
                Không có sinh viên
              </Text>
            ) : (
              allStudent.map((item, index) => (
                <View key={index} className="bg-white rounded-md p-3 mt-2 mb-1">
                  <Text className="text-base font-mregular text-center">
                    {index + 1}. {item.userCode} - {item.name}
                  </Text>
                </View>
              ))
            )
          ) : !isActive ? (
            <Text className="text-base text-gray-500 text-center mt-[30%]">
              Chưa bắt đầu điểm danh
            </Text>
          ) : presentStudent.length == 0 ? (
            <Text className="text-base text-gray-500 text-center mt-[30%]">
              Không có sinh viên có mặt
            </Text>
          ) : (
            presentStudent.map((item, index) => (
              <View key={index} className="bg-white rounded-md p-3 mt-3">
                <Text className="text-base font-mregular text-center">
                  {index + 1}. {item.userCode} - {item.name}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
      <LinearGradient
        className="h-[1px] bg-[#dbd7d7]"
        colors={["#F7F7F7", "#dbd7d7"]}
      />
      <View className="pb-4 pt-3">
        <ButtonCustom
          handle={random}
          content="Chọn ngẫu nhiên"
          otherStyle="w-44 rounded-2xl"
        />
      </View>
    </SafeAreaView>
  );
}

