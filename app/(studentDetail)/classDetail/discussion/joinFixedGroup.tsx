import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { AntDesign, Octicons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import InputLayout from "@/components/ui/inputLayout";
import ButtonCustom from "@/components/ui/ButtonCustom";
import post from "@/utils/post";
import { localHost } from "@/utils/localhost";
import { AuthContext } from "@/context/AuthContext";
import { ClassSession } from "@/app/(student)/timetable";
import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCameraPermissions } from "expo-image-picker";
import { Camera, CameraView } from "expo-camera";

import { Canvas, DiffRect, rect, rrect } from "@shopify/react-native-skia";
import { Dimensions, Platform, StyleSheet } from "react-native";
import Loading from "@/components/ui/Loading";
import { colors } from "@/constants/colors";
import get from "@/utils/get";

const { width, height } = Dimensions.get("window");

const innerDimension = 300;

const outer = rrect(rect(0, 0, width, height), 0, 0);
const inner = rrect(
  rect(
    width / 2 - innerDimension / 2,
    height / 2 - innerDimension / 2,
    innerDimension,
    innerDimension
  ),
  50,
  50
);

type Props = {};
type Student = {
  id: string;
  userCode: string;
  name: string;
  isAdd: boolean;
};
export default function JoinFixedGroup({}: Props) {
  const {subjectId, name : nameSubject, code : codeSubject} = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();

  const isPermissionGranted = Boolean(permission?.granted);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const [addGroupVisible, setAddGroupVisible] = useState(false);
  const [addMemberVisible, setAddMemberVisible] = useState(false);
  const [listStudent, setListStudent] = useState<Student[]>([]);
  const [listAddMember, setListAddMember] = useState<Student[]>([]);
  const [name, setName] = useState("");
  if (!authContext) {
    Alert.alert("Thông báo", "Đã xảy ra lỗi");
    return;
  }
  const qrScanModal = () => {
    return;
  };
  const { user, accessToken } = authContext;
  const [code, setCode] = useState("");
  const search = async () => {
    const url = `${localHost}/api/v1/group/join/${code}`;
    if (code) {
      const data = {
       
      };
      setLoading(true);
      const response = await post({ url, data, token: accessToken });
      setLoading(false);
      if (response) {
        if (response.status == 200) {
          Alert.alert("Thông báo", "Tham gia nhóm thành công");
          setCode("");
          router.replace({
            pathname: "/classDetail/discussion/fixedGroup",
            params: {
              subjectId: `${subjectId}`,
              name: `${nameSubject}`,
              code: `${codeSubject}`,
              group: JSON.stringify(response.data.group),
            },
          });
          return;
        }else{
          Alert.alert("Thông báo", response.data.error || "Đã có lỗi xảy ra !");
        }
        
      } else {
        Alert.alert("Thông báo", "Đã xảy ra lỗi");
      }
    }
  };
  const createGroup = async () => {
    setLoading(true);
    const url = `${localHost}/api/v1/group/create`;
    const data = {
      name: name,
      members: [user?.id, ...listAddMember.map((item) => item.id)],
      admin: user?.id,
      type: "default",
      subjectId: subjectId,
      autoAccept: true,
    };
    const response = await post({ url, data, token: accessToken });
    if (response) {
      if (response.status == 201) {
        const group = response.data.group;
        Alert.alert("Thông báo", "Tạo nhóm thành công");
        router.replace({
          pathname: "/classDetail/discussion/fixedGroup",
          params: {
            subjectId: `${subjectId}`,
            name: `${nameSubject}`,
            code: `${codeSubject}`,
            group: JSON.stringify(group),
          },
        });
      }else{
        Alert.alert("Thông báo", response.data.message);
      }
      
    }
    setLoading(false);
  };
  const checkAdd = (item: Student) => {
    if (!item.isAdd) {
      setListAddMember([...listAddMember, item]);
    } else {
      setListAddMember(
        listAddMember.filter((student) => student.id !== item.id)
      );
    }
    setListStudent(
      listStudent.map((student) =>
        student.id === item.id ? { ...student, isAdd: !student.isAdd } : student
      )
    );
  };
  useEffect(() => {
    const fetchData = async () => {
      const response = await get({
        url: `${localHost}/api/v1/subject/${subjectId}/students`,
        token: accessToken,
      });
      if (response) {
        let students = response.data.students
        students = students.filter((item: any) => item.id !== user?.id)

        setListStudent(students.map((item: any) => ({
          id: item._id,
          userCode: item.userCode,
          name: item.name,
          isAdd: false,
        })));
      }
    };
    fetchData();
  }, []);
  return (
    <SafeAreaView className="flex-1">
      <Loading loading={loading} />
      <View className=" pb-[3.5%]  border-b-[1px] border-gray-200 flex-row  pt-[13%] px-[4%] items-center bg-blue_primary ">
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="chevron-back-sharp" size={24} color="white" />
        </TouchableOpacity>
        <Text className="mx-auto text-[18px] font-msemibold uppercase text-white pr-1">
          Tham gia nhóm
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (!isPermissionGranted) {
              Alert.alert("Thông báo", "Vui lòng cấp quyền truy cập camera");
              requestPermission();
            }
            setModalVisible(true);
          }}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={22} color="white" />
        </TouchableOpacity>
      </View>
      <View>
        <Text className="text-base font-msemibold mt-[5%] -mb-5 ml-[16%]">
          Nhập mã nhóm
        </Text>
        <InputLayout
          placeHorder="683d336f9fdc6f9d1746868e"
          value={code}
          handle={setCode}
          style="w-[70%] "
        />
        <ButtonCustom
          content="Tham gia"
          otherStyle="w-[35%] mt-[7%]"
          handle={search}
        />
        <View className="flex-row items-center justify-center mt-2">
          <Text className="text-[15px] font-msemibold">
            hoặc tạo nhóm mới ?{" "}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setAddGroupVisible(true);
              setAddMemberVisible(false);
              setListAddMember([]);
            }}
            className=""
          >
            <Text className="text-[15px] font-msemibold text-blue_primary underline">
              Tạo mới
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={({ data }) => {
            if (data) {
              setCode(data);
              setTimeout(async () => {
                setModalVisible(false);
              }, 0);
              search();
            }
          }}
        />
        <Canvas
          style={
            Platform.OS === "android"
              ? { flex: 1 }
              : StyleSheet.absoluteFillObject
          }
        >
          <DiffRect inner={inner} outer={outer} color="black" opacity={0.5} />
        </Canvas>
      </Modal>
      {/* modal tạo nhóm mới */}
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
          <View className="mt-2 bg-white p-2 rounded-xl w-[90%] mx-auto px-4 pb-3">
            <Text className="text-xl font-semibold text-center">
              Nhóm mới
            </Text>
            <View className="mt-2">
              <Text className="text-base">Tên nhóm</Text>
              <TextInput
                placeholder="Nhập tên nhóm ..."
                value={name}
                onChangeText={setName}
                className="border-2 border-gray-300 rounded-md p-1 pl-2 mt-1"
              />
            </View>
            <View className="flex-row items-center mt-2">
              <Text className="text-base mr-1">Thành viên</Text>
              <TouchableOpacity onPress={() => setAddMemberVisible(true)}>
                <Ionicons name="add" size={24} color={colors.blue_primary} />
              </TouchableOpacity>
            </View>
            <ScrollView className="max-h-[250px] pb-4">
              <View className="bg-gray-200 rounded-xl py-2 px-4 mt-2">
                <Text className="text-base">
                  1. {user?.name} - {user?.userCode}
                </Text>
              </View>
              {listAddMember.map((item, index) => (
                <View
                  key={index}
                  className="bg-gray-200 rounded-xl py-2 px-4 mt-2"
                >
                  <Text className="text-base">
                    {index + 2}. {item.userCode} - {item.name}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <ButtonCustom
              handle={createGroup}
              content="Tạo nhóm"
              otherStyle="mt-3 w-[40%]"
            />
          </View>
        </View>
      </Modal>
      {/* modal thêm thành viên */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={addMemberVisible}
        onRequestClose={() => setAddMemberVisible(false)}
      >
        <View
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
        >
          <TouchableOpacity
            className="ml-auto mr-3 -mb-1"
            onPress={() => setAddMemberVisible(false)}
          >
            <Ionicons name="close" size={26} color="red" />
          </TouchableOpacity>
          <View className="mt-2 bg-white p-2 rounded-xl w-[90%] mx-auto px-4">
            <Text className="text-xl font-semibold text-center mb-2">
              Thêm thành viên
            </Text>
            <ScrollView className="px-0 h-[250px]">
              {listStudent.map((item, index) => (
                <View
                  key={index}
                  className="bg-white rounded-md py-1 pl-4 mb-1 flex-row justify-between"
                >
                  <Text
                    numberOfLines={1}
                    className="text-base text-[15px] font-mregular flex-1"
                  >
                    {item.userCode} - {item.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      checkAdd(item);
                    }}
                    className="-mb-4  p-1"
                  >
                    <View className="relative w-8 h-8">
                      <View
                        className="w-4 h-4 rounded-sm"
                        style={{
                          borderColor: item.isAdd
                            ? colors.blue_primary
                            : "black",
                          borderWidth: 1.2,
                        }}
                      ></View>
                      {item.isAdd && (
                        <View
                          className="absolute "
                          style={{
                            top: -7,
                            left: -3,
                          }}
                        >
                          <AntDesign
                            name="check"
                            size={26}
                            color={colors.blue_primary}
                          />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <ButtonCustom
              content="Thêm"
              otherStyle="mt-2 mb-1 w-[40%]"
              handle={() => setAddMemberVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
