import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, Modal, Alert } from "react-native";
import { Ionicons, FontAwesome6, Foundation, Feather, AntDesign } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import ButtonCustom from "@/components/ui/ButtonCustom";
import { useContext, useEffect, useState } from "react";
import { colors } from "@/constants/colors";
import { localHost } from "@/utils/localhost";
import get from "@/utils/get";
import { AuthContext } from "@/context/AuthContext";
import post from "@/utils/post";
import Loading from "@/components/ui/Loading";
type Student = {
  id: string;
  userCode: string;
  name: string;
  isAdd: boolean;
};
type Group={
  id: string;
  name: string;
  members: Student[];
  admin?: string;
}
export default function GroupManager() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    Alert.alert("Thông báo", "Đã xảy ra lỗi");
    return;
  }
  const { user, accessToken } = authContext;
  const { code, name, subjectId } = useLocalSearchParams();
  const [addGroupVisible, setAddGroupVisible] = useState(false);
  const [addMemberVisible, setAddMemberVisible] = useState(false);
  const [listStudent, setListStudent] = useState<Student[]>([]);
  const [listAddMember, setListAddMember] = useState<Student[]>([]);
  const [pickRandomVisible, setPickRandomVisible]= useState<boolean>(false);
  const [randomReviewVisible, setRandomReviewVisible]= useState<boolean>(false);
  const [listGroup, setListGroup]= useState<Group[]>([]);
  const [groupRandom, setGroupRandom]= useState<string>("");
  const [listGroupRandom, setListGroupRandom]= useState<{group:string,review:string}[]>([]);
  const [listCouple, setListCouple]= useState<{group:string,reviewedBy:string}[]>([]);
  const [isLoading, setIsLoading]= useState<boolean>(false);

  const checkAdd = (item: Student) => {
    if (!item.isAdd) {
      setListAddMember([...listAddMember, item]);
    } else {
      setListAddMember(
        listAddMember.filter((student) => student.id !== item.id)
      );
    }
    setListStudent(listStudent.map((student) => student.id === item.id ? { ...student, isAdd: !student.isAdd } : student));
    
  };
  const pickRandom = () => {
    if(listGroup.length==0) return;
    const randomIndex = Math.floor(Math.random() * listGroup.length);
    setGroupRandom(listGroup[randomIndex].name);
    setPickRandomVisible(true);
  };
  const randomReview = () => {
    setListCouple([])
    setListGroupRandom([])
    if(listGroup.length==0) return;
    let temp=[...listGroup]
    const listGroupRandom : any[]=[]
    const listCouple=listGroup.map((item)=>{
      const listReview = temp.filter((groupReview)=>groupReview.id!==item.id)//bo nhom minh
      const randomIndex = Math.floor(Math.random() *  listReview.length);
      listGroupRandom.push({ group: item.name, review: listReview[randomIndex].name,});
      temp=temp.filter((item)=>item.id!==listReview[randomIndex].id)
      const couple = { group: item.id, reviewedBy: listReview[randomIndex].id };
      return couple
    })
    setListGroupRandom(listGroupRandom)
    setListCouple(listCouple)
    setRandomReviewVisible(true)
  };
  const sendNotification = async () => {
    setIsLoading(true)
    const response = await post({
      url: `${localHost}/api/v1/group/crossPairs`,
      token: accessToken,
      data: {
        pairs: listCouple,
      },
    });
    if( response ){
      if(response.status==200){
        setRandomReviewVisible(false)
        Alert.alert("Thông báo", "Gửi thông báo thành công");
      }else{
        Alert.alert("Thông báo", "Gửi thông báo thất bại");
      }
    }
    setIsLoading(false)
  }
  const redirectToGroupChat = (group: Group) => {
    router.push({
      pathname: "/(teacherDetail)/classDetail/teachFeature/groupChat",
      params: { code, name, subjectId, group: JSON.stringify(group) },
    });
  };
  useEffect(() => {
    const fetchData = async () => {
      const response = await get({
        url: `${localHost}/api/v1/group/default/all/${subjectId}`,
        token: accessToken,
      });
      if (response) {
        const groups = response.data.groups
        setListGroup(groups.map((item:any)=>({
          id: item._id,
          name: item.name,
          members: item.members,
          admin: item?.admin || "",
        })))
      }
    };
    fetchData();
  }, []);
  return (
    <SafeAreaView className="flex-1">
      <Loading loading={isLoading} />
      <View className=" shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center ">
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="chevron-back-sharp" size={24} color="white" />
        </TouchableOpacity>
        <View className="mx-auto items-center pr-6">
          <Text className="text-[18px] font-msemibold uppercase text-white">
            {code}
          </Text>
          <Text className="mt-[-3px] text-white font-mmedium">
            Nhóm cố định
          </Text>
        </View>
      </View>
      <View>
        {/* <ButtonCustom
          content="Thêm nhóm"
          handle={() => setAddGroupVisible(true)}
          otherStyle="mt-[5%] w-[50%]"
        /> */}
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
          <View className="mt-2 bg-white p-2 rounded-xl w-[90%] mx-auto px-4">
            <Text className="text-base font-semibold text-center">
              Nhóm mới
            </Text>
            <View className="flex-row items-center">
              <Text className="text-base mr-1">Thành viên</Text>
              <TouchableOpacity onPress={() => setAddMemberVisible(true)}>
                <Ionicons name="add" size={24} color={colors.blue_primary} />
              </TouchableOpacity>
            </View>
            <View className="bg-gray-200 rounded-xl py-2 px-4 mt-2">
              <Text className="text-base">1. 22520266 - Hà Minh Đức</Text>
            </View>
            <ButtonCustom content="Tạo nhóm" otherStyle="mt-2 w-[40%]" />
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={addMemberVisible}
        onRequestClose={() => setAddMemberVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onPress={() => setAddMemberVisible(false)}
        >
          <View className="mt-2 bg-white p-2 rounded-xl w-[90%] mx-auto px-4">
            <Text className="text-base font-semibold text-center">
              Thêm thành viên
            </Text>
            <ScrollView className="px-2">
              {listStudent.map((item, index) => (
                <View
                  key={index}
                  className="bg-white rounded-md py-3 pl-4 mt-2 mb-1 flex-row justify-between"
                >
                  <Text
                    numberOfLines={1}
                    className="text-base text-[15px] font-mregular flex-1"
                  >
                    {index + 1}. {item.userCode} - {item.name}
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
            <ButtonCustom content="Tạo nhóm" otherStyle="mt-2 w-[40%]" />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
