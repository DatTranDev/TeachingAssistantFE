import { View, Text } from "react-native";
import React from "react";
type Props = {
    field: string | undefined;
    value: string | undefined;
    customStyle?: string;
}

export default function LinearField({field, value, customStyle}:Props) {
    return(
        <View className={`flex-row mb-2`}>
            <Text className={`font-bold text-base ` + customStyle}>{field}</Text>
            <Text className={`text-base ml-2 max-w-[240px] ` + customStyle}>{value}</Text>
        </View>
    )
}