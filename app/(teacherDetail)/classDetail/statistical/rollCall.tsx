import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Linking
} from "react-native";
import get from "@/utils/get";
import { localHost } from "@/utils/localhost";
import { AuthContext } from "@/context/AuthContext";
import { formatNoWeekday } from "@/utils/formatDate";
import Loading from "@/components/ui/Loading";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Clipboard from "expo-clipboard";
import * as IntentLauncher from "expo-intent-launcher";
import mime from "react-native-mime-types";
import { Platform } from 'react-native';
import { openFile } from "@/utils/openFile";
import { useFocusEffect } from "@react-navigation/native";

type Props = {};
type DetailRollCall = {
  attendId: string;
  sessionNumber: number;
  date: string;
  presentStudents: number;
};
export default function RollCall({}: Props) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    Alert.alert("Thông báo", "Đã xảy ra lỗi");
    return;
  }
  const { accessToken, user } = authContext;
  const { code, subjectId } = useLocalSearchParams();
  const [totalStudent, setTotalStudent] = useState(0);
  const [percentPresent, setPercentPresent] = useState<number>(0);
  const [detailRollCalls, setDetailRollCalls] = useState<DetailRollCall[]>([]);
  const [totalRollCall, setTotalRollCall] = useState(0);
  const [totalSession, setTotalSession] = useState(0);
  const [loading, setLoading] = useState(false);
  const [urlFile, setUrlFile] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const getData = async () => {
    setLoading(true);
    let total = 0;
    const url3 = `${localHost}/api/v1/subject/${subjectId}/students`;
    const res3 = await get({ url: url3, token: accessToken });
    if (res3 && res3.status === 200) {
      setTotalStudent(res3.data.students.length);
      total = res3.data.students.length;
    }
    const url = `${localHost}/api/v1/cAttend/findBySubject/${subjectId}`;
    const res = await get({ url, token: accessToken });
    if (res && res.status === 200) {
      const listAttend = res.data.cAttends.map((item: any) => {
        return {
          attendId: item.id,
          sessionNumber: item.sessionNumber,
          date: item.date,
        };
      });
      setTotalRollCall(listAttend.length);
      setTotalSession(res.data.cAttends.length);
      const updatedListAttend = await Promise.all(
        listAttend.map(async (item: DetailRollCall) => {
          const url2 = `${localHost}/api/v1/cAttend/attendStudents/${item.attendId}`;
          const res2 = await get({ url: url2, token: accessToken });
          if (res2 && res2.status == 200) {
            return {
              ...item,
              presentStudents: res2.data.students.filter((student: any) => student.status=="CM").length,
            };
          }
          return item; // Trả về item gốc nếu không có dữ liệu
        })
      );
      const presentStudents = updatedListAttend.reduce(
        (sum, item) => sum + item.presentStudents,
        0
      );
      
      setPercentPresent(
        Number(
          (
            (presentStudents / (total * updatedListAttend.length)) *
            100
          ).toFixed(2)
        ) || 0
      );
      setDetailRollCalls(updatedListAttend);
    }
    setLoading(false);
  };
  const goToDetailRollCall = (item: DetailRollCall) => {
    router.push({
      pathname: "/classDetail/teachFeature/rollCall",
      params: {
        attendId: item.attendId,
        sessionNumber: item.sessionNumber,
        date: item.date,
        subjectId: subjectId,
      },
    });
  };
  const exportFile = async () => {
    setLoading(true)
    const res = await get({
      url: localHost + `/api/v1/subject/${subjectId}/students/exportExcel`,
      token: accessToken,
    });
    if (res) {
      if (res.status == 200) {
        setUrlFile(res.data.url);
        setOpenModal(true)
      } else {
        Alert.alert("Thông báo", "Đã xảy ra lỗi");
      }
    }
    setLoading(false)
   
  };
  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(urlFile);
      Alert.alert("Sao chép thành công", "Liên kết đã được sao chép vào clipboard.");
      setOpenModal(false)
    } catch (error) {
      Alert.alert("Lỗi", "Không thể sao chép dữ liệu.");
      console.error("Lỗi sao chép clipboard:", error);
    }
  };
   
    const extractFileName = (url: string): string | null => {
      const regex = /files%2F([^?]*)/; // Tìm phần sau 'files%2F' cho đến trước dấu '?'
      const match = url.match(regex);
      if (match && match[1]) {
        const fileName = decodeURIComponent(match[1]); // Giải mã các ký tự đặc biệt
        return fileName.replace(/_\d+$/, ""); // Loại bỏ phần '_<số>' ở cuối
      }
      return null;
    };
    const downloadAndShareFile = async (url:string) => {
      try {
        console.log(url)
        const fileName = extractFileName(url); // Hàm lấy tên tệp từ URL
        if(fileName){
          const fileUri = `${FileSystem.documentDirectory}${fileName}`;    
        setLoading(true); // Đặt trạng thái loading
        // Tải tệp
        const downloadResumable = FileSystem.createDownloadResumable(url, fileUri);
        const result = await downloadResumable.downloadAsync();
    
        if (result && result.uri) {
          await Sharing.shareAsync(result.uri);
        } else {
          Alert.alert('Lỗi', 'Không thể tải tài liệu');
        }
      }
      } catch (error) {
        Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải tài liệu');
      } finally {
        setLoading(false); // Đảm bảo cập nhật trạng thái loading
      }
    };


  useFocusEffect(
    React.useCallback(() => {
      getData();
    }, [])
  );
  return (
    <SafeAreaView className="flex-1">
      <Loading loading={loading} />
      <Modal
        animationType="fade"
        transparent={true}
        visible={openModal}
        onRequestClose={() => setOpenModal(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onPress={() => setOpenModal(false)}
        >
          <Pressable className="mt-2 bg-white items-center py-3 rounded-lg px-3 mx-[5%]">
            <View className="items-center ">
              <Text className="text-center text-gray-600">Đây là liên kết file của bạn</Text>
              <Text className="text-blue_primary underline">{urlFile}</Text>
            </View>
            <View className="flex-row items-center gap-3 mt-2">
              <TouchableOpacity onPress={handleCopy} className="py-[6px] bg-blue_primary rounded-2xl w-28 mx-auto mt-2">
                <Text className="text-white text-center text-base">
                  Sao chép
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => downloadAndShareFile(urlFile)} className="py-[6px] bg-green opacity-90 rounded-2xl w-28 mx-auto mt-2">
                <Text className="text-white text-center text-base">
                  Chia sẻ
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </TouchableOpacity>
      </Modal>
      <View className=" shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center ">
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="chevron-back-sharp" size={24} color="white" />
        </TouchableOpacity>
        <View className="mx-auto items-center pr-6">
          <Text className="text-[18px] font-msemibold uppercase text-white">
            {code}
          </Text>
          <Text className="mt-[-3px] text-white font-mmedium">Điểm danh</Text>
        </View>
      </View>
      <Text className={`text-center text-base font-msemibold mt-[4%]`}>
        Tất cả
      </Text>
      <View className=" bg-white  px-[4%] mx-auto rounded-2xl pt-1 pb-2 gap-y-1 mt-2 ">
        <Text className="mt-[-6px] mb-[2px] text-blue_primary text-center">
          Đã điểm danh {totalRollCall}/{totalSession} buổi
        </Text>
        <View className="flex-row items-center">
          <Text className="text-base font-mregular mr-2">
            Tổng số sinh viên
          </Text>
          <Text className="text-base font-msemibold mr-2 ml-3">
            {totalStudent}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-base font-mregular mr-2">Tỷ lệ điểm danh</Text>
          <Text
            className={`text-base font-msemibold mr-2 ml-3 ${
              percentPresent < 40
                ? "text-red"
                : percentPresent < 80
                ? "text-orange"
                : "text-green"
            }`}
          >
            {percentPresent}%
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={exportFile} className="py-2 px-3 bg-blue_primary rounded-2xl w-32 mx-auto mt-2">
        <Text className="text-white text-center text-base">Xuất file</Text>
      </TouchableOpacity>
      <Text className={`text-center text-base font-msemibold mt-3 -mb-1`}>
        Chi tiết
      </Text>
      <ScrollView className="mt-2">
        {detailRollCalls.length == 0 ? (
          <Text className="text-center text-gray-500 font-msemibold mt-5">
            Không có đánh giá
          </Text>
        ) : (
          detailRollCalls.map((item: DetailRollCall, index: number) => (
            <View key={index} className="w-[80%]  mx-auto">
              <TouchableOpacity
                onPress={() => goToDetailRollCall(item)}
                className=" bg-white pl-[4%]  rounded-2xl pt-1 pb-2 gap-y-1 mb-2 mt-1 px-[10%]"
              >
                <Text className="text-center text-gray-500">
                  Buổi {item.sessionNumber}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-mregular">Thời gian</Text>
                  <Text className="text-base font-msemibold  ml-2">
                    {formatNoWeekday(item.date)}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-mregular">Có mặt</Text>
                  <Text className="text-base font-msemibold  ml-2">
                    {item.presentStudents}/{totalStudent}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
