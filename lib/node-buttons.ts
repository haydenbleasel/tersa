import { SiX } from "@icons-pack/react-simple-icons";
import {
  AudioWaveformIcon,
  CodeIcon,
  FileIcon,
  ImageIcon,
  TextIcon,
  VideoIcon,
} from "lucide-react";

export const nodeButtons = [
  {
    id: "text",
    label: "Text",
    icon: TextIcon,
  },
  {
    id: "image",
    label: "Image",
    icon: ImageIcon,
  },
  {
    id: "audio",
    label: "Audio",
    icon: AudioWaveformIcon,
  },
  {
    id: "video",
    label: "Video",
    icon: VideoIcon,
  },
  {
    id: "code",
    label: "Code",
    icon: CodeIcon,
    data: {
      content: { language: "javascript" },
    },
  },
  {
    id: "file",
    label: "File",
    icon: FileIcon,
  },
  {
    id: "tweet",
    label: "Tweet",
    icon: SiX,
  },
];
