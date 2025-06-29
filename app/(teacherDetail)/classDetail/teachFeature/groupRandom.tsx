import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import RatingLayout from "@/components/ui/ratingLayout";
import ButtonCustom from "@/components/ui/ButtonCustom";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import SliderCustom from "@/components/ui/SliderCustom";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { localHost } from "@/utils/localhost";
import { useLocalSearchParams } from "expo-router";
import { AuthContext } from "@/context/AuthContext";
import get from "@/utils/get";
import post from "@/utils/post";
import Loading from "@/components/ui/Loading";
import { formatNoWeekday } from "@/utils/formatDate";
import Feather from "@expo/vector-icons/Feather";
import deleteApi from "@/utils/delete";

type Student = {
  id: string;
  userCode: string;
  name: string;
  isAdd: boolean;
};
type Group = {
  id: string;
  name: string;
  members: Student[];
  admin?: string;
};

export default function GroupRandom() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    Alert.alert("Thông báo", "Đã xảy ra lỗi");
    return;
  }
  const [loading, setLoading] = useState(false);
  const { accessToken, user } = authContext;
  const { attendId, date, subjectId, name, code } = useLocalSearchParams();
  const router = useRouter();
  const [pickRandomVisible, setPickRandomVisible] = useState<boolean>(false);
  const [randomReviewVisible, setRandomReviewVisible] = useState<boolean>(false);
  const [addGroupVisible, setAddGroupVisible] = useState<boolean>(false);
  const [listGroup, setListGroup] = useState<Group[]>([]);
  const [groupRandom, setGroupRandom] = useState<string>("");
  const [listGroupRandom, setListGroupRandom] = useState<
    { group: string; review: string }[]
  >([]);
  const [listCouple, setListCouple] = useState<
    { group: string; reviewedBy: string }[]
  >([]);
  const [numberOfGroup, setNumberOfGroup] = useState<string>("");
  const pickRandom = () => {
    if (listGroup.length == 0) return;
    const randomIndex = Math.floor(Math.random() * listGroup.length);
    setGroupRandom(listGroup[randomIndex].name);
    setPickRandomVisible(true);
  };
  const randomReview = () => {
    setListCouple([]);
    setListGroupRandom([]);
    if (listGroup.length == 0) return;
    let temp = [...listGroup];
    const listGroupRandom: any[] = [];
    const listCouple = listGroup.map((item) => {
      const listReview = temp.filter(
        (groupReview) => groupReview.id !== item.id
      ); //bo nhom minh
      const randomIndex = Math.floor(Math.random() * listReview.length);
      listGroupRandom.push({
        group: item.name,
        review: listReview[randomIndex].name,
      });
      temp = temp.filter((item) => item.id !== listReview[randomIndex].id);
      const couple = {
        group: item.id,
        reviewedBy: listReview[randomIndex].id,
      };
      return couple;
    });
    setListGroupRandom(listGroupRandom);
    setListCouple(listCouple);
    setRandomReviewVisible(true);
  };
  const sendNotification = async () => {
    setLoading(true);
    const response = await post({
      url: `${localHost}/api/v1/group/crossPairs`,
      token: accessToken,
      data: {
        pairs: listCouple,
      },
    });
    if (response) {
      if (response.status == 200) {
        setRandomReviewVisible(false);
        Alert.alert("Thông báo", "Gửi thông báo thành công");
      } else {
        Alert.alert("Thông báo", "Gửi thông báo thất bại");
      }
    }
    setLoading(false);
  };
  const createGroup = async () => {
    setLoading(true);
    if (numberOfGroup == "" || numberOfGroup == "0") {
      return;
    }
    const response = await post({
      url: `${localHost}/api/v1/group/random/create`,
      token: accessToken,
      data: {
        cAttendId: attendId,
        numberOfGroup: numberOfGroup,
      },
    });
    if (response) {
      if (response.status == 201) {
        const groups = response.data.groups;
        setListGroup(
          groups.map((item: any) => ({
            id: item._id,
            name: item.name,
            members: item.members,
            admin: item?.admin || "",
          }))
        );
        setAddGroupVisible(false);
      } else {
        Alert.alert("Thông báo", response.data.message);
      }
    }
    setLoading(false);
  };
  const redirectToGroupChat = (group: Group) => {
    router.push({
      pathname: "/(teacherDetail)/classDetail/teachFeature/groupChat",
      params: { subjectId, name, code, group: JSON.stringify(group) },
    });
  };
  const deleteGroup = async () => {
    if (listGroup.length == 0) {
      Alert.alert("Thông báo", "Không có nhóm nào để xóa");
      return;
    }
    Alert.alert("Thông báo", "Bạn có chắc chắn muốn xóa những nhóm này không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        onPress: async () => {
          setLoading(true);
          const response = await deleteApi({
            url: `${localHost}/api/v1/group/randoms/${attendId}`,
            token: accessToken,
          });
          if (response) {
            if (response.status == 200) {
              Alert.alert("Thông báo", "Xóa nhóm thành công");
              setListGroup([]);
            } else {
              Alert.alert("Thông báo", "Xóa nhóm thất bại");
            }
          }
          setLoading(false);
        },
      },
    ]);
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await get({
        url: `${localHost}/api/v1/group/random/all/${attendId}`,
        token: accessToken,
      });
      if (response) {
        const groups = response.data.groups;
        setListGroup(
          groups.map((item: any) => ({
            id: item._id,
            name: item.name,
            members: item.members,
            admin: item?.admin || "",
          }))
        );
      }
    };
    fetchData();
  }, []);
  return (
    <SafeAreaView className="flex-1">
      <Loading loading={loading} />
      <View className=" shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center ">
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="chevron-back-sharp" size={24} color="white" />
        </TouchableOpacity>
        <View className="mx-auto items-center">
          <Text className="text-[18px] font-msemibold uppercase text-white">
            Chia nhóm
          </Text>
          <Text className="mt-[-3px] text-white font-mmedium">
            {formatNoWeekday(date)}
          </Text>
        </View>
        {listGroup.length > 0 && (
          <TouchableOpacity onPress={deleteGroup}>
            <Feather name="trash-2" size={24} color="red" />
          </TouchableOpacity>
        )}
      </View>
      {listGroup.length == 0 && (
        <View className=" justify-center items-center mt-[10%]">
          <Text className="text-center font-medium text-base mt-2 text-gray-400">
            Hãy bắt đầu chia nhóm
          </Text>
          <ButtonCustom
            content="Chia nhóm"
            handle={() => {
              setAddGroupVisible(true);
              setNumberOfGroup("");
            }}
            otherStyle="mt-[5%] w-[50%]"
          />
        </View>
      )}
      {listGroup.length > 0 && (
        <View>
          <View>
            <Text className="text-center font-semibold text-base mt-2">
              Danh sách nhóm
            </Text>
          </View>
          <ScrollView className="mt-2">
            {listGroup.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => redirectToGroupChat(item)}
                className="w-[90%] bg-white rounded-xl mx-auto px-5 pt-2 pb-3 mb-3"
              >
                <Text className="font-semibold text-base">{item.name}</Text>
                {item.members.map((member, index) => (
                  <Text key={index} className={`text-base mt-[2px] ${member.id === item.admin ? "text-red" : ""}`}>
                    {index + 1}. {member.userCode} - {member.name}
                  </Text>
                ))}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {listGroup.length > 0 && (
        <View className="flex-row mt-auto mb-3 ">
          <ButtonCustom
            handle={pickRandom}
            content="Ngẫu nhiên"
            otherStyle="w-[40%]"
          />
          <ButtonCustom
            handle={randomReview}
            content="Chấm chéo"
            otherStyle="w-[40%]"
          />
        </View>
      )}
      {/* modal chọn 1 ngẫu nhiên */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={pickRandomVisible}
        onRequestClose={() => setPickRandomVisible(false)}
      >
        <View
          className="flex-1 justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <TouchableOpacity
            className="ml-auto mr-3 -mb-1"
            onPress={() => setPickRandomVisible(false)}
          >
            <Ionicons name="close" size={26} color="red" />
          </TouchableOpacity>
          <View className="mt-2 bg-white p-2 rounded-xl w-[85%] mx-auto px-4">
            <Text className="text-xl font-semibold text-center">
              Ngẫu nhiên
            </Text>
            <Text className="text-base mt-2 text-center">Chúc mừng</Text>
            <Text className="text-xl font-semibold text-center text-blue_primary">
              {groupRandom}
            </Text>
            <Text className="text-base  text-center">đã được chọn</Text>
          </View>
        </View>
      </Modal>
      {/* modal chấm chéo */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={randomReviewVisible}
        onRequestClose={() => setRandomReviewVisible(false)}
      >
        <View
          className="flex-1 justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <TouchableOpacity
            className="ml-auto mr-3 -mb-1"
            onPress={() => setRandomReviewVisible(false)}
          >
            <Ionicons name="close" size={26} color="red" />
          </TouchableOpacity>
          <View className="mt-2 bg-white p-2 rounded-xl w-[80%] mx-auto px-4">
            <Text className="text-xl font-semibold text-center mb-2">
              Chấm chéo
            </Text>
            <ScrollView className="max-h-[240px]">
              {listGroupRandom.map((item, index) => (
                <Text key={index} className="text-base text-center">
                  {item.group} - {item.review}
                </Text>
              ))}
            </ScrollView>
            <ButtonCustom
              handle={sendNotification}
              content="Gửi thông báo"
              otherStyle="mt-4 mb-1 w-[60%]"
            />
          </View>
        </View>
      </Modal>
      {/* modal thêm nhóm */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={addGroupVisible}
        onRequestClose={() => setAddGroupVisible(false)}
      >
        <View
          className="flex-1 justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <TouchableOpacity
            className="ml-auto mr-3 -mb-1"
            onPress={() => setAddGroupVisible(false)}
          >
            <Ionicons name="close" size={26} color="red" />
          </TouchableOpacity>
          <View className="mt-2 bg-white p-2 rounded-xl w-[80%] mx-auto px-4 pb-3">
            <Text className="text-xl font-semibold text-center">Chia nhóm</Text>
            <Text className="mt-1">Số lượng nhóm</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-1 pl-2 mt-2"
              placeholder="Nhập số lượng nhóm"
              keyboardType="numeric"
              value={numberOfGroup.toString()}
              onChangeText={(text) => {
                const number = parseInt(text);
                if (isNaN(number) || number <= 0) {
                  setNumberOfGroup("");
                }
                if (!number) {
                  setNumberOfGroup("");
                } else {
                  setNumberOfGroup(number.toString());
                }
              }}
            />
            <ButtonCustom
              handle={createGroup}
              otherStyle="mt-4"
              content="Chia nhóm"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
