import { FC } from "react"
import { Text, View } from "react-native"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { FolderSyncIcon } from "@hugeicons/core-free-icons"
import { Button } from "./ui/button"

type THeaderProps = {
    title: string
}

export const Header: FC<THeaderProps> = (props) => {
    return (
        <View className="flex flex-row items-center h-10 justify-between px-2 w-full">
            <Text className="text-foreground">{props.title}</Text>
            <Button onPress={() => { }} icon={<HugeiconsIcon icon={FolderSyncIcon} size={18} color="white" />} size="sm" variant="ghost" />
        </View>
    )
}