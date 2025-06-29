import { SafeAreaView, View, TouchableOpacity, Text, Modal, TextInput, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useContext, useEffect } from "react";
import { Pressable } from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { formatDate, formatNoWeekday } from "@/utils/formatDate";
import ButtonCustom from "@/components/ui/ButtonCustom";
import { AuthContext } from "@/context/AuthContext";
import { localHost } from "@/utils/localhost";
import get from "@/utils/get";
import post from "@/utils/post";
import Loading from "@/components/ui/Loading";

type Props = {};

export default function Cancellation({}: Props) {
  const authContext = useContext(AuthContext);
    if (!authContext) {
      Alert.alert("Thông báo", "Đã xảy ra lỗi");
      return;
    }
  const [loading, setLoading] = React.useState(false);
  const [notification, setNotification] = React.useState<any>([]);
  const { user, accessToken } = authContext;
  const { code, subjectId } = useLocalSearchParams();
  const [date, setDate] = React.useState(new Date());
  const [reason, setReason] = React.useState("");
  const [openModal, setOpenModal] = React.useState(false);
  const chooseDate = () => {
    DateTimePickerAndroid.open({
      value: new Date(),
      onChange: (event, selectedDate) => {
        if (selectedDate) {
          setDate(selectedDate);
        }
      },
      mode: "date",
      is24Hour: true,
      minimumDate: new Date(),
    });
  }
  const createNotification = async () => {
    
    setLoading(true);
    const url = `${localHost}/api/v1/subject/notify/classCancel`;
    const data = {
      subjectId: subjectId,
      date: formatDate(date.toString()),
      reason: reason,
    }
    const response = await post({ url, data, token: accessToken });
    if (response) {
      if (response.status == 200) {
        setNotification(
          (prev: any) => [...prev, {
            id: Math.random().toString(),
            title: "Thông báo nghỉ học",
            content: `Thông báo nghỉ học vào ngày ${formatDate(date.toString())}. ${reason}`,
          }]
        );
        Alert.alert("Thông báo", "Đã gửi thông báo nghỉ học thành công");
      } else {
        Alert.alert("Thông báo", "Đã xảy ra lỗi, vui lòng thử lại sau !");
      }
    } else {
      Alert.alert("Thông báo", "Đã xảy ra lỗi, vui lòng thử lại sau !");
    }
    setLoading(false);
    setOpenModal(false);
  }
  const getData = async () => {
    const url = `${localHost}/api/v1/notification/classCancel/${subjectId}?limit=100&page=1`;
    const token = accessToken;
    const response = await get({ url, token });
    if (response) {
      if (response.status == 200) {
        setNotification(response.data.notifications);
      } else {
        Alert.alert("Thông báo", "Đã xảy ra lỗi, vui lòng thử lại sau !");
      }
    }
  }
  useFocusEffect(
      useCallback(() => {
        getData();
      }, [])
    );
  return (
    <SafeAreaView className="flex-1 relative">
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
          <View className="bg-white w-[90%] rounded-2xl px-4 py-4">
              <Text className="text-center font-bold text-xl">Thông báo nghỉ</Text>
              <Text className="text-center">{code}</Text>
              <Text className="">Ngày nghỉ</Text>
              <TouchableOpacity
                onPress={chooseDate}>
                <Text
                  className="border border-gray-300 rounded-lg px-4 py-2 mt-2 w-full"
                >{formatDate(date.toString())}</Text>
              </TouchableOpacity>
              <Text className="mt-4">Lý do</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-2 mt-2 w-full"
                placeholder="Nhập lý do"
                multiline
                value={reason}
                onChangeText={setReason}
                textAlignVertical="top"
                numberOfLines={4}>
              </TextInput>
              <ButtonCustom
                otherStyle="w-[50%] mt-4 mx-auto"
                content="Tạo"
                handle={createNotification}
              >
              </ButtonCustom>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Header */}
      <View className=" shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center ">
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="chevron-back-sharp" size={24} color="white" />
        </TouchableOpacity>
        <View className="mx-auto items-center pr-6">
          <Text className="text-[18px] font-msemibold uppercase text-white">
            {code}
          </Text>
          <Text className="mt-[-3px] text-white font-mmedium">Thông báo nghỉ học</Text>
        </View>
      </View>
      {/* Content */}
      <ScrollView className="flex-1 px-[4%] mb-[80px] mt-4">
        {notification.length > 0 ? (
          notification.map((item: any, index: number) => (
            <View
              key={index}
              className="bg-white pl-[4%] rounded-2xl py-3 mb-2 mt-1 px-[10%]"
            >
              <Text className="text-base font-semibold text-center">
                  {
                  (() => {
                    const match = item.content.match(/vào ngày (.*?)\./);
                    const dateText = match ? match[1] : "không rõ ngày";
                    return `${dateText}`;
                  })()
                  }
              </Text>
            </View>
          ))
        ) : (
          <View className="flex justify-center items-center mt-4">
            <Text className="text-gray-400">Không có thông báo</Text>
          </View>
        )}
      </ScrollView>
      {/* Button */}
      <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
        <ButtonCustom
          otherStyle="w-[50%]"
          content="Tạo thông báo"
          handle={() => setOpenModal(true)}>
        </ButtonCustom>
      </View>
    </SafeAreaView>
  );
}