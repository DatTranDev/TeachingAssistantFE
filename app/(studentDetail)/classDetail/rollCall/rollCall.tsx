import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { AuthContext } from "@/context/AuthContext";
import { localHost } from "@/utils/localhost";
import { useLocalSearchParams } from "expo-router";
import { SocketContext } from "@/context/SocketContext";
import get from "@/utils/get";
import * as Location from "expo-location";
import post from "@/utils/post";
import { formatDate, formatNoWeekday } from "@/utils/formatDate";
import Loading from "@/components/ui/Loading";
import { colors } from "@/constants/colors";
import { AntDesign } from "@expo/vector-icons";
type Props = {};
export type Attend = {
  id: string;
  date: string;
  status: string;
  sessionNumber: number;
  teacherLatitude: number;
  teacherLongitude: number;
  numberOfAttend: number;
  acceptedNumber: number;
  listStatus: {
    [key: number]: string;
  };
  timeExpired: number;
};
export default function RollCall({}: Props) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    Alert.alert("Thông báo", "Đã xảy ra lỗi");
    return;
  }
  const socketContext = useContext(SocketContext);
  const { subjectId, code } = useLocalSearchParams();
  const { accessToken, user, FCMToken } = authContext;
  const [attends, setAttends] = useState<Attend[]>([]);
  const [locationLongitude, setLocationLongitude] = useState<number>(0);
  const [locationLatitude, setLocationLatitude] = useState<number>(0);
  const [absent, setAbsent] = useState<number>(0);
  const [totalRollCall, setTotalRollCall] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalRollCallVisible, setModalRollCallVisible] =
    useState<boolean>(false);
  const [selectedAttend, setSelectedAttend] = useState<Attend | null>(null);
  const [isReload, setIsReload] = useState<number>(0);
  useEffect(() => {
    async function getData() {
      setLoading(true);
      const url = `${localHost}/api/v1/cAttend/findBySubject/${subjectId}`;
      const res = await get({ url: url, token: accessToken });
      const url2 = `${localHost}/api/v1/subject/${subjectId}/user/${user?.id}/attendRecords`;
      const res2 = await get({ url: url2, token: accessToken });

      if (res && res.status == 200 && res2 && res2.status == 200) {
        const listAttend = res.data.cAttends;
        const listRecord = res2.data.attendRecords;
        let totalRollCall = 0;
        let absent = 0;
        const data = listAttend
          .map((item: any) => {
            if (item.isActive) {
              totalRollCall++;
              let status = "";
              let listStatus: { [key: number]: string } = {};
              const record = listRecord.find(
                (record: any) => record.cAttendId.id == item.id
              );
              
              if (record) {
                record.listStatus.forEach((status: any) => {
                  listStatus[status.index] = status.status;
                });
                const number = record.listStatus.filter(
                  (item: any) => item.status == "CM"
                ).length;
                if (record.status == "CP") {
                  status = "Vắng có phép";
                } else if (
                  (!listStatus[item.numberOfAttend] || listStatus[item.numberOfAttend] == "KP") &&
                  item.timeExpired > 0
                ) {
                  status = "Chưa điểm danh";
                } else {
                  status = `Đã điểm danh ${number}/${item.numberOfAttend}`;
                  if (number < item.acceptedNumber) {
                    absent++;
                  }
                }
              } else {
                if (item.timeExpired > 0) {
                  status = "Chưa điểm danh";
                } else {
                  status = `Đã điểm danh 0/${item.numberOfAttend}`;
                  absent++;
                }
              }
              return {
                id: item.id,
                date: item.date,
                status: status,
                sessionNumber: item.sessionNumber,
                teacherLatitude: item.teacherLatitude,
                teacherLongitude: item.teacherLongitude,
                numberOfAttend: item.numberOfAttend || 0,
                acceptedNumber: item.acceptedNumber || 0,
                listStatus: listStatus,
                timeExpired: item.timeExpired,
              };
            }
            return null; // Trả về null nếu item không active
          })
          .filter((item: any) => item !== null)
          .sort((a: Attend, b: Attend) => b.sessionNumber - a.sessionNumber); // Lọc bỏ các item null và sắp xếp giảm dần theo ngày
        setAttends(data);
        setAbsent(absent);
        setTotalRollCall(totalRollCall);
      }
      setLoading(false);
    }
    getData();
  }, [isReload]);
  //Connect to socket
  useEffect(() => {
    if (socketContext) {
      console.log("socket: ", socketContext.socket.id);
      const { socket } = socketContext;
      if (socket) {
        socket.emit("joinSubject", { userID: user?.id, subjectID: subjectId });
        socket.on("receiveAttendance", (dataMsg: any) => {
          const newAttend = dataMsg.cAttend;
          setAttends((prev) => {
            let newAttends = prev.map((item) => {
              if (item.id === newAttend.id) {
                return {
                  ...item,
                  ...newAttend,
                };
              }
              return item;
            });

            // If the new attendance record does not exist in the current state, add it
            const isExisting = prev.some((item) => item.id === newAttend.id);
            if (!isExisting) {
              setTotalRollCall(totalRollCall + 1);
              newAttends.unshift({
                ...newAttend,
                listStatus: {},
              });
            }

            return newAttends;
          });
        });
      }
    }
    return () => {
      if (socketContext) {
        const { socket } = socketContext;
        if (socket) {
          socket.emit("leaveSubject", {
            userID: user?.id,
            subjectID: subjectId,
          });
          socket.off("receiveAttendance");
        }
      }
    };
  }, [socketContext]);
  const router = useRouter();
  const getStatusColor = (status: string) => {
  if (status.includes('Vắng có phép')) return 'text-orange-500';
  if (status.includes('Vắng không phép')) return 'text-red-500';

  const match = status.match(/Đã điểm danh (\d+)\/(\d+)/);
  if (match) {
    const [_, attended, total] = match.map(Number);
    if (attended === 0 || attended < total) return 'text-yellow-500';
    if (attended === total) return 'text-green';
  }

  return 'text-gray-600'; // default fallback
};
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Thông báo", "Cần cấp quyền truy cập vị trí để điểm danh");
      return null;
    }
    let currentLocation = await Location.getCurrentPositionAsync({});
    return {
      longitude: currentLocation.coords.longitude,
      latitude: currentLocation.coords.latitude,
    };
  };

  const clickRollCall = async (attend: Attend | null, index: number) => {
    if(!attend || index!==attend.numberOfAttend || attend.timeExpired==0){
      return;
    }
    setLoading(true);
    let location = null;
    if (attend.teacherLatitude == 0 && attend.teacherLongitude == 0) {
      location = {
        longitude: 0,
        latitude: 0,
      };
    } else {
      location = await getLocation();
    }
    if (!location) {
      setLoading(false);
      Alert.alert("Thông báo", "Đã xảy ra lỗi khi lấy vị trí");
      return;
    }

    if (attend.status == "Chưa điểm danh") {
      const url = `${localHost}/api/v1/cAttend/attendrecord/add`;
      const data = {
        cAttendId: attend.id,
        studentId: user?.id,
        studentLatitude: location.latitude,
        studentLongitude: location.longitude,
        FCMToken: FCMToken,
        index: index,
      };
      const res = await post({ url: url, token: accessToken, data: data });
      if (res) {
        if (res.status == 201 || res.status == 200) {
          const record = res.data.attendRecord;
          if (
            record.listStatus.find(
              (item: any) => item.index == index && item.status == "CM"
            )
          ) {
            setIsReload(isReload + 1);
            if (socketContext?.socket) {
              socketContext.socket.emit("sendAttendance", {
                subjectID: subjectId,
                student: user?.id,
                index: index,
                status: record.status,
              });
            }
            Alert.alert("Thông báo", "Điểm danh thành công");
            setModalRollCallVisible(false);
          } else {
            Alert.alert("Thông báo", "Điểm danh không thành công");
          }
        } else {
          Alert.alert("Thông báo", `${res?.data?.message || "Đã xảy ra lỗi"}`);
        }
      }
    }
    setLoading(false);
  };
  const clickAbsent = async () => {
    router.push({
      pathname: "/classDetail/rollCall/absence",
      params: {
        subjectId: subjectId,
        code: code,
      },
    });
  };
  const checkPresent = (attend: Attend | null, index: number) => {
    if (!attend) {
      return "";
    }
    if (attend.listStatus[index] == "CM") {
      return "CM";
    } else if (
      (attend.listStatus[index] == "KP" ||
        !attend.listStatus[index]) &&
      attend.timeExpired > 0 &&
      index == attend.numberOfAttend
    ) {
      return "CDD";
    } else {
      return "KP";
    }
  };
  return (
    <View>
      <Loading loading={false} />
      <View className=" shadow-md  pb-[1.8%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center ">
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
      <View className="px-[6%] mt-[4%]">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-semibold">
            Danh sách các buổi học
          </Text>
          <TouchableOpacity onPress={clickAbsent}>
            <Text className="text-orange underline font-medium">Xin vắng</Text>
          </TouchableOpacity>
        </View>

        {attends.length > 0 && (
          <Text className="font-medium text-blue_primary -mt-[2px]">
            Đã vắng {absent}/{totalRollCall} buổi
          </Text>
        )}
      </View>

      <ScrollView className="mt-3">
        {attends.length == 0 ? (
          <View className="flex-1 items-center justify-center h-full">
            <Text className="text-gray-500">Không tìm thấy</Text>
          </View>
        ) : (
          attends.map((item, index) =>
            item.status == "Chưa điểm danh" ? (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedAttend(item);
                  setModalRollCallVisible(true);
                }}
                className="flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3"
              >
                <View className="mx-auto items-center justify-center">
                  <Text>
                    Buổi {item.sessionNumber} - {formatNoWeekday(item.date)}
                  </Text>
                  <Text className="text-[#FE3535] text-base font-mmedium mt-1">
                    Chưa điểm danh
                  </Text>
                </View>
                <FontAwesome6 name="exclamation" size={22} color="#FE3535" />
              </TouchableOpacity>
            ) : item.status.includes("Đã điểm danh") ? (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedAttend(item);
                  setModalRollCallVisible(true);
                }}> 
                <View
                key={index}
                className="flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3"
              >
                <View className="mx-auto items-center justify-center">
                  <Text>
                    Buổi {item.sessionNumber} - {formatNoWeekday(item.date)}
                  </Text>
                  <Text className={`text-base font-medium mt-1 ${getStatusColor(item.status)}`}>
  {item.status}
</Text>
                </View>
              </View>
              </TouchableOpacity>
            ) : (
              <View
                key={index}
                className="flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3"
              >
                <View className="mx-auto items-center justify-center">
                  <Text>
                    Buổi {item.sessionNumber} - {formatNoWeekday(item.date)}
                  </Text>
                  <Text className="text-orange text-base font-mmedium mt-1">
                    Vắng có phép
                  </Text>
                </View>
              </View>
            )
          )
        )}
      </ScrollView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalRollCallVisible}
        onRequestClose={() => {
          setModalRollCallVisible(false);
        }}
      >
        <View
          className="relative p-0 m-0 w-full h-full"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
        >
          <View className="bg-white rounded-lg p-2 w-[80%] mx-auto my-auto relative pb-4">
            <TouchableOpacity
              onPress={() => setModalRollCallVisible(false)}
              className="absolute -top-7 -right-3 p-1"
            >
              <AntDesign name="close" size={23} color="red" />
            </TouchableOpacity>
            <Text className="text-center font-msemibold text-base mb-1">
              {formatDate(selectedAttend?.date || "")}
            </Text>
            <View>
              {Array.from({ length: selectedAttend?.numberOfAttend || 0 }).map(
                (item, index) => (
                  <View
                    key={index}
                    className="flex-row bg-gray-100 w-[90%] mx-auto rounded-lg justify-between mt-2 pl-3 py-2 items-center"
                  >
                    <Text className="font-mmedium">Lần {index + 1}</Text>
                    <TouchableOpacity onPress={() => clickRollCall(selectedAttend, index + 1)}>
                      <View className=" -mb-4  p-1">
                        <View className="relative w-8 h-8">
                          <View
                            className="w-4 h-4 rounded-sm"
                            style={{
                              borderColor:
                                checkPresent(selectedAttend, index + 1) == "CM"
                                  ? "green"
                                  : checkPresent(selectedAttend, index + 1) ==
                                    "CDD"
                                  ? "black"
                                  : "red",
                              borderWidth: 1.2,
                            }}
                          />
                          {checkPresent(selectedAttend, index + 1) == "CM" && (
                            <View
                              className="absolute "
                              style={{
                                top: -7,
                                left: -3,
                              }}
                            >
                              <AntDesign name="check" size={26} color="green" />
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                )
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
