import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useMemo } from "react";

interface PlayerAvatarProps {
  alt?: string;
}

const PlayerAvatar = ({ alt }: PlayerAvatarProps) => {
  const seed = useMemo(() => Math.random().toString(36).substring(2, 10), []);
  const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`;

  return (
    <Avatar>
      <AvatarImage src={avatarUrl} alt={alt || ""} />
      <AvatarFallback>XX</AvatarFallback>
    </Avatar>
  );
};

export default PlayerAvatar;
