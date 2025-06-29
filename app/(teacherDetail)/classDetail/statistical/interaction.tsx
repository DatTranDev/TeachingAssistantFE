import React, { useState, useContext } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import RatingLayout from "@/components/ui/ratingLayout";
import SliderCustom from "@/components/ui/SliderCustom";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { localHost } from "@/utils/localhost";
import { useLocalSearchParams } from "expo-router";
import { AuthContext } from "@/context/AuthContext";
import get from "@/utils/get";
import Loading from "@/components/ui/Loading";
import StudentStatScreen from "@/components/ui/StudentStatScreen";
import { formatNoWeekday } from "@/utils/formatDate";

type Props = {};
//topAbsentStudents
type TopReactor = {
    totalReactions: number;
    user: {
        _id: string;
        name: string;
        email: string;
    }
}
type TopParticipant = {
    totalDiscussions: number;
    user: {
        _id: string;
        name: string;
        email: string;
    }
}
type TopReviewer = {
    reviewCount: number;
    user: {
        _id: string;
        name: string;
        email: string;
    }
}
export default function Review({ }: Props) {
    const authContext = useContext(AuthContext);
    if (!authContext) {
        Alert.alert("Thông báo", "Đã xảy ra lỗi");
        return;
    }
    const [data, setData] = useState([]);
    const [topReactors, setTopReactors] = useState<TopReactor[]>([]);
    const [topReviewers, setTopReviewers] = useState<TopReviewer[]>([]);
    const [topParticipants, setTopParticipants] = useState<TopParticipant[]>([]);
    const [loading, setLoading] = useState(false);
    const { accessToken, user } = authContext;
    const { attendId, date, code, subjectId } = useLocalSearchParams();
    const getTopReactors = async () => {
        const url = `${localHost}/api/v1/subject/top-reactors/${subjectId}?top=10`;
        const token = accessToken;
        setLoading(true);
        const response = await get({ url, token });
        setLoading(false);
        if (response) {
            if (response.status === 200) {
                const data = response.data;
                setTopReactors(data.topReactors ? data.topReactors : []);
            } else {
                Alert.alert("Thông báo", "Đã xảy ra lỗi");
            }
        } else {
            Alert.alert("Thông báo", "Đã xảy ra lỗi");
        }
    };
    const getTopParticipants = async () => {
        const url = `${localHost}/api/v1/subject/top-participants/${subjectId}?top=10`;
        const token = accessToken;
        setLoading(true);
        const response = await get({ url, token });
        setLoading(false);
        if (response) {
            if (response.status === 200) {
                const data = response.data;
                setTopParticipants(data.topParticipants ? data.topParticipants : []);
            } else {
                Alert.alert("Thông báo", "Đã xảy ra lỗi");
            }
        } else {
            Alert.alert("Thông báo", "Đã xảy ra lỗi");
        }
    };
    const getTopReviewers = async () => {
        const url = `${localHost}/api/v1/subject/top-reviewers/${subjectId}?top=10`;
        const token = accessToken;
        setLoading(true);
        const response = await get({ url, token });
        setLoading(false);
        if (response) {
            if (response.status === 200) {
                const data = response.data;
                setTopReviewers(data.topReviewers ? data.topReviewers : []);
            } else {
                Alert.alert("Thông báo", "Đã xảy ra lỗi");
            }
        } else {
            Alert.alert("Thông báo", "Đã xảy ra lỗi");
        }
    }
    useFocusEffect(
        React.useCallback(() => {
            getTopReactors();
            getTopParticipants();
            getTopReviewers();
        }, [])
    );
    const router = useRouter();
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView className="flex-1">
                <Loading loading={loading} />
                <View className=" shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center ">
                    <TouchableOpacity onPress={router.back}>
                        <Ionicons name="chevron-back-sharp" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="mx-auto items-center pr-6">
                        <Text className="text-[18px] font-msemibold uppercase text-white">
                            {code}
                        </Text>
                        <Text className="mt-[-3px] text-white font-mmedium">Thống kê tương tác</Text>
                    </View>
                </View>
                <StudentStatScreen
                    topParticipants={topParticipants}
                    topReviewers={topReviewers}
                    topReactors={topReactors}
                />
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}
